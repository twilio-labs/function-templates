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

function connectToDatabaseAndRunQueries(
  queries,
  response,
  verification = null,
  checkStatus = null
) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      path.join(dbFolder, dbName),
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err && err.code === 'SQLITE_CANTOPEN') {
          // Create database
          const newdb = new sqlite3.Database(
            path.join(dbFolder, dbName),
            (err) => {
              if (err) {
                return reject(err);
              }
              // Table(s) creation
              newdb.exec(createTableQuery, (err) => {
                if (err) {
                  return reject(err);
                } else {
                  queries(
                    newdb,
                    response,
                    verification,
                    checkStatus,
                    resolve,
                    reject
                  );
                }
              });
            }
          );
        } else if (err) {
          return reject(err);
        } else {
          queries(db, response, verification, checkStatus, resolve, reject);
        }
      }
    );
  });
}

/**
 * Updates verifications table when a verification start occurs
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Object} verification The object returned by the Twilio Verify API when creating a SNA verification
 */
function verificationStartDatabaseUpdate(
  db,
  response,
  verification,
  checkStatus,
  resolve,
  reject
) {
  db.run(
    insertNewVerificationQuery,
    [verification.to, verification.sna.url],
    (err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(response);
      }
    }
  );
}

/**
 * Updates verifications table when a verification check occurs
 * @param {sqlite3.Database} db A sqlite3 Database object
 * @param {Object} check The object returned by the Twilio Verify API when checking a SNA verification for a given phone number
 */
function verificationCheckDatabaseUpdate(
  db,
  response,
  check,
  checkStatus,
  resolve,
  reject
) {
  db.all(selectPhoneNumberVerificationsQuery, check.to, (err, rows) => {
    if (err) {
      return reject(err);
    }
    pendingStatusRows = rows.filter((row) => row.status === 'pending');
    if (pendingStatusRows.length > 0) {
      sortedRows = pendingStatusRows.sort((a, b) => {
        const aDate = new Date(a.verification_start_datetime);
        const bDate = new Date(b.verification_start_datetime);
        return bDate - aDate;
      });
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
          db.run(
            updateExpiredVerificationsQuery,
            ['expired', check.to, sortedRows[0].sna_url],
            (err) => {
              if (err) {
                return reject(err);
              } else {
                return resolve(response);
              }
            }
          );
        }
      );
    } else {
      return resolve(response);
    }
  });
}

/**
 * Removes records from the verifications table that are more than 30 minutes old
 * @param {sqlite3.Database} db A sqlite3 Database object
 */
function removeRecords(
  db,
  response,
  verification,
  checkStatus,
  resolve,
  reject
) {
  db.run(deleteVerificationsQuery, (err) => {
    if (err) {
      return reject(err);
    } else {
      return resolve(response);
    }
  });
}

/**
 * Fetchs all the records from the verifications table
 * @param {sqlite3.Database} db A sqlite3 Database object
 */
function getVerifications(
  db,
  response,
  verification,
  checkStatus,
  resolve,
  reject
) {
  db.all(selectAllVerificationsQuery, (err, rows) => {
    if (err) {
      return reject(err);
    }
    sortedRows = rows.sort((a, b) => {
      const aDate = new Date(a.verification_start_datetime);
      const bDate = new Date(b.verification_start_datetime);
      return bDate - aDate;
    });
    response.setStatusCode(200);
    response.setBody({
      message: 'Verifications retrieved sucessfully',
      verifications: sortedRows,
    });
    return resolve(response);
  });
}

module.exports = {
  connectToDatabaseAndRunQueries,
  verificationStartDatabaseUpdate,
  verificationCheckDatabaseUpdate,
  removeRecords,
  getVerifications,
};
