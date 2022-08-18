const helpers = require('../../test/test-helper');

function randomId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
    describe('when the database is trying to be created in an invalid location', () => {
      it('throws an error indicatiog that the database could not be created', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const dbNameMock = '/not-existing-folder/verifications_db';
          return {
            dbName: dbNameMock,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
        } = require('../assets/helpers/db.private');
        await expect(
          connectToDatabaseAndRunQueries(null, null)
        ).rejects.toThrowError('SQLITE_CANTOPEN: unable to open database file');
      });
    });

    describe('when the table creation fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          function randomFileName(length) {
            let result = '';
            const characters =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
              );
            }
            return result;
          }

          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const dbNameMock = `${randomFileName(6)}.db`;
          const createTableQueryMock = `
          CREA TABLE verifications (
              phone_number VARCHAR(30) NOT NULL,
              sna_url VARCHAR(500) NOT NULL,
              status VARCHAR(10) NOT NULL,
              verification_start_datetime DATETIME,
              verification_check_datetime DATETIME,
              PRIMARY KEY (phone_number, sna_url)
          );
          `;
          return {
            dbName: dbNameMock,
            dbFolder: dbConf.dbFolder,
            createTableQuery: createTableQueryMock,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
        } = require('../assets/helpers/db.private');
        await expect(
          connectToDatabaseAndRunQueries(null, null)
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('verificationStartDatabaseUpdate', () => {
    describe('when a verification insertion fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const insertNewVerificationQueryMock = `
          INSERT INTO verifications_table (phone_number, sna_url, status, verification_start_datetime, verification_check_datetime)
          VALUES (?, ?, 'pending', DATETIME('NOW'), NULL);
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: insertNewVerificationQueryMock,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          verificationStartDatabaseUpdate,
        } = require('../assets/helpers/db.private');
        const verification = {
          to: '+14085040458',
          sna: {
            url: `https://mi.dnlsrv.com/m/id/12345?data=TGSDDSFSD4`,
          },
        };
        await expect(
          connectToDatabaseAndRunQueries(
            verificationStartDatabaseUpdate,
            null,
            verification
          )
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('verificationCheckDatabaseUpdate', () => {
    describe('when the phone number verifications retrieval fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const selectPhoneNumberVerificationsQueryMock = `
          SELECT *
          FROM verifications_table
          WHERE phone_number = ?;
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              selectPhoneNumberVerificationsQueryMock,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate,
        } = require('../assets/helpers/db.private');
        const check = {
          to: '+14085040458',
          status: 'pending',
          snaAttemptsErrorCodes: [
            {
              attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              code: 60519,
            },
            {
              attemptSid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
              code: 60500,
            },
          ],
        };
        await expect(
          connectToDatabaseAndRunQueries(
            verificationCheckDatabaseUpdate,
            null,
            check
          )
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });

    describe('when there are no pending verifications', () => {
      it('resolves the promise', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const selectPhoneNumberVerificationsQueryMock = `
          SELECT *
          FROM verifications
          WHERE FALSE AND phone_number = ?;
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              selectPhoneNumberVerificationsQueryMock,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate,
        } = require('../assets/helpers/db.private');
        const check = {
          to: '+14085040458',
          status: 'pending',
          snaAttemptsErrorCodes: [
            {
              attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              code: 60519,
            },
            {
              attemptSid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
              code: 60500,
            },
          ],
        };
        await expect(
          connectToDatabaseAndRunQueries(
            verificationCheckDatabaseUpdate,
            null,
            check
          )
        ).resolves.toBeDefined();
      });
    });

    describe('when there are pending verifications and the first update fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const updateCheckedVerificationQueryMock = `
          UPDATE verifications_table
          SET status = ?, verification_check_datetime = DATETIME('NOW')
          WHERE phone_number = ? AND sna_url = ?;
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery: updateCheckedVerificationQueryMock,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate,
          verificationStartDatabaseUpdate,
        } = require('../assets/helpers/db.private');

        // create verification in order to ensure that there will be at least one in pending status for this test
        const verification = {
          to: '+14085040458',
          sna: {
            url: `https://mi.dnlsrv.com/m/id/${randomId(8)}?data=TGSDDSFSD4`,
          },
        };
        await connectToDatabaseAndRunQueries(
          verificationStartDatabaseUpdate,
          null,
          verification
        );

        const check = {
          to: '+14085040458',
          status: 'pending',
          snaAttemptsErrorCodes: [
            {
              attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              code: 60519,
            },
            {
              attemptSid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
              code: 60500,
            },
          ],
        };
        await expect(
          connectToDatabaseAndRunQueries(
            verificationCheckDatabaseUpdate,
            null,
            check,
            true
          )
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });

    describe('when there are pending verifications and the second update fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const updateExpiredVerificationsQueryMock = `
          UPDATE verifications_table
          SET status = ?
          WHERE phone_number = ? AND sna_url != ? AND status = 'pending';
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              updateExpiredVerificationsQueryMock,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          verificationCheckDatabaseUpdate,
          verificationStartDatabaseUpdate,
        } = require('../assets/helpers/db.private');

        // create verification in order to ensure that there will be at least one in pending status for this test
        const verification = {
          to: '+14085040458',
          sna: {
            url: `https://mi.dnlsrv.com/m/id/${randomId(8)}?data=TGSDDSFSD4`,
          },
        };
        await connectToDatabaseAndRunQueries(
          verificationStartDatabaseUpdate,
          null,
          verification
        );

        const check = {
          to: '+14085040458',
          status: 'pending',
          snaAttemptsErrorCodes: [
            {
              attemptSid: 'VLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              code: 60519,
            },
            {
              attemptSid: 'VLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
              code: 60500,
            },
          ],
        };
        await expect(
          connectToDatabaseAndRunQueries(
            verificationCheckDatabaseUpdate,
            null,
            check,
            false
          )
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('removeRecords', () => {
    describe('when the delete verifications query fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const deleteVerificationsQueryMock = `
          DELETE
          FROM verifications_table
          WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: deleteVerificationsQueryMock,
            selectAllVerificationsQuery: dbConf.selectAllVerificationsQuery,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          removeRecords,
        } = require('../assets/helpers/db.private');
        await expect(
          connectToDatabaseAndRunQueries(removeRecords, null)
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });

  describe('getVerifications', () => {
    describe('when the select all verifications query fails', () => {
      it('throws an error', async () => {
        jest.mock('../assets/helpers/dbConf.private.js', () => {
          const dbConf = jest.requireActual(
            '../assets/helpers/dbConf.private.js'
          );
          const selectAllVerificationsQueryMock = `
          SELECT *
          FROM verifications_table;
          `;
          return {
            dbName: dbConf.dbName,
            dbFolder: dbConf.dbFolder,
            createTableQuery: dbConf.createTableQuery,
            insertNewVerificationQuery: dbConf.insertNewVerificationQuery,
            selectPhoneNumberVerificationsQuery:
              dbConf.selectPhoneNumberVerificationsQuery,
            updateCheckedVerificationQuery:
              dbConf.updateCheckedVerificationQuery,
            updateExpiredVerificationsQuery:
              dbConf.updateExpiredVerificationsQuery,
            deleteVerificationsQuery: dbConf.deleteVerificationsQuery,
            selectAllVerificationsQuery: selectAllVerificationsQueryMock,
          };
        });
        const {
          connectToDatabaseAndRunQueries,
          getVerifications,
        } = require('../assets/helpers/db.private');
        await expect(
          connectToDatabaseAndRunQueries(getVerifications, null)
        ).rejects.toThrowError('SQLITE_ERROR');
      });
    });
  });
});
