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
  }
  return Promise.resolve(conf);
};

const buildUrl = conf =>
  Promise.resolve(conf.map((c) => {
    c.dbUrl = `mongodb://${c.dbUrl}`;
    return c;
  }));

const createConnection = async (conf) => {
  const res = [];
  for (const c of conf) {
    try {
      const client = await mongod.MongoClient.connect(c.dbUrl);
      assert.equal('object', typeof client, `an error occurs connecting to mongo ${c.dbUrl}/${c.dbName}!`);
      assert.equal(c.dbUrl, client.s.url, 'unexpected mongodb url');
      assert.equal(c.dbName, client.db(c.dbName).s.databaseName, 'unexpected mongodb name');
      res.push(client.db(c.dbName));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  return Promise.resolve(res);
};

/**
* create a connection to mongoDB using conf
* @param  {Object} conf Object configuration for connection to mongoDB
* @return {Promise}      If no error occurs it returns a Promise which resolves to a client DB object
*/
module.exports = conf =>
  checkConfiguration(conf)
  .then(buildUrl)
  .then(createConnection)
  .catch(err => new Error(err));
