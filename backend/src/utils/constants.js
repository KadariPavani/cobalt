const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

const TASK_STATUSES = Object.values(TASK_STATUS);

const PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

const PRIORITIES = Object.values(PRIORITY);

const PROJECT_STATUS = Object.freeze({
  ACTIVE: 'active',
  ARCHIVED: 'archived',
});

const PROJECT_STATUSES = Object.values(PROJECT_STATUS);

module.exports = {
  TASK_STATUS,
  TASK_STATUSES,
  PRIORITY,
  PRIORITIES,
  PROJECT_STATUS,
  PROJECT_STATUSES,
};
