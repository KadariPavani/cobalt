require('dotenv').config();
const app = require('../backend/src/app');
const { validateEnv } = require('../backend/src/config/env');

// Validate required environment variables early
validateEnv();

// Export Express app as a Vercel-compatible handler
module.exports = (req, res) => app(req, res);
