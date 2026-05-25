const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const controller = require('../controllers/userController');

router.use(verifyToken);
router.get('/', controller.list);

module.exports = router;
