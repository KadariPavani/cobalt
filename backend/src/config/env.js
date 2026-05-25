const REQUIRED = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Copy .env.example to .env and fill in the values.`
    );
  }
  if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    throw new Error(
      'Either DATABASE_URL or PGHOST/PGUSER/PGDATABASE must be configured.'
    );
  }
}

module.exports = { validateEnv };
