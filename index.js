const mongod = require('mongodb');

const buildUrl = (conf) => {
  conf.dbUrl = `mongodb://${conf.dbUrl}`;
  return Promise.resolve(conf);
}

const checkConfiguration = (conf) => {
  if ('object' !== typeof conf) {
    return Promise.reject('configuration is not an Object!');
  }
  if (!conf.dbName) {
    return Promise.reject('dbName not found in configuration!');
  }
  if ('string' !== typeof conf.dbName) {
    return Promise.reject('dbName has to be of string type!');
  }
  if (!conf.dbUrl) {
    return Promise.reject('dbUrl not found in configuration!');
  }
  if ('string' !== typeof conf.dbUrl) {
    return Promise.reject('dbUrl has to be of string type!');
  }
  return Promise.resolve(conf);
}

const createConnection = (conf) =>
  mongod.MongoClient.connect(conf.dbUrl)
  .then(client => client.db(`${conf.dbName}`));

module.exports.connect = (conf) =>
  checkConfiguration(conf)
  .then(buildUrl)
  .then(createConnection)
  .catch(err => new Error(err));

module.exports.use = (db) => (req, res, next) => {
  if (!req.dbs) { req.dbs = {} }
  req.dbs[db.databaseName] = db;
  return next();
};
