/* eslint-disable camelcase */

const helpers = require('../../test/test-helper');

const FINGERPRINT =
  '6F:8E:6C:9A:3B:1D:4E:5F:70:81:92:A3:B4:C5:D6:E7:F8:09:1A:2B:3C:4D:5E:6F:70:81:92:A3:B4:C5:D6:E7';

describe('.well-known/assetlinks.json', () => {
  beforeAll(() => {
    helpers.setup({});
    handlerFunction =
      require('../functions/.well-known/assetlinks.json').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  it('always declares the web relying party', (done) => {
    const callback = (_, response) => {
      expect(response._headers['Content-Type']).toEqual('application/json');
      expect(response._body).toHaveLength(1);
      expect(response._body[0].target).toEqual({
        namespace: 'web',
        site: 'https://example.com',
      });
      done();
    };

    handlerFunction({ DOMAIN_NAME: 'example.com' }, {}, callback);
  });

  it('adds the android app when package name and fingerprint are set', (done) => {
    const context = {
      DOMAIN_NAME: 'example.com',
      ANDROID_PACKAGE_NAME: 'com.example.passkeys',
      ANDROID_SHA256_CERT_FINGERPRINT: FINGERPRINT,
    };

    const callback = (_, { _body }) => {
      expect(_body).toHaveLength(2);
      expect(_body[1].target).toEqual({
        namespace: 'android_app',
        package_name: 'com.example.passkeys',
        sha256_cert_fingerprints: [FINGERPRINT],
      });
      expect(_body[1].relation).toContain(
        'delegate_permission/common.get_login_creds'
      );
      done();
    };

    handlerFunction(context, {}, callback);
  });

  it('omits the android app when only the package name is set', (done) => {
    const callback = (_, { _body }) => {
      expect(_body).toHaveLength(1);
      done();
    };

    handlerFunction(
      { DOMAIN_NAME: 'example.com', ANDROID_PACKAGE_NAME: 'com.example.app' },
      {},
      callback
    );
  });
});
