import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '@/components/Modal';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { PRIORITIES, PROJECT_STATUSES } from '@/utils/constants';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(180),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['active', 'archived']),
  deadline: z.string().optional().or(z.literal('')),
});

const empty = {
  name: '',
  description: '',
  priority: 'medium',
  status: 'active',
  deadline: '',
};

export default function ProjectForm({ open, onClose, project }) {
  const isEdit = Boolean(project?.id);
  const create = useCreateProject();
  const update = useUpdateProject();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      project
        ? {
            name: project.name || '',
            description: project.description || '',
            priority: project.priority || 'medium',
            status: project.status || 'active',
            deadline: project.deadline ? String(project.deadline).slice(0, 10) : '',
          }
        : empty
    );
  }, [open, project, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      description: values.description || null,
      deadline: values.deadline || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: project.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'Create project'}
      description={
        isEdit ? 'Update project details.' : 'Set up a new project workspace.'
      }
      size="lg"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            className="btn-primary"
            disabled={pending}
          >
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" placeholder="e.g. Q3 Platform Revamp" {...register('name')} />
          {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            className="input resize-none"
            placeholder="What is this project about?"
            {...register('description')}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" className="input" {...register('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" {...register('status')}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label" htmlFor="deadline">Deadline</label>
            <input id="deadline" type="date" className="input" {...register('deadline')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
