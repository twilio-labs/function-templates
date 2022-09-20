const helpers = require('../../test/test-helper');

const mockSyncMapItem = {
  fetch: jest.fn(() =>
    Promise.resolve({
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      createdBy: 'created_by',
      data: {
        status: 'pending',
      },
      dateExpires: '2015-07-30T21:00:00Z',
      dateCreated: '2015-07-30T20:00:00Z',
      dateUpdated: '2015-07-30T20:00:00Z',
      key: '+14085040458',
      mapSid: 'MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      revision: 'revision',
      serviceSid: 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      url: 'https://sync.twilio.com/v1/Services/ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Maps/MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Items/key',
    })
  ),
  update: jest.fn(() =>
    Promise.resolve({
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      createdBy: 'created_by',
      data: {
        status: 'verified',
      },
      dateExpires: '2015-07-30T21:00:00Z',
      dateCreated: '2015-07-30T20:00:00Z',
      dateUpdated: '2015-07-30T20:00:00Z',
      key: '+14085040458',
      mapSid: 'MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      revision: 'revision',
      serviceSid: 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      url: 'https://sync.twilio.com/v1/Services/ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Maps/MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Items/key',
    })
  ),
  remove: jest.fn(() => Promise.resolve()),
};

const mockSyncMap = {
  syncMapItems: jest.fn(() => mockSyncMapItem),
};

const syncMapItemsPrototype = Object.getPrototypeOf(mockSyncMap.syncMapItems);

syncMapItemsPrototype.create = jest.fn(() =>
  Promise.resolve({
    accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    createdBy: 'created_by',
    data: {
      status: 'pending',
    },
    dateExpires: '2015-07-30T21:00:00Z',
    dateCreated: '2015-07-30T20:00:00Z',
    dateUpdated: '2015-07-30T20:00:00Z',
    key: '+14085040458',
    mapSid: 'MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    revision: 'revision',
    serviceSid: 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    url: 'https://sync.twilio.com/v1/Services/ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Maps/MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Items/key',
  })
);

syncMapItemsPrototype.list = jest.fn(() =>
  Promise.resolve([
    {
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      createdBy: 'created_by',
      data: {
        status: 'pending',
      },
      dateExpires: '2015-07-30T21:00:00Z',
      dateCreated: '2015-07-30T20:00:00Z',
      dateUpdated: '2015-07-30T20:00:00Z',
      key: '+14085040458',
      mapSid: 'MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      revision: 'revision',
      serviceSid: 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      url: 'https://sync.twilio.com/v1/Services/ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Maps/MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Items/key',
    },
    {
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      createdBy: 'created_by',
      data: {
        status: 'pending',
      },
      dateExpires: '2015-07-30T21:00:00Z',
      dateCreated: '2015-07-30T20:00:00Z',
      dateUpdated: '2015-07-30T20:00:00Z',
      key: '+14085040458',
      mapSid: 'MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      revision: 'revision',
      serviceSid: 'ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      url: 'https://sync.twilio.com/v1/Services/ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Maps/MPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Items/key',
    },
  ])
);

const mockSyncService = {
  syncMaps: jest.fn(() => mockSyncMap),
};

describe('verify-sna/get-verifications', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/data/index.js', '../assets/data/index.private.js');
    runtime._addAsset(
      '/data/operations.js',
      '../assets/data/operations.private.js'
    );
    runtime._addAsset(
      '/services/helpers.js',
      '../assets/services/helpers.private.js'
    );
    runtime._addAsset(
      '/services/verifications.js',
      '../assets/services/verifications.private.js'
    );
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when the verifications are retrieved successfully from the MapSync', () => {
    it('returns a 200 status code and an array containing the verifications', (done) => {
      const mockClient = {
        sync: {
          services: jest.fn(() => mockSyncService),
        },
      };

      const testContext = {
        SYNC_SERVICE_SID: 'default',
        SYNC_MAP_SID: 'default',
        getTwilioClient: () => mockClient,
      };

      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.verifications).toBeDefined();
        expect(mockClient.sync.services).toHaveBeenCalledWith(
          testContext.SYNC_SERVICE_SID
        );
        expect(mockSyncService.syncMaps).toHaveBeenCalledWith(
          testContext.SYNC_MAP_SID
        );
        done();
      };
      getVerificationsFunction(testContext, {}, callback);
    });
  });

  describe('when it occurs and error while trying to get the verifications and the thrown error has a defined status code', () => {
    it('returns a status code different from 200 with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const getVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            const error = new Error('An error occurred');
            error.status = 405;
            return reject(error);
          });
        });
        return {
          getVerifications: getVerificationsMock,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).not.toEqual(200);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });

  describe('when it occurs and error while trying to get the verifications and the thrown error has no defined status code', () => {
    it('returns a 400 status code with a message of the error description', (done) => {
      jest.mock('../assets/services/verifications.private.js', () => {
        const verifications = jest.requireActual(
          '../assets/services/verifications.private.js'
        );
        const getVerificationsMock = jest.fn(() => {
          return new Promise((resolve, reject) => {
            return reject(new Error('An error occurred'));
          });
        });
        return {
          getVerifications: getVerificationsMock,
          createVerification: verifications.createVerification,
          checkVerification: verifications.checkVerification,
        };
      });
      const getVerificationsFunction =
        require('../functions/get-verifications').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toBeDefined();
        expect(result._body.message).toEqual('An error occurred');
        done();
      };
      getVerificationsFunction({}, {}, callback);
    });
  });
});
