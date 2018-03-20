const mongod = require('mongodb');

function buildUrl(conf) {
  console.log('buildUrl');
  Promise.resolve(`mongodb://${conf.dbUrl}`);
}

function checkConfiguration(conf) {
  console.log('checkConfiguration');
  if (!conf.dbName) {
    return Promise.reject('dbName not found in configuration!')
  }
  if ('string' !== typeof conf.dbName) {
    return Promise.reject('dbName has to be of string type!')
  }
  if (!conf.dbUrl) {
    return Promise.reject('dbUrl not found in configuration!')
  }
  if ('string' !== typeof conf.dbUrl) {
    return Promise.reject('dbUrl has to be of string type!')
  }
  return Promise.resolve(conf);
}

function createConnection(url) {
  console.log('createConnection');
  mongod.MongoClient.connect(connectionUrl)
  .then(client => client.db(`${db}`));
}

module.exports.connect = (conf) => {
  checkConfiguration(conf)
  .then(buildUrl)
  .then(createConnection)
  .catch(err => new Error(err));
};

module.exports.use = (db) => (req, res, next) => {
  if (!req.dbs) { req.dbs = {} }
  req.dbs[dbName] = db;
  return next();
};
