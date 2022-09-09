const helpers = require('../../test/test-helper');
const sqlite3 = require('sqlite3');

function randomDbName(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('verify-sna/data/index', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset('/data/config.js', '../assets/data/config.private.js');
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when trying to connect to a database that does not exist', () => {
    it('creates a new database and the associated tables', async () => {
      const { connectToDatabase } = require('../assets/data/index.private');

      await expect(
        connectToDatabase(`${randomDbName(10)}.db`)
      ).resolves.toBeInstanceOf(sqlite3.Database);
    });
  });
});
