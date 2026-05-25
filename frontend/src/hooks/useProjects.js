import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { projectsApi } from '@/api/projects';
import { apiMessage } from '@/api/client';

const KEY = 'projects';

export const useProjectsQuery = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => projectsApi.list(params),
  });

export const useProjectQuery = (id) =>
  useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => projectsApi.get(id),
    enabled: Boolean(id),
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Project created');
    },
    onError: (err) => toast.error(apiMessage(err, 'Could not create project')),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, 'detail', vars.id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Project updated');
    },
    onError: (err) => toast.error(apiMessage(err, 'Update failed')),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project deleted');
    },
    onError: (err) => toast.error(apiMessage(err, 'Delete failed')),
  });
};
