const helpers = require('../../test/test-helper');
const smsToWebhook = require('../functions/sms-to-webhook').handler;

const context = {
    ZAPIER_WEBHOOK_URL: 'http://example.com/webhook,'
};

const mockFetchResponse = {
    ok: true,
};

jest.mock('node-fetch', () => {
    return jest.fn().mockImplementation(() => {
        return mockFetchResponse;
    });
});

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

it('should successfully call its webhook', (done) => {
    const callback = (err, _result) => {
        expect(err).toBeFalsy();
        done();
    };

    const event = {
        Body: 'Hello world',
        From: 'ExternalNumber',
    };

    smsToWebhook(context, event, callback);
});
