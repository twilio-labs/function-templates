const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3');

function connectToDatabaseAndRunQueries(
  queries,
  callback,
  response,
  verification = null
) {
  const dbName = 'verifications_db.db';
  const db = new sqlite3.Database(
    path.join(os.tmpdir(), dbName),
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err && err.code === 'SQLITE_CANTOPEN') {
        // Create database
        const newdb = new sqlite3.Database(
          path.join(os.tmpdir(), dbName),
          (err) => {
            if (err) {
              const statusCode = err.status || 400;
              response.setStatusCode(statusCode);
              response.setBody({
                message: err.message,
              });
              return callback(null, response);
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
                  const statusCode = err.status || 400;
                  response.setStatusCode(statusCode);
                  response.setBody({
                    message: err.message,
                  });
                  return callback(null, response);
                }
                queries(newdb, response, callback, verification);
              }
            );
          }
        );
      } else if (err) {
        const statusCode = err.status || 400;
        response.setStatusCode(statusCode);
        response.setBody({
          message: err.message,
        });
        return callback(null, response);
      }
      queries(db, response, callback, verification);
    }
  );
}

module.exports = {
  connectToDatabaseAndRunQueries,
};
