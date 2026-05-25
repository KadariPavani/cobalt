import { api } from './client';

const clean = (p = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
};

export const tasksApi = {
  list:        (params) => api.get('/tasks', { params: clean(params) }).then((r) => r.data.data.tasks),
  listForProject: (projectId, params) =>
    api.get(`/projects/${projectId}/tasks`, { params: clean(params) }).then((r) => r.data.data.tasks),
  get:    (id) => api.get(`/tasks/${id}`).then((r) => r.data.data.task),
  create: (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data.data.task),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data.data.task),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
