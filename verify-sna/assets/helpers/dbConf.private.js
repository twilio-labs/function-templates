const os = require('os');

const dbName = 'verifications_db.db';
const dbFolder = os.tmpdir();
// const dbFolder = '/home/elkinnarvaez/not-existing-folder'

module.exports = {
  dbName,
  dbFolder,
};
