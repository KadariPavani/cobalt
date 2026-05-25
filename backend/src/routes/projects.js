const router = require('express').Router();
const { body, param } = require('express-validator');

const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const controller = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const {
  PROJECT_STATUSES,
  PRIORITIES,
  TASK_STATUSES,
} = require('../utils/constants');

router.use(verifyToken);

const projectBody = (isUpdate = false) => {
  const name = body('name');
  const nameValidation = (isUpdate ? name.optional().bail() : name)
    .isString()
    .trim()
    .isLength({ min: 2, max: 180 })
    .withMessage('Name must be 2–180 chars');

  return [
    nameValidation,
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('status').optional().isIn(PROJECT_STATUSES),
    body('priority').optional().isIn(PRIORITIES),
    body('deadline')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Deadline must be ISO 8601 date'),
  ];
};

const idParam = param('id').isUUID().withMessage('Invalid project id');

router.get('/', controller.list);
router.post('/', projectBody(false), validate, controller.create);
router.get('/:id', idParam, validate, controller.get);
router.put('/:id', idParam, projectBody(true), validate, controller.update);
router.delete('/:id', idParam, validate, controller.remove);

// Tasks nested under projects
router.get('/:id/tasks', idParam, validate, taskController.listForProject);
router.post(
  '/:id/tasks',
  idParam,
  [
    body('title').isString().trim().isLength({ min: 2, max: 200 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('status').optional().isIn(TASK_STATUSES),
    body('priority').optional().isIn(PRIORITIES),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('assignedTo').optional({ nullable: true }).isUUID(),
  ],
  validate,
  taskController.createForProject
);

module.exports = router;
