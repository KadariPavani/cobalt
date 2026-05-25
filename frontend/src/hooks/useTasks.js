import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { tasksApi } from '@/api/tasks';
import { apiMessage } from '@/api/client';

const KEY = 'tasks';

export const useTasksQuery = (params = {}) =>
  useQuery({
    queryKey: [KEY, 'global', params],
    queryFn: () => tasksApi.list(params),
  });

export const useProjectTasksQuery = (projectId, params = {}) =>
  useQuery({
    queryKey: [KEY, 'project', projectId, params],
    queryFn: () => tasksApi.listForProject(projectId, params),
    enabled: Boolean(projectId),
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY] });
  qc.invalidateQueries({ queryKey: ['projects'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
};

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => tasksApi.create(projectId, data),
    onSuccess: (_, vars) => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY, 'project', vars.projectId] });
      toast.success('Task created');
    },
    onError: (err) => toast.error(apiMessage(err, 'Could not create task')),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Task updated');
    },
    onError: (err) => toast.error(apiMessage(err, 'Update failed')),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.remove(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success('Task deleted');
    },
    onError: (err) => toast.error(apiMessage(err, 'Delete failed')),
  });
};

// Optimistic status updates for the Kanban board.
export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => tasksApi.update(id, { status }),
    onMutate: async ({ id, status, projectId }) => {
      const key = projectId
        ? [KEY, 'project', projectId]
        : [KEY, 'global'];
      await qc.cancelQueries({ queryKey: key });
      const snapshots = qc.getQueriesData({ queryKey: key });
      qc.setQueriesData({ queryKey: key }, (old) =>
        Array.isArray(old) ? old.map((t) => (t.id === id ? { ...t, status } : t)) : old
      );
      return { snapshots };
    },
    onError: (err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([k, data]) => qc.setQueryData(k, data));
      toast.error(apiMessage(err, 'Could not update status'));
    },
    onSettled: () => invalidateAll(qc),
  });
};
