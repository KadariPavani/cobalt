const taskModel = require('../models/taskModel');
const projectModel = require('../models/projectModel');
const HttpError = require('../utils/HttpError');
const {
  canEditTask,
  canDeleteTask,
  assertCan,
} = require('../utils/authz');

const list = (filters, sortOpts) => taskModel.list(filters, sortOpts);

const get = async (id) => {
  const task = await taskModel.findById(id);
  if (!task) throw new HttpError('Task not found', 404);
  return task;
};

const create = async (data) => {
  const project = await projectModel.findById(data.projectId);
  if (!project) throw new HttpError('Project not found', 404);
  // Any authenticated user can add a task to any project; the creator is
  // recorded for later ownership checks.
  return taskModel.create(data);
};

const update = async (id, data, user) => {
  const existing = await taskModel.findById(id);
  if (!existing) throw new HttpError('Task not found', 404);
  assertCan(
    canEditTask(user, existing),
    'You can only edit tasks you created or were assigned to.'
  );
  return taskModel.update(id, data);
};

const updateStatus = async (id, status, user) => {
  const existing = await taskModel.findById(id);
  if (!existing) throw new HttpError('Task not found', 404);
  assertCan(
    canEditTask(user, existing),
    'You can only change status on tasks you created or were assigned to.'
  );
  const updated = await taskModel.updateStatus(id, status);
  if (!updated) throw new HttpError('Task not found', 404);
  return updated;
};

const remove = async (id, user) => {
  const existing = await taskModel.findById(id);
  if (!existing) throw new HttpError('Task not found', 404);
  assertCan(
    canDeleteTask(user, existing),
    'Only the task creator or an admin can delete this task.'
  );
  return taskModel.remove(id);
};

module.exports = { list, get, create, update, updateStatus, remove };
