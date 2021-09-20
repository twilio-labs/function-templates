/*
 * By default we are using Twilio Sync for demo purposes Twilio Sync is not
 * a database. If you need to store larger amounts of data and want it to be
 * queryable, make sure to replace the access to Twilio Sync with your own
 * database implementation.
 */

const syncConfig = process.env.SYNC_SERVICE_SID
  ? { serviceName: process.env.SYNC_SERVICE_SID }
  : undefined;

const syncService = Runtime.getSync(syncConfig);

async function createMapIfNotExists(name) {
  const syncClient = syncService;
  try {
    await syncClient.maps(name).fetch();
  } catch (err) {
    await syncClient.maps.create({ uniqueName: name });
  }
}

const MAP_NAME = 'subscriptions';
const LIMIT = 2000;

async function storePhoneNumber(phoneNumber) {
  try {
    await createMapIfNotExists(MAP_NAME);
    await syncService.maps(MAP_NAME).syncMapItems.create({
      key: phoneNumber,
      data: {
        phoneNumber,
      },
    });
  } catch (err) {
    console.error(err.message);
    return false;
  }
  return true;
}

async function getAllPhoneNumbers() {
  try {
    await createMapIfNotExists(MAP_NAME);
    const items = await syncService
      .maps(MAP_NAME)
      .syncMapItems.list({ limit: LIMIT });
    return items.map((item) => item.data.phoneNumber);
  } catch (err) {
    console.error(err.message);
    return [];
  }
}

async function deleteAllPhoneNumbers() {
  try {
    await syncService.maps(MAP_NAME).remove();
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

module.exports = {
  getAllPhoneNumbers,
  storePhoneNumber,
  deleteAllPhoneNumbers,
};
