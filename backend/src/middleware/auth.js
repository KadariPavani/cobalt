const HttpError = require('../utils/HttpError');
const { verifyAccessToken } = require('../utils/jwt');

const verifyToken = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError('Missing or malformed Authorization header', 401);
    }
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'member',
    };
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    return next(new HttpError('Invalid or expired access token', 401));
  }
};

module.exports = { verifyToken };
