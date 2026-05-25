const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const projectService = require('../services/projectService');

const list = asyncHandler(async (req, res) => {
  const { status, priority, search, sort, order } = req.query;
  const projects = await projectService.list({ status, priority, search, sort, order });
  return success(res, { projects });
});

const get = asyncHandler(async (req, res) => {
  const project = await projectService.get(req.params.id);
  return success(res, { project });
});

const create = asyncHandler(async (req, res) => {
  const project = await projectService.create({
    ...req.body,
    createdBy: req.user.id,
  });
  return created(res, { project }, 'Project created');
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.update(req.params.id, req.body, req.user);
  return success(res, { project }, 'Project updated');
});

const remove = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id, req.user);
  return success(res, null, 'Project deleted');
});

module.exports = { list, get, create, update, remove };
