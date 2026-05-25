const router = require('express').Router();
const { body, param } = require('express-validator');

const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const controller = require('../controllers/taskController');
const { TASK_STATUSES, PRIORITIES } = require('../utils/constants');

router.use(verifyToken);

const idParam = param('id').isUUID().withMessage('Invalid task id');

router.get('/', controller.listGlobal);
router.get('/:id', idParam, validate, controller.get);

router.put(
  '/:id',
  idParam,
  [
    body('title').optional().isString().trim().isLength({ min: 2, max: 200 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('status').optional().isIn(TASK_STATUSES),
    body('priority').optional().isIn(PRIORITIES),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('assignedTo').optional({ nullable: true }).isUUID(),
  ],
  validate,
  controller.update
);

router.delete('/:id', idParam, validate, controller.remove);

module.exports = router;
