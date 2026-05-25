const router = require('express').Router();
const { body } = require('express-validator');

const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const controller = require('../controllers/authController');

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 chars'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  validate,
  controller.login
);

router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', verifyToken, controller.me);

module.exports = router;
