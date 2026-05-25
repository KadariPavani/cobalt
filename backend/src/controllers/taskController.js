const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const taskService = require('../services/taskService');

const buildFilters = (query, extra = {}) => ({
  projectId:  extra.projectId || query.project_id || query.projectId,
  status:     query.status,
  priority:   query.priority,
  assignedTo: query.assigned_to || query.assignedTo,
  search:     query.search,
  overdueOnly: query.overdue === 'true' || query.overdue === '1',
});

const listGlobal = asyncHandler(async (req, res) => {
  const filters = buildFilters(req.query);
  const tasks = await taskService.list(filters, {
    sort: req.query.sort,
    order: req.query.order,
  });
  return success(res, { tasks });
});

const listForProject = asyncHandler(async (req, res) => {
  const filters = buildFilters(req.query, { projectId: req.params.id });
  const tasks = await taskService.list(filters, {
    sort: req.query.sort,
    order: req.query.order,
  });
  return success(res, { tasks });
});

const get = asyncHandler(async (req, res) => {
  const task = await taskService.get(req.params.id);
  return success(res, { task });
});

const createForProject = asyncHandler(async (req, res) => {
  const task = await taskService.create({
    ...req.body,
    projectId: req.params.id,
    createdBy: req.user.id,
  });
  return created(res, { task }, 'Task created');
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.params.id, req.body, req.user);
  return success(res, { task }, 'Task updated');
});

const remove = asyncHandler(async (req, res) => {
  await taskService.remove(req.params.id, req.user);
  return success(res, null, 'Task deleted');
});

module.exports = { listGlobal, listForProject, get, createForProject, update, remove };
