const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3');

const assets = Runtime.getAssets();
const { dbName, dbFolder } = require(assets['/helpers/dbConf.js'].path);

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
              newdb.exec(
                `
                      CREATE TABLE verifications (
                          phone_number VARCHAR(30) NOT NULL,
                          sna_url VARCHAR(500) NOT NULL,
                          status VARCHAR(10) NOT NULL,
                          verification_start_datetime DATETIME,
                          verification_check_datetime DATETIME,
                          PRIMARY KEY (phone_number, sna_url)
                      );
                      `,
                (err) => {
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
                }
              );
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
    `
       INSERT INTO verifications (phone_number, sna_url, status, verification_start_datetime, verification_check_datetime)
       VALUES (?, ?, 'pending', DATETIME('NOW'), NULL);
       `,
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
  db.all(
    `
     SELECT *
     FROM verifications
     WHERE phone_number = ?;
     `,
    check.to,
    (err, rows) => {
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
          `
                UPDATE verifications
                SET status = ?, verification_check_datetime = DATETIME('NOW')
                WHERE phone_number = ? AND sna_url = ?;
                `,
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
              `
                    UPDATE verifications
                    SET status = ?
                    WHERE phone_number = ? AND sna_url != ? AND status = 'pending';
                    `,
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
    }
  );
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
  db.run(
    `
       DELETE
       FROM verifications
       WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
       `,
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
  db.all(
    `
     SELECT *
     FROM verifications;
     `,
    (err, rows) => {
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
    }
  );
}

module.exports = {
  connectToDatabaseAndRunQueries,
  verificationStartDatabaseUpdate,
  verificationCheckDatabaseUpdate,
  removeRecords,
  getVerifications,
};
