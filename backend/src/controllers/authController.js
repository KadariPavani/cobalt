const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const authService = require('../services/authService');
const { refreshCookieOptions } = require('../utils/jwt');

const REFRESH_COOKIE = 'rt';

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  setRefreshCookie(res, result.refreshToken);
  return created(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Account created'
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  setRefreshCookie(res, result.refreshToken);
  return success(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Signed in'
  );
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  return success(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Token refreshed'
  );
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  clearRefreshCookie(res);
  return success(res, null, 'Signed out');
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  return success(res, { user });
});

module.exports = { register, login, refresh, logout, me };
