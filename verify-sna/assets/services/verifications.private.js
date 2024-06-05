const assets = Runtime.getAssets();
const { connectToSyncMap } = require(assets['/data/index.js'].path);
const {
  getAllVerifications,
  getVerification,
  updateVerification,
  createNewVerification,
  deleteVerification,
} = require(assets['/data/operations.js'].path);
const { RESOURCE_NOT_FOUND_ERROR_CODE, PENDING_STATUS } = require(
  assets['/services/constants.js'].path
);

const getVerifications = async (context) => {
  return new Promise(async (resolve, reject) => {
    try {
      const syncMap = await connectToSyncMap(context);
      const verifications = await getAllVerifications(syncMap);
      return resolve(verifications);
    } catch (error) {
      return reject(error);
    }
  });
};

const createVerification = async (context, phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const syncMap = await connectToSyncMap(context);
      const response = await getVerification(syncMap, phoneNumber);
      if (response.success) {
        await deleteVerification(syncMap, phoneNumber);
        await createNewVerification(syncMap, phoneNumber);
      } else if (response.error.code === RESOURCE_NOT_FOUND_ERROR_CODE) {
        await createNewVerification(syncMap, phoneNumber);
      } else {
        throw response.error;
      }
      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
};

const checkVerification = async (context, phoneNumber, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const syncMap = await connectToSyncMap(context);
      const response = await getVerification(syncMap, phoneNumber);
      if (
        response.success &&
        response.verification.data.status === PENDING_STATUS
      ) {
        await updateVerification(syncMap, phoneNumber, status);
      }
      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  getVerifications,
  createVerification,
  checkVerification,
};
