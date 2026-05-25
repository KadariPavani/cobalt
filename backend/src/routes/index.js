const router = require('express').Router();

const { apiLimiter } = require('../middleware/rateLimit');
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const taskRoutes = require('./tasks');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');

router.use(apiLimiter);

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
