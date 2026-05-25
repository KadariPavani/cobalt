const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRouter = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    // If CLIENT_URL is set, restrict to that origin. Otherwise reflect the
    // request's origin (useful when frontend and API share a domain on Vercel).
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
