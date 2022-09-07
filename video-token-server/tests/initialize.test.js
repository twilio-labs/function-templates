const helpers = require('../../test/test-helper');
const initializeFunction = require('../functions/initialize').handler;

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mock-passcode',
}));

const mockVariableList = jest.fn();
const mockVariableCreate = jest.fn();

const mockClient = {
  serverless: {
    services: () => ({
      environments: () => ({
        variables: { list: mockVariableList, create: mockVariableCreate },
      }),
    }),
  },
};

const context = { getTwilioClient: () => mockClient };

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

describe('the /initialize endpoint', () => {
  it('should generate a passcode with ?initialize is true', async () => {
    mockVariableList.mockImplementation(() => []);
    const mockCallback = jest.fn();

    await initializeFunction(context, { initialize: 'true' }, mockCallback);

    expect(mockVariableCreate).toHaveBeenCalledWith({
      key: 'PASSCODE',
      value: 'mock-passcode',
    });
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: { passcode: 'mock-passcode' },
      _headers: { 'Content-Type': 'application/json' },
      _statusCode: 200,
    });
  });

  it('should return a 500 when a passcode has already been generated', async () => {
    mockVariableList.mockImplementation(() => [{ key: 'PASSCODE' }]);
    const mockCallback = jest.fn();
    await initializeFunction(context, { initialize: 'true' }, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: { error: 'passcode already generated' },
      _headers: { 'Content-Type': 'application/json' },
      _statusCode: 500,
    });
  });

  it('should return a 400 when there is no ?initialize parameter', async () => {
    const mockCallback = jest.fn();
    await initializeFunction(context, {}, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: {},
      _headers: { 'Content-Type': 'application/json' },
      _statusCode: 400,
    });
  });
});
