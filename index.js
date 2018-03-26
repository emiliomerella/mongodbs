const connect = require('./lib/connect');
const begin = require('./lib/beginware');
const out = require('./lib/outware');

module.exports = (app, configuration) =>
  new Promise(async (resolve, reject) => {
    try {
      const conf = configuration;
      const dbs = await connect(conf);
      app.use(begin(dbs));

      return resolve(dbs);
    } catch (e) {
      return reject(e);
    }
  });


module.exports.response = () => out();

// TODO: to be deprecated
module.exports.connect = connect;
module.exports.use = begin;
