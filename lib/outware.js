module.exports = () => (req, res, next) => {
  if (req.headersSent) {
    console.log('[ INFO ] - cannot exit response because headers have been already sent');
    return next();
  }

  const statusCode = req.mongoResponse.statusCode || 200;
  const { data } = req.mongoResponse;

  return res.status(statusCode).json(data);
};
