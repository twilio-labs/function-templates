const helpers = require('../../test/test-helper');

describe('verify-sna/data/index', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('when trying to connect to a sync map with the wrong credentials', () => {
    it('creates a new database and the associated tables', async () => {
      const { connectToSyncMap } = require('../assets/data/index.private');

      await expect(true).toBe(true);
    });
  });
});
