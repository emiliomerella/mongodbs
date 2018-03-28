module.exports = () => (req, res, next) => {
  if (res.headersSent) {
    console.log('[ INFO ] - cannot exit response because headers have been already sent');
    return next();
  }

  const statusCode = res.mongoResponse.statusCode || 200;
  const { data } = res.mongoResponse;

  return res.status(statusCode).json(data);
};
