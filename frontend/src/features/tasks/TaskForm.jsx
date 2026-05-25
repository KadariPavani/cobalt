import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Lock, X } from 'lucide-react';

import { usersApi } from '@/api/users';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { TASK_STATUSES, PRIORITIES } from '@/utils/constants';

const schema = z.object({
  title: z.string().min(2, 'Title is too short').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
});

const empty = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  assignedTo: '',
};

export default function TaskForm({
  open,
  onClose,
  task,
  projectId,
  defaultStatus,
  readOnly = false,
}) {
  const isEdit = Boolean(task?.id);
  const create = useCreateTask();
  const update = useUpdateTask();
  const pending = create.isPending || update.isPending;

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? {
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            dueDate: task.due_date ? String(task.due_date).slice(0, 10) : '',
            assignedTo: task.assigned_to || '',
          }
        : { ...empty, status: defaultStatus || 'todo' }
    );
  }, [open, task, defaultStatus, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      description: values.description || null,
      dueDate: values.dueDate || null,
      assignedTo: values.assignedTo || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: task.id, data: payload });
      } else {
        await create.mutateAsync({ projectId, data: payload });
      }
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  if (!open) return null;

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-40 bg-surface-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-surface-900 border-l border-white/[0.06] shadow-2xl animate-slide-in-right flex flex-col"
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <h2 id="task-form-title" className="text-base font-semibold tracking-tight truncate">
              {readOnly ? 'Task details' : isEdit ? 'Edit task' : 'New task'}
            </h2>
            {readOnly && (
              <span
                title="You can act on tasks you created or were assigned to"
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-medium text-slate-400 ring-1 ring-inset ring-white/10"
              >
                <Lock className="h-2.5 w-2.5" /> Read-only
              </span>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          id="task-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-95">
            <Field id="title" label="Title" error={errors.title?.message}>
              <input id="title" className="input" placeholder="What needs to be done?" {...register('title')} />
            </Field>

            <Field id="description" label="Description">
              <textarea
                id="description"
                rows={5}
                className="input resize-none"
                placeholder="Add context, acceptance criteria, links…"
                {...register('description')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="status" label="Status">
                <select id="status" className="input" {...register('status')}>
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field id="priority" label="Priority">
                <select id="priority" className="input" {...register('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field id="dueDate" label="Due date">
                <input id="dueDate" type="date" className="input" {...register('dueDate')} />
              </Field>
              <Field id="assignedTo" label="Assignee">
                <select id="assignedTo" className="input" {...register('assignedTo')}>
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </fieldset>
        </form>

        <div className="p-5 border-t border-white/[0.06] flex items-center justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={pending}>
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button type="submit" form="task-form" className="btn-primary" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          )}
        </div>
      </aside>
    </Fragment>
  );
}

const Field = ({ id, label, error, children }) => (
  <div className="space-y-1.5">
    <label className="label" htmlFor={id}>{label}</label>
    {children}
    {error && <p className="text-xs text-rose-400">{error}</p>}
  </div>
);
