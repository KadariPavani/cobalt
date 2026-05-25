const { query } = require('../config/db');

const PUBLIC_COLS = 'id, name, email, role, avatar_url, created_at, updated_at';

const findByEmail = async (email) => {
  const { rows } = await query(
    `SELECT id, name, email, password_hash, role, avatar_url, created_at, updated_at
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, email, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash)
       VALUES ($1, LOWER($2), $3)
     RETURNING ${PUBLIC_COLS}`,
    [name, email, passwordHash]
  );
  return rows[0];
};

const listAll = async () => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLS} FROM users ORDER BY name ASC`
  );
  return rows;
};

module.exports = { findByEmail, findById, create, listAll };
