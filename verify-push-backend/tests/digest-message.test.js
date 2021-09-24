const helpers = require('../../test/test-helper');
const missing = require('../assets/digest-message.private');

describe('verify-push-backend/private/digest-message', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  const { digestMessage } = missing;

  test('Digest a message', () => {
    const value = '1234567890';
    const hashedValue = digestMessage(value);

    expect(hashedValue).toEqual('c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646');
  });
});
