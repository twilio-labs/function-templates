const helpers = require('../../test/test-helper');

describe('verify-sna/helpers/db', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/helpers/dbConf.js',
      '../assets/helpers/dbConf.private.js'
    );
    helpers.setup({}, runtime);
  });
  afterAll(() => {
    helpers.teardown();
  });
  beforeEach(() => jest.resetModules());

  describe('connectToDatabaseAndRunQueries', () => {
    describe('when the database is trying to be created in a location that does not exist', () => {
      it('throws an error indicatiog that the database could not be created', (done) => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const dbNameMock = '/home/elkinnarvaez/not-existing-folder';
          return {
            dbName: dbNameMock,
            dbFolder: dbConf.dbFolder,
          };
        });
        const connectToDatabaseAndRunQueries =
          require('../assets/helpers/db.private').connectToDatabaseAndRunQueries;
        expect(connectToDatabaseAndRunQueries(null, null)).rejects.toThrowError(
          new Error('SQLITE_CANTOPEN: unable to open database file')
        );
        done();
      });
    });
  });
});
