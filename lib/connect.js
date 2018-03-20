const assert = require('assert');
const mongod = require('mongodb');

const checkConfiguration = (conf) => {
  try {
    assert.equal('object', typeof conf, 'configuration is not an Object!');
    assert.notEqual(null, conf.dbName, 'dbName not found in configuration!');
    assert.equal('string', typeof conf.dbName, 'dbName has to be of string type!');
    assert.notEqual(null, conf.dbUrl, 'dbUrl not found in configuration!');
    assert.equal('string', typeof conf.dbUrl, 'dbUrl has to be of string type!');
  } catch (e) {
    return Promise.reject(e);
  }
  // if ('object' !== typeof conf) {
  //   return Promise.reject('configuration is not an Object!');
  // }
  // if (!conf.dbName) {
  //   return Promise.reject('dbName not found in configuration!');
  // }
  // if ('string' !== typeof conf.dbName) {
  //   return Promise.reject('dbName has to be of string type!');
  // }
  // if (!conf.dbUrl) {
  //   return Promise.reject('dbUrl not found in configuration!');
  // }
  // if ('string' !== typeof conf.dbUrl) {
  //   return Promise.reject('dbUrl has to be of string type!');
  // }
  return Promise.resolve(conf);
}

const buildUrl = (conf) => {
  conf.dbUrl = `mongodb://${conf.dbUrl}`;
  return Promise.resolve(conf);
}

const createConnection = (conf) =>
  mongod.MongoClient.connect(conf.dbUrl)
  .then(client => client.db(`${conf.dbName}`));

/**
 * create a connection to mongoDB using conf
 * @param  {Object} conf Object configuration for connection to mongoDB
 * @return {Promise}      If no error occurs it returns a Promise which resolves to a client DB object
 */
module.exports = (conf) =>
  checkConfiguration(conf)
  .then(buildUrl)
  .then(createConnection)
  .catch(err => new Error(err));
