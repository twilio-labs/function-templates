const { setupResourcesIfRequired } = require('../assets/setup.private');

const MESSAGING_SERVICE_SID = 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const BROADCAST_NOTIFY_SERVICE_SID = 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const VERIFY_SERVICE_SID = 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TWILIO_PHONE_NUMBER = '+12223334444';
const PHONE_NUMBER_SID = 'PNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const SERVICE_SID = 'ZSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const ENVIRONMENT_SID = 'ZEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

const mockMessagingServiceOptions = {
  phoneNumbers: {
    list: jest.fn().mockReturnValue(Promise.resolve([])),
    create: jest
      .fn()
      .mockReturnValue(Promise.resolve({ sid: PHONE_NUMBER_SID })),
  },
};
const mockMessagingService = jest.fn(() => {
  return mockMessagingServiceOptions;
});
mockMessagingService.create = jest
  .fn()
  .mockReturnValue(Promise.resolve({ sid: MESSAGING_SERVICE_SID }));
mockMessagingService.list = jest.fn().mockReturnValue(Promise.resolve([]));

const mockServerlessEnvironmentOptions = {
  variables: {
    create: jest.fn().mockReturnValue(Promise.resolve({})),
    list: jest.fn().mockReturnValue(
      Promise.resolve([
        {
          key: 'TWILIO_PHONE_NUMBER',
          value: TWILIO_PHONE_NUMBER,
        },
        {
          key: 'MESSAGING_SERVICE_SID',
          value: MESSAGING_SERVICE_SID,
        },
      ])
    ),
  },
};

const mockServerlessServiceOptions = {
  environments: jest.fn().mockReturnValue(mockServerlessEnvironmentOptions),
};

const mockClient = {
  verify: {
    services: {
      create: jest.fn().mockReturnValue({ sid: VERIFY_SERVICE_SID }),
    },
  },
  serverless: {
    services: jest.fn().mockReturnValue(mockServerlessServiceOptions),
  },
  messaging: {
    services: mockMessagingService,
  },
  notify: {
    services: {
      create: jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ sid: BROADCAST_NOTIFY_SERVICE_SID })
        ),
    },
  },
  incomingPhoneNumbers: {
    list: jest
      .fn()
      .mockReturnValue(
        Promise.resolve([
          { sid: PHONE_NUMBER_SID, phoneNumber: TWILIO_PHONE_NUMBER },
        ])
      ),
  },
};

const localContext = {
  getTwilioClient: () => mockClient,
  SERVICE_SID: undefined,
  ENVIRONMENT_SID: undefined,
};
const context = {
  ...localContext,
  SERVICE_SID,
  ENVIRONMENT_SID,
};

describe('verified-broadcast/setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return in local development with no setup', async () => {
    const result = await setupResourcesIfRequired(localContext);
    expect(result).toBeFalsy();
  });

  test('should return an error if no phone number is present', async () => {
    const result = await setupResourcesIfRequired(context);
    expect(result).toBeFalsy();
  });

  test('creates relative resources with a phone number', async () => {
    const result = await setupResourcesIfRequired({
      ...context,

      TWILIO_PHONE_NUMBER,
    });
    expect(result).toBeTruthy();
    expect(mockMessagingService.create).toHaveBeenCalledTimes(1);
    expect(mockClient.notify.services.create).toHaveBeenCalledTimes(1);
    expect(mockClient.verify.services.create).toHaveBeenCalledTimes(1);
  });

  test('handles existing verify service', async () => {
    const result = await setupResourcesIfRequired({
      ...context,

      TWILIO_PHONE_NUMBER,
      VERIFY_SERVICE_SID,
    });
    expect(result).toBeTruthy();
    expect(mockMessagingService.create).toHaveBeenCalledTimes(1);
    expect(mockClient.notify.services.create).toHaveBeenCalledTimes(1);
    expect(mockClient.verify.services.create).toHaveBeenCalledTimes(0);
  });

  test('handles existing notify service', async () => {
    const result = await setupResourcesIfRequired({
      ...context,

      TWILIO_PHONE_NUMBER,
      BROADCAST_NOTIFY_SERVICE_SID,
    });
    expect(result).toBeTruthy();
    expect(mockMessagingService.create).toHaveBeenCalledTimes(0);
    expect(mockClient.notify.services.create).toHaveBeenCalledTimes(0);
    expect(mockClient.verify.services.create).toHaveBeenCalledTimes(1);
  });
});
