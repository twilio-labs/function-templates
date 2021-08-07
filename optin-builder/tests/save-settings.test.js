const sinon = require('sinon');
const rewire = require('rewire');
const Twilio = require('twilio');

const {
  Response,
} = require(`${__dirname}/../../node_modules/twilio-run/dist/runtime/internal/response`);

Twilio.Response = Response;

const saveSettings = rewire('../functions/save-settings');
saveSettings.__set__('Twilio', Twilio);

class Runtime {}

function getFunctions() {
  return {
    utils: {
      path: '../functions/utils.private.js',
    },
  };
}

saveSettings.__set__('Runtime', Runtime);
saveSettings.__set__('Runtime.getFunctions', getFunctions);

const { handler } = saveSettings;

describe('#save-settings', () => {
  describe('authentication', () => {
    let callback;
    beforeEach(() => {
      // eslint-disable-next-line no-empty-function
      callback = sinon.spy(() => {});
    });

    it('returns 301 if admin phone number not included in request', () => {
      const event = {
        'admin-password': 123,
      };

      handler({ DOMAIN_NAME: 'production.com' }, event, callback);

      const response = callback.getCall(0).args[1];
      expect(response.statusCode).toEqual(301);
      expect(response.headers.Location).toEqual(
        expect.stringContaining('Unauthorized')
      );
    });
  });
});
