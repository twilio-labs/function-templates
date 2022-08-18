const os = require('os');

const dbName = 'verifications_db.db';
const dbFolder = os.tmpdir();
// const dbFolder = '/home/elkinnarvaez/foldertest'

module.exports = {
  dbName,
  dbFolder,
};
