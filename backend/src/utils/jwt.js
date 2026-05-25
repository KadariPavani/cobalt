const jwt = require('jsonwebtoken');

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRES });

const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET());
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET());

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshCookieOptions,
};
