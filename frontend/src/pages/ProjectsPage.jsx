import { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  Rows3,
  FolderKanban,
  Filter,
  CalendarDays,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Topbar from '@/components/Topbar';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import Skeleton from '@/components/Skeleton';
import ProjectForm from '@/features/projects/ProjectForm';
import ProjectCard from '@/features/projects/ProjectCard';

import { useProjectsQuery, useDeleteProject } from '@/hooks/useProjects';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { PROJECT_STATUSES, PRIORITIES } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const SORTS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'deadline',   label: 'By deadline' },
  { value: 'priority',   label: 'By priority' },
  { value: 'name',       label: 'Alphabetical' },
];

export default function ProjectsPage() {
  const [view, setView] = useState('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const remove = useDeleteProject();

  const { values, setValue, clear, activeCount } = useUrlFilters({
    search: '',
    status: '',
    priority: '',
    sort: 'created_at',
    order: 'desc',
  });

  const debouncedSearch = useDebounce(values.search, 300);

  const { data: projects, isLoading } = useProjectsQuery({
    status: values.status,
    priority: values.priority,
    search: debouncedSearch,
    sort: values.sort,
    order: values.sort === 'deadline' ? 'asc' : values.order,
  });

  const onCreate = () => { setEditing(null); setFormOpen(true); };
  const onEdit = (p) => { setEditing(p); setFormOpen(true); };
  const onDelete = (p) => setDeleting(p);
  const confirmDelete = async () => {
    if (!deleting) return;
    await remove.mutateAsync(deleting.id);
    setDeleting(null);
  };

  return (
    <>
      <Topbar
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
            <Plus className="h-4 w-4" /> New project
          </button>
        }
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-[1480px] w-full mx-auto">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <p className="label">Workspace</p>
            <h1 className="font-display text-fluid-h1 leading-[1.05] tracking-tightest text-slate-50">
              Projects
            </h1>
            <p className="text-[13.5px] text-slate-400 max-w-xl">
              Plan, sequence, and track every initiative in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-xl bg-surface-850/80 border border-white/[0.05]">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={cn(
                  'btn-sm rounded-lg gap-1.5',
                  view === 'grid' ? 'bg-white/[0.08] text-white' : 'text-slate-400'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setView('table')}
                className={cn(
                  'btn-sm rounded-lg gap-1.5',
                  view === 'table' ? 'bg-white/[0.08] text-white' : 'text-slate-400'
                )}
              >
                <Rows3 className="h-3.5 w-3.5" /> Table
              </button>
            </div>
          </div>
        </header>

        {/* Filter bar */}
        <section className="card p-3 sm:p-4 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={values.search}
            onChange={(e) => setValue('search', e.target.value)}
            placeholder="Search projects…"
            className="input input-sm flex-1 min-w-[220px]"
          />

          <FilterGroup label="Status">
            {PROJECT_STATUSES.map((s) => (
              <Chip
                key={s.value}
                active={values.status === s.value}
                onClick={() => setValue('status', values.status === s.value ? '' : s.value)}
              >
                {s.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Priority">
            {PRIORITIES.map((p) => (
              <Chip
                key={p.value}
                active={values.priority === p.value}
                onClick={() => setValue('priority', values.priority === p.value ? '' : p.value)}
              >
                {p.label}
              </Chip>
            ))}
          </FilterGroup>

          <div className="relative ml-auto">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <select
              value={values.sort}
              onChange={(e) => setValue('sort', e.target.value)}
              className="input input-sm pl-8 w-44"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {activeCount > 0 && (
            <button type="button" className="btn-ghost btn-sm" onClick={clear}>
              Clear ({activeCount})
            </button>
          )}
        </section>

        {/* Content */}
        {isLoading ? (
          <ProjectsLoading view={view} />
        ) : projects?.length ? (
          view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <ProjectTable projects={projects} onEdit={onEdit} onDelete={onDelete} />
          )
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start organising tasks and tracking progress."
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
                <Plus className="h-4 w-4" /> New project
              </button>
            }
          />
        )}
      </main>

      <ProjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title={`Delete "${deleting?.name}"?`}
        description="This will also delete every task in this project. This action cannot be undone."
      />
    </>
  );
}

const FilterGroup = ({ label, children }) => (
  <div className="flex items-center gap-1.5">
    <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 mr-1">
      <Filter className="h-3 w-3" /> {label}:
    </span>
    {children}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('chip', active && 'chip-active')}
  >
    {children}
  </button>
);

const ProjectsLoading = ({ view }) =>
  view === 'grid' ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-1.5 w-full mt-4" />
        </div>
      ))}
    </div>
  ) : (
    <div className="card p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 my-1 mx-2" />
      ))}
    </div>
  );

const ProjectTable = ({ projects, onEdit, onDelete }) => {
  const { canEditProject, canDeleteProject } = usePermissions();
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/[0.06]">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const pct = p.total_tasks > 0
                ? Math.round((p.completed_tasks / p.total_tasks) * 100)
                : 0;
              const mayEdit = canEditProject(p);
              const mayDelete = canDeleteProject(p);
              return (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium hover:text-brand-300"
                    >
                      {p.name}
                    </Link>
                    {p.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                        {p.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={p.status} kind="project" /></td>
                  <td className="px-4 py-3"><PriorityBadge value={p.priority} /></td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {p.completed_tasks}/{p.total_tasks}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.deadline ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(p.deadline)}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {mayEdit && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </button>
                    )}
                    {mayDelete && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm text-rose-300 hover:bg-rose-500/10"
                        onClick={() => onDelete(p)}
                      >
                        Delete
                      </button>
                    )}
                    {!mayEdit && !mayDelete && (
                      <span className="text-xs text-slate-600">View only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
