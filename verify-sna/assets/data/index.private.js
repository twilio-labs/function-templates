const connectToSyncMap = async (context) => {
  const client = context.getTwilioClient();
  return client.sync
    .services(context.SYNC_SERVICE_SID)
    .syncMaps(context.SYNC_MAP_SID);
};

module.exports = {
  connectToSyncMap,
};
