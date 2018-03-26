const connect = require('./lib/connect');
const use = require('./lib/use');

const _package = {
  connect,
  use,
};

module.exports = _package;

module.exports = async (configuration) => {
  try {
    const conf = configuration;
    const dbs = await connect(conf);
    const middleware = () => use(dbs);
    
    return {
      conf,
      dbs,
      middleware,
    };
  } catch (e) {
    return e;
  }
};
