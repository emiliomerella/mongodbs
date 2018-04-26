const assert = require('assert');
const mongod = require('mongodb');

const buildModels = require('./buildModels');

const checkConfiguration = (conf) => {
  try {
    assert.equal('object', typeof conf, 'configuration is not an Object!');

    if (!conf.length) {
      conf = [conf];
    }

    conf.forEach((c) => {
      assert.equal('string', typeof c.dbName, 'dbName has to be of string type!');
      assert.ok(c.dbHost, 'dbHost must be defined, and ha to be as of string or as of array type');
    });
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve(conf);
};

const buildUrl = (conf) => {
  let error;
  conf.map((c) => {
    if (typeof c.dbHost === 'string' && c.dbHost.indexOf('mongodb://') === 0) {
      c.dbHost = c.dbHost.slice(9);
    } else if (typeof c.dbHost === 'object' && c.dbHost.length) {
      if (!c.replicaSet) {
        error = new Error('multiple hosts requires replicaSet to be configured');
      }
      c.dbHost = c.dbHost.reduce((acc, curr) => {
        if (curr.indexOf('mongodb://') === 0) {
          curr = curr.slice(9);
        }
        return acc.length ? `${acc},${curr}` : curr;
      }, '');

      c.dbHost = `${c.dbHost}/?replicaSet=${c.replicaSet}`;
    }
    c.dbHost = `mongodb://${c.dbHost}`;

    return c;
  });
  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve(conf);
};

const createConnection = async (conf) => {
  const res = {};
  for (const c of conf) {
    try {
      const client = await mongod.MongoClient.connect(c.dbHost, c.options);
      assert.equal('object', typeof client, `an error occurs connecting to mongo ${c.dbHost}/${c.dbName}!`);
      assert.equal(c.dbHost, client.s.url, 'unexpected mongodb url');
      assert.equal(c.dbName, client.db(c.dbName).s.databaseName, 'unexpected mongodb name');
      const db = await buildModels(client.db(c.dbName), c);
      res[c.dbName] = db;
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
