const assets = Runtime.getAssets();
const { PENDING_STATUS } = require(assets['/services/constants.js'].path);

const getAllVerifications = async (syncMap) => {
  return new Promise(async (resolve, reject) => {
    await syncMap.syncMapItems
      .list()
      .then((syncMapItems) => {
        return resolve(syncMapItems);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

const getVerification = async (syncMap, phoneNumber) => {
  return new Promise(async (resolve) => {
    await syncMap
      .syncMapItems(phoneNumber)
      .fetch()
      .then((syncMapItem) => {
        return resolve({ success: true, verification: syncMapItem });
      })
      .catch((err) => {
        return resolve({ success: false, error: err });
      });
  });
};

const updateVerification = async (syncMap, phoneNumber, newStatus) => {
  return new Promise(async (resolve, reject) => {
    await syncMap
      .syncMapItems(phoneNumber)
      .update({
        data: {
          status: newStatus,
        },
      })
      .then((_) => {
        return resolve(true);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

const createNewVerification = async (syncMap, phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    await syncMap.syncMapItems
      .create({
        key: phoneNumber,
        data: {
          status: PENDING_STATUS,
        },
        ttl: 1800,
      })
      .then((_) => {
        return resolve(true);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

const deleteVerification = async (syncMap, phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    await syncMap
      .syncMapItems(phoneNumber)
      .remove()
      .then(() => {
        return resolve(true);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

module.exports = {
  getAllVerifications,
  getVerification,
  updateVerification,
  createNewVerification,
  deleteVerification,
};
