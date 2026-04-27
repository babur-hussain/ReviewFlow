function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    message: err.publicMessage || "Something went wrong",
  });
}

module.exports = errorHandler;
