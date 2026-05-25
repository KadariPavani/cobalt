/* eslint-disable no-console */
// One-off migration runner that talks to Neon over HTTPS,
// for environments where outbound 5432 is blocked.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function loadMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

function parseMigration(text) {
  const upMatch = text.match(/--\s*Up([\s\S]*?)(?=--\s*Down|$)/i);
  return upMatch ? upMatch[1].trim() : text.trim();
}

async function applied() {
  const rows = await sql`SELECT filename FROM schema_migrations`;
  return new Set(rows.map((r) => r.filename));
}

async function up() {
  await ensureMigrationsTable();
  const done = await applied();
  const files = loadMigrationFiles();
  for (const file of files) {
    if (done.has(file)) {
      console.log(`-- already applied: ${file}`);
      continue;
    }
    const text = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const upSql = parseMigration(text);
    console.log(`-> applying ${file}`);
    // neon() http driver runs statements one at a time; split on ; while
    // ignoring semicolons inside $$ ... $$ blocks (used for PL/pgSQL bodies).
    const statements = splitSql(upSql);
    for (const stmt of statements) {
      if (!stmt.trim()) continue;
      await sql.query(stmt);
    }
    await sql`INSERT INTO schema_migrations(filename) VALUES (${file})`;
  }
  console.log('Migrations up-to-date.');
}

function splitSql(input) {
  const out = [];
  let buf = '';
  let inDollar = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next2 = input.slice(i, i + 2);
    if (next2 === '$$') {
      inDollar = !inDollar;
      buf += '$$';
      i++;
      continue;
    }
    if (ch === ';' && !inDollar) {
      out.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

up().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
