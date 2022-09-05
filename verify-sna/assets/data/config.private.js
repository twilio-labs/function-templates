const os = require('os');

const dbFolder = os.tmpdir();

const createTableQuery = `
CREATE TABLE verifications (
    phone_number VARCHAR(30) NOT NULL PRIMARY KEY,
    status VARCHAR(10) NOT NULL,
    verification_start_datetime DATETIME,
    verification_check_datetime DATETIME
);
`;

const getVerificationQuery = `
SELECT *
FROM verifications
WHERE phone_number = $phoneNumber;
`;

const updateVerificationQuery = `
UPDATE verifications
SET status = $status, verification_start_datetime = $verificationStartDatetime, verification_check_datetime = $verificationCheckDatetime
WHERE phone_number = $phoneNumber;
`;

const insertVerificationQuery = `
INSERT INTO verifications (phone_number, status, verification_start_datetime, verification_check_datetime)
VALUES ($phoneNumber, 'pending', $verificationStartDatetime, NULL);
`;

const deleteVerificationsQuery = `
DELETE
FROM verifications
WHERE DATETIME(verification_start_datetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verification_check_datetime, '+30 minute') < DATETIME('NOW');
`;

const getAllVerificationsQuery = `
SELECT *
FROM verifications;
`;

module.exports = {
  dbFolder,
  createTableQuery,
  getVerificationQuery,
  updateVerificationQuery,
  insertVerificationQuery,
  deleteVerificationsQuery,
  getAllVerificationsQuery,
};
