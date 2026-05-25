const projectModel = require('../models/projectModel');
const HttpError = require('../utils/HttpError');
const {
  canEditProject,
  canDeleteProject,
  assertCan,
} = require('../utils/authz');

const list = (filters) => projectModel.list(filters);

const get = async (id) => {
  const project = await projectModel.findById(id);
  if (!project) throw new HttpError('Project not found', 404);
  return project;
};

const create = (data) => projectModel.create(data);

const update = async (id, data, user) => {
  const existing = await projectModel.findById(id);
  if (!existing) throw new HttpError('Project not found', 404);
  assertCan(
    canEditProject(user, existing),
    'Only the project creator or an admin can edit this project.'
  );
  return projectModel.update(id, data);
};

const remove = async (id, user) => {
  const existing = await projectModel.findById(id);
  if (!existing) throw new HttpError('Project not found', 404);
  assertCan(
    canDeleteProject(user, existing),
    'Only the project creator or an admin can delete this project.'
  );
  return projectModel.remove(id);
};

module.exports = { list, get, create, update, remove };
