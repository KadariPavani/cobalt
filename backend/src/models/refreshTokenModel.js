const crypto = require('crypto');
const { query } = require('../config/db');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

const store = async ({ userId, token, expiresAt }) => {
  const tokenHash = hash(token);
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
};

const findValid = async (token) => {
  const tokenHash = hash(token);
  const { rows } = await query(
    `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
      LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

const revoke = async (token) => {
  const tokenHash = hash(token);
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
      WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
};

const revokeAllForUser = async (userId) => {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
};

module.exports = { store, findValid, revoke, revokeAllForUser };
