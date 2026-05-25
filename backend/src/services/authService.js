const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const HttpError = require('../utils/HttpError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role || 'member',
  avatarUrl: u.avatar_url,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
});

const issueTokens = async (user) => {
  const payload = { sub: user.id, email: user.email, role: user.role || 'member' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const decoded = verifyRefreshToken(refreshToken);
  await refreshTokenModel.store({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(decoded.exp * 1000),
  });
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw new HttpError('Email already registered', 409);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ name, email, passwordHash });
  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new HttpError('Invalid credentials', 401);
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new HttpError('Invalid credentials', 401);
  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new HttpError('No refresh token provided', 401);
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError('Invalid refresh token', 401);
  }
  const stored = await refreshTokenModel.findValid(refreshToken);
  if (!stored) throw new HttpError('Refresh token revoked or expired', 401);
  const user = await userModel.findById(payload.sub);
  if (!user) throw new HttpError('User no longer exists', 401);

  // Rotate refresh token
  await refreshTokenModel.revoke(refreshToken);
  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
};

const logout = async (refreshToken) => {
  if (refreshToken) await refreshTokenModel.revoke(refreshToken);
};

const me = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpError('User not found', 404);
  return toPublicUser(user);
};

module.exports = { register, login, refresh, logout, me, toPublicUser };
