const assert = require('assert');

/**
 * Add a client db to req.dbs object, named as the databaseName
 * @param  {Array} dbs A client db object(s) array
 * @return {Function}    Returns next Function which works as normal middleware
 */
module.exports = dbs => (req, res, next) => {
  try {
    assert.notEqual(null, dbs, 'you MUST pass a database(s) array');
    assert.equal('object', typeof dbs, `db not instantiated. ${dbs}`);
  } catch (e) {
    return next(e);
  }
  if (!req.dbs) {
    // req.dbs = {};
    req.dbs = dbs;
  }
  // dbs.forEach((db) => {
  //   req.dbs[db.databaseName] = db;
  // });
  return next();
};
