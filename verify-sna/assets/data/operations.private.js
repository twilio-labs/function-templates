const assets = Runtime.getAssets();
const { PENDING_STATUS } = require(assets['/services/constants.js'].path);

const getAllVerifications = async (syncMap) => {
  return syncMap.syncMapItems.list();
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
  return syncMap.syncMapItems(phoneNumber).update({
    data: {
      status: newStatus,
    },
  });
};

const createNewVerification = async (syncMap, phoneNumber) => {
  return syncMap.syncMapItems.create({
    key: phoneNumber,
    data: {
      status: PENDING_STATUS,
    },
    ttl: 1800,
  });
};

const deleteVerification = async (syncMap, phoneNumber) => {
  return syncMap.syncMapItems(phoneNumber).remove();
};

module.exports = {
  getAllVerifications,
  getVerification,
  updateVerification,
  createNewVerification,
  deleteVerification,
};
