const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3');

const assets = Runtime.getAssets();
const {
  dbName,
  dbFolder,
  createTableQuery,
  insertNewVerificationQuery,
  selectPhoneNumberVerificationsQuery,
  updateCheckedVerificationQuery,
  updateExpiredVerificationsQuery,
  deleteVerificationsQuery,
  selectAllVerificationsQuery,
} = require(assets['/helpers/dbConf.js'].path);

/**
 * ------------------------------- Helper Functions -------------------------------------- *
 */

const createDatabase = async () => {
  return new Promise((resolve, reject) => {
    const newdb = new sqlite3.Database(
      path.join(dbFolder, dbName),
      // eslint-disable-next-line consistent-return
      (err) => {
        if (err) {
          return reject(err);
        }
        newdb.exec(createTableQuery, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve(newdb);
        });
      }
    );
  });
};

const runQueries = async (
  db,
  queries,
  response,
  verification,
  checkStatus,
  resolve,
  reject
) => {
  try {
    const newResponse = await queries(db, verification, checkStatus);
    if (newResponse) {
      return resolve(newResponse);
    }
    return resolve(response);
  } catch (error) {
    return reject(error);
  }
};

const updateCheckedVerification = async (
  db,
  check,
  checkStatus,
  sortedRows
) => {
  return new Promise((resolve, reject) => {
    db.run(
      updateCheckedVerificationQuery,
      [
        checkStatus ? 'verified' : 'not-verified',
        check.to,
        sortedRows[0].sna_url,
      ],
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
};

const updateExpiredVerifications = async (db, check, sortedRows) => {
  return new Promise((resolve, reject) => {
    db.run(
      updateExpiredVerificationsQuery,
      ['expired', check.to, sortedRows[0].sna_url],
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
};

/**
 * -------------------------------------------------------------------------------------- *
 */

const connectToDatabaseAndRunQueries = async (
  queries,
  response,
  verification = null,
  checkStatus = null
) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      path.join(dbFolder, dbName),
      sqlite3.OPEN_READWRITE,
      // eslint-disable-next-line consistent-return
      async (err) => {
        if (err && err.code === 'SQLITE_CANTOPEN') {
          try {
            const newdb = await createDatabase();
            await runQueries(
              newdb,
              queries,
              response,
              verification,
              checkStatus,
              resolve,
              reject
            );
          } catch (error) {
            return reject(error);
          }
        } else if (err) {
          return reject(err);
        } else {
          await runQueries(
            db,
            queries,
            response,
            verification,
            checkStatus,
            resolve,
            reject
          );
        }
      }
    );
  });
};

const verificationStartDatabaseUpdate = async (
  db,
  verification,
  checkStatus
) => {
  return new Promise((resolve, reject) => {
    db.run(
      insertNewVerificationQuery,
      [verification.to, verification.sna.url],
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
};

const verificationCheckDatabaseUpdate = async (db, check, checkStatus) => {
  return new Promise((resolve, reject) => {
    db.all(selectPhoneNumberVerificationsQuery, check.to, async (err, rows) => {
      if (err) {
        return reject(err);
      }
      try {
        const pendingStatusRows = rows.filter(
          (row) => row.status === 'pending'
        );
        if (pendingStatusRows.length > 0) {
          const sortedRows = pendingStatusRows.sort((a, b) => {
            const aDate = new Date(a.verification_start_datetime);
            const bDate = new Date(b.verification_start_datetime);
            return bDate - aDate;
          });
          await updateCheckedVerification(db, check, checkStatus, sortedRows);
          await updateExpiredVerifications(db, check, sortedRows);
        }
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  });
};

const removeRecords = async (db, verification, checkStatus) => {
  return new Promise((resolve, reject) => {
    db.run(deleteVerificationsQuery, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

const getVerifications = async (db, verification, checkStatus) => {
  return new Promise((resolve, reject) => {
    db.all(selectAllVerificationsQuery, (err, rows) => {
      if (err) {
        return reject(err);
      }
      const sortedRows = rows.sort((a, b) => {
        const aDate = new Date(a.verification_start_datetime);
        const bDate = new Date(b.verification_start_datetime);
        return bDate - aDate;
      });
      const response = new Twilio.Response();
      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(200);
      response.setBody({
        message: 'Verifications retrieved sucessfully',
        verifications: sortedRows,
      });
      return resolve(response);
    });
  });
};

module.exports = {
  connectToDatabaseAndRunQueries,
  verificationStartDatabaseUpdate,
  verificationCheckDatabaseUpdate,
  removeRecords,
  getVerifications,
};
