const helpers = require('../../test/test-helper');

const FINGERPRINT =
  '6F:8E:6C:9A:3B:1D:4E:5F:70:81:92:A3:B4:C5:D6:E7:F8:09:1A:2B:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7';

const mockContext = {
  DOMAIN_NAME: 'example.com',
};

describe('.well-known/webauthn', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/origins.js', '../assets/origins.private.js');
    helpers.setup(mockContext, runtime);
    handlerFunction = require('../functions/.well-known/webauthn').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  it('lists the domain as the only origin by default', (done) => {
    const callback = (_, { _body }) => {
      expect(_body).toEqual({ origins: ['https://example.com'] });
      done();
    };

    handlerFunction(mockContext, {}, callback);
  });

  it('adds the android origin derived from the signing fingerprint', (done) => {
    const callback = (_, { _body }) => {
      expect(_body).toEqual({
        origins: [
          'https://example.com',
          'android:apk-key-hash:b45smjsdTl9wgZKjtMXW5_gJGis8TV5vcIGSo7TF1uc',
        ],
      });
      done();
    };

    handlerFunction(
      { ...mockContext, ANDROID_SHA256_CERT_FINGERPRINT: FINGERPRINT },
      {},
      callback
    );
  });
});
