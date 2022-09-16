const helpers = require('../../test/test-helper');

describe('verify-sna/verify-start', () => {
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

  describe('when required countryCode parameter is missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyStartFunction = require('../functions/verify-start').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'countryCode'.`
        );
        done();
      };
      const event = {
        phoneNumber: '4085040458',
      };
      verifyStartFunction({}, event, callback);
    });
  });

  describe('when required phoneNumber parameter is missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyStartFunction = require('../functions/verify-start').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'phoneNumber'.`
        );
        done();
      };
      const event = {
        countryCode: '+57',
      };
      verifyStartFunction({}, event, callback);
    });
  });

  describe('when required parameters are missing', () => {
    it('returns an error response indicating the missing parameters', (done) => {
      const verifyStartFunction = require('../functions/verify-start').handler;
      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toEqual(
          `Missing parameters; please provide: 'countryCode, phoneNumber'.`
        );
        done();
      };
      verifyStartFunction({}, {}, callback);
    });
  });

  describe('when a verification is created successfully', () => {
    it('returns a 200 status code and the sna url assigned to that verification', (done) => {
      const mockVerifyService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/12345678?data=TGSDDSFSD4`,
              },
            })
          ),
        },
      };

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
        create: jest.fn(() =>
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
        list: jest.fn(() =>
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
          ])
        ),
      };

      const mockSyncMap = {
        syncMapItems: jest.fn(() => mockSyncMapItem),
      };

      const mockSyncService = {
        syncMaps: jest.fn(() => mockSyncMap),
      };

      const mockClient = {
        verify: {
          services: jest.fn(() => mockVerifyService),
        },
        sync: {
          services: jest.fn(() => mockSyncService),
        },
      };

      const testContext = {
        VERIFY_SERVICE_SID: 'default',
        SYNC_SERVICE_SID: 'default',
        SYNC_MAP_SID: 'default',
        getTwilioClient: () => mockClient,
      };

      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(200);
        expect(result._body.snaUrl).toBeDefined();
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });

  describe('when the Verify API call throws an error with a 500 status code', () => {
    it('returns a 500 status code and an error message', (done) => {
      const mockVerifyService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/12345678?data=TGSDDSFSD4`,
              },
            })
          ),
        },
      };

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
        syncMapItems: {
          create: jest.fn(() =>
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
          list: jest.fn(() =>
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
            ])
          ),
        },
        syncMapItems: jest.fn(() => mockSyncMapItem),
      };

      const mockSyncService = {
        syncMaps: jest.fn(() => mockSyncMap),
      };

      const mockClient = {
        verify: {
          services: jest.fn(() => mockVerifyService),
        },
        sync: {
          services: jest.fn(() => mockSyncService),
        },
      };

      const testContext = {
        VERIFY_SERVICE_SID: 'default',
        SYNC_SERVICE_SID: 'default',
        SYNC_MAP_SID: 'default',
        getTwilioClient: () => mockClient,
      };

      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(500);
        expect(result._body.message).toEqual('Internal server error');
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });

  describe('when the Verify API call throws an error with no status code', () => {
    it('returns a 400 status code and an error message', (done) => {
      const mockVerifyService = {
        verifications: {
          create: jest.fn(() =>
            Promise.resolve({
              to: '+14085040458',
              sna: {
                url: `https://mi.dnlsrv.com/m/id/12345678?data=TGSDDSFSD4`,
              },
            })
          ),
        },
      };

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
        syncMapItems: {
          create: jest.fn(() =>
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
          list: jest.fn(() =>
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
            ])
          ),
        },
        syncMapItems: jest.fn(() => mockSyncMapItem),
      };

      const mockSyncService = {
        syncMaps: jest.fn(() => mockSyncMap),
      };

      const mockClient = {
        verify: {
          services: jest.fn(() => mockVerifyService),
        },
        sync: {
          services: jest.fn(() => mockSyncService),
        },
      };

      const testContext = {
        VERIFY_SERVICE_SID: 'default',
        SYNC_SERVICE_SID: 'default',
        SYNC_MAP_SID: 'default',
        getTwilioClient: () => mockClient,
      };

      const verifyStartFunction = require('../functions/verify-start').handler;

      const callback = (_err, result) => {
        expect(result).toBeDefined();
        expect(result._statusCode).toEqual(400);
        expect(result._body.message).toEqual('An error occurred');
        expect(mockClient.verify.services).toHaveBeenCalledWith(
          testContext.VERIFY_SERVICE_SID
        );
        expect(mockService.verifications.create).toHaveBeenCalledWith({
          to: '+14085040458',
          channel: 'sna',
        });
        done();
      };
      const event = {
        countryCode: '+1',
        phoneNumber: '4085040458',
      };
      verifyStartFunction(testContext, event, callback);
    });
  });
});
