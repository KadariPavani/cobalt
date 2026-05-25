const HttpError = require('./HttpError');

const ROLES = Object.freeze({ ADMIN: 'admin', MEMBER: 'member' });

const isAdmin = (user) => user?.role === ROLES.ADMIN;

/**
 * Project ownership: only the creator (or any admin) can edit/delete.
 * Everyone authenticated can VIEW any project.
 */
const canEditProject = (user, project) =>
  Boolean(user && project) && (isAdmin(user) || project.created_by === user.id);

const canDeleteProject = canEditProject;

/**
 * Task ownership rules:
 *  - Admins can do anything.
 *  - Members can edit/complete a task only if they created it or were
 *    assigned to it. Members can see every task, but cannot mutate tasks
 *    that don't belong to them — even on a project they own.
 *  - Delete is stricter: only the creator (or an admin) can destroy a task;
 *    assignees can change/complete their work, but not erase it.
 */
const canEditTask = (user, task) => {
  if (!user || !task) return false;
  if (isAdmin(user)) return true;
  if (task.created_by === user.id) return true;
  if (task.assigned_to && task.assigned_to === user.id) return true;
  return false;
};

const canDeleteTask = (user, task) => {
  if (!user || !task) return false;
  if (isAdmin(user)) return true;
  if (task.created_by === user.id) return true;
  return false;
};

const assertCan = (allowed, message = 'You do not have permission to perform this action') => {
  if (!allowed) throw new HttpError(message, 403);
};

module.exports = {
  ROLES,
  isAdmin,
  canEditProject,
  canDeleteProject,
  canEditTask,
  canDeleteTask,
  assertCan,
};
