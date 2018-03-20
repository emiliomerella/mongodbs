/**
 * Add a client db to req.dbs object, named as the databaseName
 * @param  {Object} db A client db object
 * @return {Function}    Returns next Function which works as normal middleware
 */
module.exports = (db) => (req, res, next) => {
  if (!req.dbs) { req.dbs = {} }
  req.dbs[db.databaseName] = db;
  return next();
};
