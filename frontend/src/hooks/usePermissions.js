import { useAuthStore } from '@/store/authStore';

/**
 * Mirrors backend/src/utils/authz.js. The backend is authoritative — these
 * helpers exist so the UI can hide actions the user can't perform.
 *
 * Rules:
 *  - admin       — can do everything, everywhere
 *  - members     — can see every task and project, but can only edit/complete
 *                  a task they created or were assigned to, and can only
 *                  delete a task they created. Project edit/delete remains
 *                  restricted to the project's creator (or admin).
 */
export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'member';
  const isAdmin = role === 'admin';
  const isMember = role === 'member';

  const ownsProject = (project) =>
    Boolean(user && project) && project.created_by === user.id;

  const isTaskCreator = (task) =>
    Boolean(user && task) && task.created_by === user.id;

  const isTaskAssignee = (task) =>
    Boolean(user && task) && task.assigned_to && task.assigned_to === user.id;

  const canEditProject = (project) =>
    Boolean(user && project) && (isAdmin || ownsProject(project));

  const canDeleteProject = canEditProject;

  const canEditTask = (task) =>
    Boolean(user && task) &&
    (isAdmin || isTaskCreator(task) || isTaskAssignee(task));

  const canDeleteTask = (task) =>
    Boolean(user && task) && (isAdmin || isTaskCreator(task));

  // Reason string used by the UI to explain why an action is unavailable.
  const taskLockReason = (task) => {
    if (!user || !task) return 'Sign in to act on this task';
    if (isAdmin) return null;
    if (isTaskCreator(task) || isTaskAssignee(task)) return null;
    return 'View only — you can act on tasks you created or were assigned to';
  };

  return {
    user,
    role,
    isAdmin,
    isMember,
    ownsProject,
    isTaskCreator,
    isTaskAssignee,
    canEditProject,
    canDeleteProject,
    canEditTask,
    canDeleteTask,
    taskLockReason,
  };
};
