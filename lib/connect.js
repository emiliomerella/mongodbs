const async = require('async');
const assert = require('assert');
const mongod = require('mongodb');

const checkConfiguration = (conf) => {
  try {
    assert.equal('object', typeof conf, 'configuration is not an Object!');

    if (!conf.length) {
      conf = [conf];
    }

    conf.forEach((c) => {
      assert.equal('string', typeof c.dbName, 'dbName has to be of string type!');
      assert.equal('string', typeof c.dbUrl, 'dbUrl has to be of string type!');
    });
  } catch (e) {
    return Promise.reject(e);
  } finally {
    return Promise.resolve(conf);
  }
}

const buildUrl = (conf) =>
Promise.resolve(conf.map((c) => {
  c.dbUrl = `mongodb://${c.dbUrl}`;
  return c;
}));


const createConnection = (conf) =>
new Promise((resolve, reject) => {
  async.map(conf, (c, callback) => {
    mongod.MongoClient.connect(c.dbUrl)
    .then((client) => {
      c = client.db(`${c.dbName}`);
      callback(null, c);
    })
    .catch(err => callback(err));
  }, (err, res) => {
    if (err) {
      return reject(err);
    }
    return resolve(res);
  })
});


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
