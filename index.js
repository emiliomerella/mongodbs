const assert = require('assert');

const connect = require('./lib/connect');
const begin = require('./lib/beginware');
const out = require('./lib/outware');

module.exports = (app, configuration, options) =>
  new Promise(async (resolve, reject) => {
    if (!options) {
      options = {
        addDbsToReq: true,
      };
    }

    try {
      assert.equal('function', typeof app);
      assert.equal('function', typeof app.use);

      const conf = configuration;
      const dbs = await connect(conf);

      if (options.addDbsToReq) {
        app.use(begin(dbs));
      }

      return resolve(dbs);
    } catch (e) {
      return reject(e);
    }
  });


module.exports.response = out;
