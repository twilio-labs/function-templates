const helpers = require('../../../test/test-helper');

// Filled in after mocking occurs
let checkStatusFunction;
let token;

const baseContext = {
  ACCOUNT_SID: 'ACXXX',
  AUTH_TOKEN: 'abcdef',
  getTwilioClient: jest.fn(),
};
const mockStatuses = {
  statuses: [
    async () => 'good one',
    async () => {
      throw 'bad two';
    },
    async () => 'good three',
  ],
  environment: jest.fn().mockReturnValue({
    title: 'Environment example',
    valid: true,
  }),
};

describe('voice-client-javascript/admin/check-status', () => {
  beforeAll(() => {
    process.env.ADMIN_PASSWORD = 'supersekret';
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/admin/shared.js',
      '../../assets/admin/shared.private.js'
    );
    runtime._addAsset(
      '/admin/statuses.js',
      '../../assets/admin/statuses.private.js'
    );
    helpers.setup(baseContext, runtime);
    jest.mock('../../assets/admin/statuses.private.js', () => mockStatuses);
    const { createToken } = require('../../assets/admin/shared.private.js');
    token = createToken(baseContext, process.env.ADMIN_PASSWORD);
    checkStatusFunction = require('../../functions/admin/check-status').handler;
  });
  test('calls must be authenticated', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result._statusCode).toBe(403);
      expect(result._body).toBe('Not authorized');
      done();
    };
    // Note no token
    checkStatusFunction(baseContext, {}, callback);
  });
  test('only error free statuses are returned', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.statuses).toBeDefined();
      expect(result.statuses.length).toEqual(2);
      expect(result.statuses).toContain('good one');
      expect(result.statuses).toContain('good three');
      done();
    };
    checkStatusFunction(baseContext, { token }, callback);
  });
  test('environment function is ran', (done) => {
    const callback = (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(result.environment.title).toBe('Environment example');
      expect(mockStatuses.environment).toHaveBeenCalled();
      done();
    };
    checkStatusFunction(baseContext, { token }, callback);
  });
});
