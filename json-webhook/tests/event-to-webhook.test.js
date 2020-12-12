const helpers = require('../../test/test-helper');
const eventToWebhook = require('../functions/event-to-webhook').handler;
const fetch = require('node-fetch');

const context = {
    WEBHOOK_URL: 'http://example.com/webhook,'
};

jest.mock('node-fetch');

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

const event = {
    Body: 'Hello world',
    From: 'ExternalNumber',
};

it('should successfully call its webhook', (done) => {
    fetch.mockResolvedValueOnce({
        ok: true,
    });

    const callback = (err, _result) => {
        expect(err).toBeFalsy();
        done();
    };

    eventToWebhook(context, event, callback);
});

it('should throw HTTP errors to the debugger', (done) => {
    const statusText = "mock HTTP error";
    fetch.mockResolvedValueOnce({
        ok: false,
        statusText,
    });

    const callback = (err, _result) => {
        expect(err).toBe(statusText);
        done();
    };

    eventToWebhook(context, event, callback);
});

it('should throw fetch exceptions to the debugger', (done) => {
    const mockError = new Error('mock error');
    fetch.mockRejectedValueOnce(mockError);

    const callback = (err, _result) => {
        expect(err).toBe(mockError);
        done();
    }

    eventToWebhook(context, event, callback);
});
