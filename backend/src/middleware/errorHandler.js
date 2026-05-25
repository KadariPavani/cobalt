const logger = require('../utils/logger');
const HttpError = require('../utils/HttpError');

const notFoundHandler = (req, res, next) => {
  next(new HttpError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Postgres errors
  if (err.code === '23505') {
    status = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') {
    status = 400;
    message = 'Related resource does not exist';
  } else if (err.code === '22P02') {
    status = 400;
    message = 'Invalid input syntax';
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFoundHandler, errorHandler };
