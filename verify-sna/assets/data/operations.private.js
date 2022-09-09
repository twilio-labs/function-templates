const assets = Runtime.getAssets();
const {
  getVerificationQuery,
  updateVerificationQuery,
  insertVerificationQuery,
  deleteVerificationsQuery,
  getAllVerificationsQuery,
} = require(assets['/data/config.js'].path);

const run = async (db, query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

const all = async (db, query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows);
    });
  });
};

const get = async (db, query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      return resolve(row);
    });
  });
};

const deleteVerifications = async (db) => {
  return new Promise(async (resolve, reject) => {
    try {
      await run(db, deleteVerificationsQuery, []);
      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

const getAllVerifications = async (db) => {
  return new Promise(async (resolve, reject) => {
    try {
      return resolve(await all(db, getAllVerificationsQuery, []));
    } catch (error) {
      return reject(error);
    }
  });
};

const getVerification = async (db, phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      return resolve(
        await get(db, getVerificationQuery, {
          $phoneNumber: phoneNumber,
        })
      );
    } catch (error) {
      return reject(error);
    }
  });
};

const updateVerification = async (
  db,
  phoneNumber,
  status,
  verificationStartDatetime,
  verificationCheckDatetime
) => {
  return new Promise(async (resolve, reject) => {
    try {
      await run(db, updateVerificationQuery, {
        $phoneNumber: phoneNumber,
        $status: status,
        $verificationStartDatetime: verificationStartDatetime,
        $verificationCheckDatetime: verificationCheckDatetime,
      });
      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

const insertVerification = async (db, phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      await run(db, insertVerificationQuery, {
        $phoneNumber: phoneNumber,
        $verificationStartDatetime: new Date().toLocaleString(),
      });
      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  deleteVerifications,
  getAllVerifications,
  getVerification,
  updateVerification,
  insertVerification,
};
