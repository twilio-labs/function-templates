const helpers = require('../../test/test-helper');
const sqlite3 = require('sqlite3');

function randomNumber(length) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('verify-sna/data/operations', () => {
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

  describe('insertVerification', () => {
    describe('when the insertVerification operation fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/data/config.private.js', () => {
          const config = jest.requireActual('../assets/data/config.private.js');
          const insertVerificationQueryMock = `
            INSERT INTO verifications_table (phoneNumber, status, verificationStartDatetime, verificationCheckDatetime)
            VALUES ($phoneNumber, 'pending', $verificationStartDatetime, NULL);
            `;
          return {
            dbFolder: config.dbFolder,
            createTableQuery: config.createTableQuery,
            getVerificationQuery: config.getVerificationQuery,
            updateVerificationQuery: config.updateVerificationQuery,
            insertVerificationQuery: insertVerificationQueryMock,
            deleteVerificationsQuery: config.deleteVerificationsQuery,
            getAllVerificationsQuery: config.getAllVerificationsQuery,
          };
        });

        const { connectToDatabase } = require('../assets/data/index.private');
        const db = await connectToDatabase('verifications_db.db');

        const {
          insertVerification,
        } = require('../assets/data/operations.private');

        await expect(
          insertVerification(db, `+${randomNumber(2)}${randomNumber(10)}`)
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });

    describe('when the insertVerification operation is successful', () => {
      it('resolves the promise', async () => {
        jest.mock('../assets/data/config.private.js', () => {
          const config = jest.requireActual('../assets/data/config.private.js');
          return {
            dbFolder: config.dbFolder,
            createTableQuery: config.createTableQuery,
            getVerificationQuery: config.getVerificationQuery,
            updateVerificationQuery: config.updateVerificationQuery,
            insertVerificationQuery: config.insertVerificationQuery,
            deleteVerificationsQuery: config.deleteVerificationsQuery,
            getAllVerificationsQuery: config.getAllVerificationsQuery,
          };
        });

        const { connectToDatabase } = require('../assets/data/index.private');
        const db = await connectToDatabase('verifications_db.db');

        const {
          insertVerification,
        } = require('../assets/data/operations.private');

        await expect(
          insertVerification(db, `+${randomNumber(2)}${randomNumber(10)}`)
        ).resolves.toBeDefined();
      });
    });
  });

  describe('updateVerifications', () => {
    describe('when the updateVerification operation fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/data/config.private.js', () => {
          const config = jest.requireActual('../assets/data/config.private.js');
          const updateVerificationQueryMock = `
          UPDATE verifications_table
          SET status = $status, verificationStartDatetime = $verificationStartDatetime, verificationCheckDatetime = $verificationCheckDatetime
          WHERE phoneNumber = $phoneNumber;
          `;
          return {
            dbFolder: config.dbFolder,
            createTableQuery: config.createTableQuery,
            getVerificationQuery: config.getVerificationQuery,
            updateVerificationQuery: updateVerificationQueryMock,
            insertVerificationQuery: config.insertVerificationQuery,
            deleteVerificationsQuery: config.deleteVerificationsQuery,
            getAllVerificationsQuery: config.getAllVerificationsQuery,
          };
        });

        const { connectToDatabase } = require('../assets/data/index.private');
        const db = await connectToDatabase('verifications_db.db');

        const {
          updateVerification,
        } = require('../assets/data/operations.private');

        await expect(
          updateVerification(
            db,
            `+${randomNumber(2)}${randomNumber(10)}`,
            'verified',
            new Date().toLocaleString(),
            new Date().toLocaleString()
          )
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('getVerification', () => {
    describe('when the getVerification operation fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/data/config.private.js', () => {
          const config = jest.requireActual('../assets/data/config.private.js');
          const getVerificationQueryMock = `
          SELECT *
          FROM verifications_table
          WHERE phoneNumber = $phoneNumber;
          `;
          return {
            dbFolder: config.dbFolder,
            createTableQuery: config.createTableQuery,
            getVerificationQuery: getVerificationQueryMock,
            updateVerificationQuery: config.updateVerificationQuery,
            insertVerificationQuery: config.insertVerificationQuery,
            deleteVerificationsQuery: config.deleteVerificationsQuery,
            getAllVerificationsQuery: config.getAllVerificationsQuery,
          };
        });

        const { connectToDatabase } = require('../assets/data/index.private');
        const db = await connectToDatabase('verifications_db.db');

        const {
          getVerification,
        } = require('../assets/data/operations.private');

        await expect(
          getVerification(db, `+${randomNumber(2)}${randomNumber(10)}`)
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('getAllVerifications', () => {
    describe('when the getAllVerifications operation fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/data/config.private.js', () => {
          const config = jest.requireActual('../assets/data/config.private.js');
          const getAllVerificationsQueryMock = `
          SELECT *
          FROM verifications_table;
          `;
          return {
            dbFolder: config.dbFolder,
            createTableQuery: config.createTableQuery,
            getVerificationQuery: config.getVerificationQuery,
            updateVerificationQuery: config.updateVerificationQuery,
            insertVerificationQuery: config.insertVerificationQuery,
            deleteVerificationsQuery: config.deleteVerificationsQuery,
            getAllVerificationsQuery: getAllVerificationsQueryMock,
          };
        });

        const { connectToDatabase } = require('../assets/data/index.private');
        const db = await connectToDatabase('verifications_db.db');

        const {
          getAllVerifications,
        } = require('../assets/data/operations.private');

        await expect(getAllVerifications(db)).rejects.toThrowError(
          'SQLITE_ERROR'
        );
      });
    });
  });
});
