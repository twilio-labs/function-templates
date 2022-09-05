const os = require('os');

const dbFolder = os.tmpdir();

const createTableQuery = `
CREATE TABLE verifications (
    phoneNumber VARCHAR(30) NOT NULL PRIMARY KEY,
    status VARCHAR(10) NOT NULL,
    verificationStartDatetime DATETIME,
    verificationCheckDatetime DATETIME
);
`;

const getVerificationQuery = `
SELECT *
FROM verifications
WHERE phoneNumber = $phoneNumber;
`;

const updateVerificationQuery = `
UPDATE verifications
SET status = $status, verificationStartDatetime = $verificationStartDatetime, verificationCheckDatetime = $verificationCheckDatetime
WHERE phoneNumber = $phoneNumber;
`;

const insertVerificationQuery = `
INSERT INTO verifications (phoneNumber, status, verificationStartDatetime, verificationCheckDatetime)
VALUES ($phoneNumber, 'pending', $verificationStartDatetime, NULL);
`;

const deleteVerificationsQuery = `
DELETE
FROM verifications
WHERE DATETIME(verificationStartDatetime, '+30 minute') < DATETIME('NOW') OR DATETIME(verificationCheckDatetime, '+30 minute') < DATETIME('NOW');
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
