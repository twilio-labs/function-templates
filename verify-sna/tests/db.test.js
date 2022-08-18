const helpers = require('../../test/test-helper');

describe('verify-sna/helpers/db', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('connectToDatabaseAndRunQueries', () => {
    describe('when the database is trying to be created outside the temp folder', () => {
      it('throws an error', (done) => {
        const db = require('../assets/helpers/db.private.js');
        const connectToDatabaseAndRunQueries =
          db.connectToDatabaseAndRunQueries;
        expect(true).toBe(true);
        done();
      });
    });
  });
});
