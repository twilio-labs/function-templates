const assets = Runtime.getAssets();
const { checkAdminPassword } = require(assets['/admin/shared.js'].path);

// eslint-disable-next-line consistent-return
exports.handler = async function (context, event, callback) {
  const resultOfAdminPasswordCheck = await checkAdminPassword(
    context,
    event,
    callback
  );
  if (resultOfAdminPasswordCheck) {
    return callback(null, resultOfAdminPasswordCheck);
  }
};
