const os = require('os');

const dbName = 'verifications_db.db';
const dbFolder = os.tmpdir();

const createTableQuery = `
CREATE TABLE verifications (
    phone_number VARCHAR(30) NOT NULL,
    sna_url VARCHAR(500) NOT NULL,
    status VARCHAR(10) NOT NULL,
    verification_start_datetime DATETIME,
    verification_check_datetime DATETIME,
    PRIMARY KEY (phone_number, sna_url)
);
`;

const insertNewVerificationQuery = `
INSERT INTO verifications (phone_number, sna_url, status, verification_start_datetime, verification_check_datetime)
VALUES (?, ?, 'pending', DATETIME('NOW'), NULL);
`;

const selectPhoneNumberVerificationsQuery = `
SELECT *
FROM verifications
WHERE phone_number = ?;
`;

const updateCheckedVerificationQuery = `
UPDATE verifications
SET status = ?, verification_check_datetime = DATETIME('NOW')
WHERE phone_number = ? AND sna_url = ?;
`;

const updateExpiredVerificationsQuery = `
UPDATE verifications
SET status = ?
WHERE phone_number = ? AND sna_url != ? AND status = 'pending';
`;

const deleteVerificationsQuery = `
DELETE
FROM verifications
WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
`;

const selectAllVerificationsQuery = `
SELECT *
FROM verifications;
`;

module.exports = {
  dbName,
  dbFolder,
  createTableQuery,
  insertNewVerificationQuery,
  selectPhoneNumberVerificationsQuery,
  updateCheckedVerificationQuery,
  updateExpiredVerificationsQuery,
  deleteVerificationsQuery,
  selectAllVerificationsQuery,
};
