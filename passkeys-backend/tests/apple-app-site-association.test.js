const helpers = require('../../test/test-helper');

describe('.well-known/apple-app-site-association', () => {
  beforeAll(() => {
    helpers.setup({});
    handlerFunction =
      require('../functions/.well-known/apple-app-site-association').handler;
  });
  afterAll(() => {
    helpers.teardown();
  });

  it('serves the configured app id as JSON', (done) => {
    const context = { IOS_APP_ID: 'ABCDE12345.com.example.passkeys' };

    const callback = (_, response) => {
      expect(response._headers['Content-Type']).toEqual('application/json');
      expect(response._body).toEqual({
        webcredentials: { apps: ['ABCDE12345.com.example.passkeys'] },
      });
      done();
    };

    handlerFunction(context, {}, callback);
  });

  it('serves an empty app list when no app id is configured', (done) => {
    const callback = (_, { _body }) => {
      expect(_body).toEqual({ webcredentials: { apps: [] } });
      done();
    };

    handlerFunction({}, {}, callback);
  });
});
