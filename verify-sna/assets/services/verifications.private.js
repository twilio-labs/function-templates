const assets = Runtime.getAssets();
const { connectToDatabase } = require(assets['/data/index.js'].path);
const {
  deleteVerifications,
  getAllVerifications,
  getVerification,
  updateVerification,
  insertVerification,
} = require(assets['/data/operations.js'].path);

const removeOldVerifications = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await connectToDatabase('verifications_db.db');
      await deleteVerifications(db);
      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

const getVerifications = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await connectToDatabase('verifications_db.db');
      return resolve(await getAllVerifications(db));
    } catch (error) {
      return reject(error);
    }
  });
};

const createVerification = async (phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await connectToDatabase('verifications_db.db');
      const verification = await getVerification(db, phoneNumber);
      if (verification) {
        await updateVerification(
          db,
          phoneNumber,
          'pending',
          new Date().toLocaleString(),
          null
        );
      } else {
        await insertVerification(db, phoneNumber);
      }
      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

const checkVerification = async (phoneNumber, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await connectToDatabase('verifications_db.db');
      const verification = await getVerification(db, phoneNumber);
      if (verification && verification.status === 'pending') {
        await updateVerification(
          db,
          phoneNumber,
          status,
          verification.verificationStartDatetime,
          new Date().toLocaleString()
        );
      }
      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  removeOldVerifications,
  getVerifications,
  createVerification,
  checkVerification,
};
