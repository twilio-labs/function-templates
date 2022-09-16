const connectToSyncMap = async (context) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = context.getTwilioClient();
      const syncMap = await client.sync
        .services(context.SYNC_SERVICE_SID)
        .syncMaps(context.SYNC_MAP_SID);
      return resolve(syncMap);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  connectToSyncMap,
};
