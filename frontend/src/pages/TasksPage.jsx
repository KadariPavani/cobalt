import { useMemo, useState } from 'react';
import { ListTodo, Lock, Shield, User as UserIcon } from 'lucide-react';

import Topbar from '@/components/Topbar';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import ConfirmDialog from '@/components/ConfirmDialog';
import TaskFilters from '@/features/tasks/TaskFilters';
import TaskList from '@/features/tasks/TaskList';
import TaskForm from '@/features/tasks/TaskForm';

import { useTasksQuery, useDeleteTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';

export default function TasksPage() {
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { user, isAdmin, canEditTask } = usePermissions();
  const remove = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  const { values, setValue, clear, activeCount } = useUrlFilters({
    search: '',
    status: '',
    priority: '',
    assigned_to: '',
  });
  const debouncedSearch = useDebounce(values.search, 300);

  const { data: tasks = [], isLoading } = useTasksQuery({
    status: values.status,
    priority: values.priority,
    assigned_to: values.assigned_to,
    search: debouncedSearch,
    sort: 'due_date',
    order: 'asc',
  });

  const counts = useMemo(() => {
    let editable = 0;
    let readOnly = 0;
    for (const t of tasks) {
      if (canEditTask(t)) editable++;
      else readOnly++;
    }
    return { editable, readOnly, total: tasks.length };
  }, [tasks, canEditTask]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleToggle = (task) => {
    const next = task.status === 'completed' ? 'todo' : 'completed';
    updateStatus.mutate({ id: task.id, status: next });
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Tasks' }]} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-[1480px] w-full mx-auto">
        <header className="space-y-3">
          <div className="space-y-1.5">
            <p className="label">Cross-project</p>
            <h1 className="font-display text-fluid-h1 leading-[1.05] tracking-tightest text-slate-50">
              All tasks
            </h1>
            <p className="text-[13.5px] text-slate-400 max-w-xl">
              {isAdmin
                ? 'Every task across every project — you can edit and complete any of them.'
                : 'Every task across every project. You can edit or complete the ones you created or were assigned.'}
            </p>
          </div>

          <PermissionInspector
            user={user}
            isAdmin={isAdmin}
            counts={counts}
            loading={isLoading}
          />
        </header>

        <TaskFilters
          values={values}
          setValue={setValue}
          clear={clear}
          activeCount={activeCount}
        />

        {isLoading ? (
          <div className="card p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 my-1 mx-2" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks match"
            description="Try clearing filters, or create new tasks inside a project."
          />
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={(t) => setConfirmDelete(t)}
            onToggle={handleToggle}
            showProject
          />
        )}
      </main>

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editingTask}
        projectId={editingTask?.project_id}
        readOnly={Boolean(editingTask) && !canEditTask(editingTask)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await remove.mutateAsync(confirmDelete.id);
          setConfirmDelete(null);
        }}
        loading={remove.isPending}
        title="Delete this task?"
        description={confirmDelete?.title}
      />
    </>
  );
}

// Surface the active session and how the per-task rules are firing for it.
// Without this it's easy to misread "I'm signed in as a member but everything
// is editable" — usually it just means every visible task was either created
// by, or assigned to, that member.
const PermissionInspector = ({ user, isAdmin, counts, loading }) => {
  if (!user) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px]">
      <span
        className={
          isAdmin
            ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 font-medium text-brand-200 ring-1 ring-inset ring-brand-500/30'
            : 'inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 font-medium text-slate-300 ring-1 ring-inset ring-white/10'
        }
      >
        {isAdmin ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
        Acting as {user.name} · {isAdmin ? 'Admin' : 'Member'}
      </span>
      {!loading && (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-200 ring-1 ring-inset ring-emerald-500/20">
            {counts.editable} editable
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 font-medium text-slate-400 ring-1 ring-inset ring-white/10">
            <Lock className="h-3 w-3" /> {counts.readOnly} read-only
          </span>
          {!isAdmin && counts.total > 0 && counts.readOnly === 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-200 ring-1 ring-inset ring-amber-500/30"
              title="Every visible task lists you as creator or assignee — that's why nothing looks restricted. Re-run the backend seed (npm run seed) to redistribute task ownership across multiple members."
            >
              ⚠ You're on every task — re-seed to see the rule fire
            </span>
          )}
        </>
      )}
    </div>
  );
};
