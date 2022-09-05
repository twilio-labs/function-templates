const path = require('path');
const sqlite3 = require('sqlite3');

const assets = Runtime.getAssets();
const { dbFolder, createTableQuery } = require(assets['/data/config.js'].path);

const createTables = async (db) => {
  return new Promise((resolve, reject) => {
    db.exec(createTableQuery, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

const createDatabase = async (dbName) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(dbFolder, dbName), (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(db);
    });
  });
};

const initializeDatabase = async (dbName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await createDatabase(dbName);
      await createTables(db);
      return resolve(db);
    } catch (error) {
      return reject(error);
    }
  });
};

const getDatabase = async (dbName) => {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(
      path.join(dbFolder, dbName),
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err && err.code === 'SQLITE_CANTOPEN') {
          return resolve(null);
        }
        return resolve(db);
      }
    );
  });
};

const connectToDatabase = async (dbName) => {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase(dbName);
    if (db !== null) {
      return resolve(db);
    }
    try {
      return resolve(await initializeDatabase(dbName));
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  connectToDatabase,
};
