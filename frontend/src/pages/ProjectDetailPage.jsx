import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  LayoutGrid,
  Rows3,
  Pencil,
  Trash2,
  Plus,
  ListTodo,
} from 'lucide-react';

import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import Skeleton from '@/components/Skeleton';
import KanbanBoard from '@/features/tasks/KanbanBoard';
import TaskList from '@/features/tasks/TaskList';
import TaskForm from '@/features/tasks/TaskForm';
import TaskFilters from '@/features/tasks/TaskFilters';
import ProjectForm from '@/features/projects/ProjectForm';
import {
  useProjectQuery,
  useDeleteProject,
} from '@/hooks/useProjects';
import {
  useProjectTasksQuery,
  useDeleteTask,
  useUpdateTaskStatus,
} from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate, fromNow, isOverdue } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('kanban');
  const [editingProject, setEditingProject] = useState(false);
  const [confirmProjectDelete, setConfirmProjectDelete] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [confirmTaskDelete, setConfirmTaskDelete] = useState(null);

  const { data: project, isLoading } = useProjectQuery(id);
  const removeProject = useDeleteProject();
  const removeTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  const { canEditProject, canDeleteProject, canEditTask } = usePermissions();
  const mayEditProject = project ? canEditProject(project) : false;
  const mayDeleteProject = project ? canDeleteProject(project) : false;

  const { values, setValue, clear, activeCount } = useUrlFilters({
    search: '',
    status: '',
    priority: '',
    assigned_to: '',
  });
  const debouncedSearch = useDebounce(values.search, 300);

  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasksQuery(id, {
    status: values.status,
    priority: values.priority,
    assigned_to: values.assigned_to,
    search: debouncedSearch,
  });

  const overdueDeadline = useMemo(
    () => isOverdue(project?.deadline) && project?.status === 'active',
    [project]
  );

  const handleAdd = (status = 'todo') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskFormOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleToggle = (task) => {
    const next = task.status === 'completed' ? 'todo' : 'completed';
    updateStatus.mutate({ id: task.id, status: next, projectId: id });
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: project?.name || '…' },
        ]}
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={() => handleAdd('todo')}>
            <Plus className="h-4 w-4" /> New task
          </button>
        }
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-[1480px] w-full mx-auto">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>

        {isLoading || !project ? (
          <ProjectHeaderSkeleton />
        ) : (
          <header className="card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <StatusBadge value={project.status} kind="project" />
                  <PriorityBadge value={project.priority} />
                  {project.deadline && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs',
                        overdueDeadline ? 'text-rose-400 font-medium' : 'text-slate-400'
                      )}
                    >
                      <CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(project.deadline)}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-fluid-h1 leading-[1.05] tracking-tightest text-balance text-slate-50">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-slate-400 mt-2 max-w-3xl leading-relaxed">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-3">
                  Created by {project.creator_name || 'Unknown'} · {fromNow(project.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {mayEditProject && (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setEditingProject(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {mayDeleteProject && (
                  <button
                    type="button"
                    className="btn-ghost btn-sm text-rose-300 hover:bg-rose-500/10"
                    onClick={() => setConfirmProjectDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
                {!mayEditProject && !mayDeleteProject && (
                  <span className="chip">View only</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <Stat label="Tasks"        value={project.total_tasks} />
              <Stat label="In progress"  value={project.in_progress_tasks} accent="amber" />
              <Stat label="Completed"    value={project.completed_tasks} accent="emerald" />
              <Stat
                label="Completion"
                value={`${
                  project.total_tasks > 0
                    ? Math.round((project.completed_tasks / project.total_tasks) * 100)
                    : 0
                }%`}
                accent="brand"
              />
            </div>
          </header>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex p-1 rounded-xl bg-surface-850/80 border border-white/[0.05]">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={cn(
                'btn-sm rounded-lg gap-1.5',
                view === 'kanban' ? 'bg-white/[0.08] text-white' : 'text-slate-400'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'btn-sm rounded-lg gap-1.5',
                view === 'list' ? 'bg-white/[0.08] text-white' : 'text-slate-400'
              )}
            >
              <Rows3 className="h-3.5 w-3.5" /> List
            </button>
          </div>
        </div>

        <TaskFilters
          values={values}
          setValue={setValue}
          clear={clear}
          activeCount={activeCount}
        />

        {tasksLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface-900/60 border border-white/[0.05] p-3 space-y-2.5 min-h-[300px]">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks here yet"
            description="Add your first task to get started — drag between columns to update status."
            action={
              <button type="button" className="btn-primary btn-sm" onClick={() => handleAdd('todo')}>
                <Plus className="h-4 w-4" /> Add task
              </button>
            }
          />
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            projectId={id}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={(t) => setConfirmTaskDelete(t)}
            onToggle={handleToggle}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={(t) => setConfirmTaskDelete(t)}
            onToggle={handleToggle}
          />
        )}
      </main>

      <ProjectForm
        open={editingProject}
        onClose={() => setEditingProject(false)}
        project={project}
      />

      <ConfirmDialog
        open={confirmProjectDelete}
        onClose={() => setConfirmProjectDelete(false)}
        onConfirm={async () => {
          await removeProject.mutateAsync(id);
          navigate('/projects', { replace: true });
        }}
        loading={removeProject.isPending}
        title={`Delete "${project?.name}"?`}
        description="This permanently removes the project and every task in it."
      />

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editingTask}
        projectId={id}
        defaultStatus={defaultStatus}
        readOnly={Boolean(editingTask) && !canEditTask(editingTask)}
      />

      <ConfirmDialog
        open={Boolean(confirmTaskDelete)}
        onClose={() => setConfirmTaskDelete(null)}
        onConfirm={async () => {
          if (!confirmTaskDelete) return;
          await removeTask.mutateAsync(confirmTaskDelete.id);
          setConfirmTaskDelete(null);
        }}
        loading={removeTask.isPending}
        title="Delete this task?"
        description={confirmTaskDelete?.title}
      />
    </>
  );
}

const Stat = ({ label, value, accent = 'slate' }) => {
  const accents = {
    slate:   'text-slate-100',
    amber:   'text-amber-300',
    emerald: 'text-emerald-300',
    brand:   'text-brand-300',
  };
  return (
    <div className="rounded-xl bg-surface-850/60 border border-white/[0.04] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('text-xl font-semibold mt-1', accents[accent])}>{value}</p>
    </div>
  );
};

const ProjectHeaderSkeleton = () => (
  <div className="card p-7 space-y-4">
    <div className="flex gap-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-24" />
    </div>
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  </div>
);
