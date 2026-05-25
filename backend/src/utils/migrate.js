/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function loadMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

function parseMigration(sql) {
  const upMatch = sql.match(/--\s*Up([\s\S]*?)(?=--\s*Down|$)/i);
  const downMatch = sql.match(/--\s*Down([\s\S]*)$/i);
  return {
    up: upMatch ? upMatch[1].trim() : sql.trim(),
    down: downMatch ? downMatch[1].trim() : '',
  };
}

async function applied() {
  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function up() {
  await ensureMigrationsTable();
  const done = await applied();
  const files = loadMigrationFiles();
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const { up: upSql } = parseMigration(sql);
    console.log(`-> applying ${file}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(upSql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed migration ${file}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }
  console.log('Migrations up-to-date.');
}

async function down() {
  await ensureMigrationsTable();
  const { rows } = await pool.query(
    'SELECT filename FROM schema_migrations ORDER BY filename DESC'
  );
  for (const { filename } of rows) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    const { down: downSql } = parseMigration(sql);
    if (!downSql) {
      console.warn(`No Down section for ${filename}, skipping.`);
      continue;
    }
    console.log(`<- rolling back ${filename}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(downSql);
      await client.query('DELETE FROM schema_migrations WHERE filename = $1', [filename]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed rollback ${filename}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }
  console.log('All migrations rolled back.');
}

(async () => {
  const cmd = process.argv[2] || 'up';
  try {
    if (cmd === 'up') await up();
    else if (cmd === 'down') await down();
    else throw new Error(`Unknown command: ${cmd}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
