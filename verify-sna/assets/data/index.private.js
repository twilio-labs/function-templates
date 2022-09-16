const path = require('path');
const sqlite3 = require('sqlite3');

const connectToSyncMap = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = require('twilio')(
        process.env.ACCOUNT_SID,
        process.env.AUTH_TOKEN
      );
      const syncMap = await client.sync
        .services(process.env.SYNC_SERVICE_SID)
        .syncMaps(process.env.SYNC_MAP_SID);
      return resolve(syncMap);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  connectToSyncMap,
};
