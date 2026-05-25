const { validationResult } = require('express-validator');
const HttpError = require('../utils/HttpError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const formatted = errors.array({ onlyFirstError: true }).map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));
  return next(new HttpError('Validation failed', 422, formatted));
};

module.exports = { validate };
