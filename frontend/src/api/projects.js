import { api } from './client';

const cleanParams = (params = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
};

export const projectsApi = {
  list:   (params) => api.get('/projects', { params: cleanParams(params) }).then((r) => r.data.data.projects),
  get:    (id)     => api.get(`/projects/${id}`).then((r) => r.data.data.project),
  create: (data)   => api.post('/projects', data).then((r) => r.data.data.project),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data.data.project),
  remove: (id)     => api.delete(`/projects/${id}`).then((r) => r.data),
};
