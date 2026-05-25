const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

router.use(verifyToken);
router.get('/stats', controller.stats);

module.exports = router;
