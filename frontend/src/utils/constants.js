export const TASK_STATUSES = [
  { value: 'todo',        label: 'To-Do',        color: 'slate'  },
  { value: 'in_progress', label: 'In Progress',  color: 'amber'  },
  { value: 'completed',   label: 'Completed',    color: 'emerald'},
];

export const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'sky'   },
  { value: 'medium', label: 'Medium', color: 'amber' },
  { value: 'high',   label: 'High',   color: 'rose'  },
];

export const PROJECT_STATUSES = [
  { value: 'active',   label: 'Active',   color: 'emerald' },
  { value: 'archived', label: 'Archived', color: 'slate'   },
];

export const statusLabel = (value) =>
  TASK_STATUSES.find((s) => s.value === value)?.label || value;

export const priorityLabel = (value) =>
  PRIORITIES.find((p) => p.value === value)?.label || value;

export const projectStatusLabel = (value) =>
  PROJECT_STATUSES.find((s) => s.value === value)?.label || value;
