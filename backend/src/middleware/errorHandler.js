function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    message: err.publicMessage || err.message || "Something went wrong",
    stack: err.stack,
  });
}

module.exports = errorHandler;
