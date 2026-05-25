const success = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Created') => success(res, data, message, 201);

const failure = (res, message = 'Error', status = 400, errors = undefined) =>
  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });

module.exports = { success, created, failure };
