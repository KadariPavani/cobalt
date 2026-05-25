import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, ListTodo, Search as SearchIcon } from 'lucide-react';

import Topbar from '@/components/Topbar';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import Avatar from '@/components/Avatar';

import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/format';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const debounced = useDebounce(q, 300);

  const enabled = Boolean(debounced.trim());

  const projects = useQuery({
    queryKey: ['search', 'projects', debounced],
    queryFn: () => projectsApi.list({ search: debounced }),
    enabled,
  });

  const tasks = useQuery({
    queryKey: ['search', 'tasks', debounced],
    queryFn: () => tasksApi.list({ search: debounced }),
    enabled,
  });

  const loading = projects.isLoading || tasks.isLoading;
  const empty =
    enabled &&
    !loading &&
    (projects.data?.length ?? 0) === 0 &&
    (tasks.data?.length ?? 0) === 0;

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Search' }]} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 max-w-[1480px] w-full mx-auto">
        <header className="space-y-3">
          <p className="label">Global search</p>
          <h1 className="font-display text-fluid-h1 leading-[1.05] tracking-tightest text-slate-50">
            Find anything
          </h1>
          <div className="relative max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              autoFocus
              value={q}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set('q', e.target.value);
                else next.delete('q');
                setParams(next, { replace: true });
              }}
              placeholder="Search projects and tasks…"
              className="input pl-9"
            />
          </div>
        </header>

        {!enabled ? (
          <EmptyState
            icon={SearchIcon}
            title="Start typing to search"
            description="Search runs across project names, descriptions, and task titles."
          />
        ) : empty ? (
          <EmptyState
            icon={SearchIcon}
            title={`No results for "${debounced}"`}
            description="Try a different keyword or check your filters."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FolderKanban className="h-4 w-4 text-brand-400" />
                <h2 className="text-base font-semibold">
                  Projects
                  <span className="text-slate-500 font-normal ml-2 text-sm">
                    {projects.data?.length || 0}
                  </span>
                </h2>
              </div>
              {projects.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : projects.data?.length ? (
                <ul className="divide-y divide-white/[0.04]">
                  {projects.data.map((p) => (
                    <li key={p.id} className="py-3">
                      <Link
                        to={`/projects/${p.id}`}
                        className="flex items-start justify-between gap-3 hover:bg-white/[0.02] rounded-lg p-2 -m-2"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm hover:text-brand-300 truncate">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {p.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge value={p.status} kind="project" />
                          <PriorityBadge value={p.priority} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No matching projects.</p>
              )}
            </section>

            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ListTodo className="h-4 w-4 text-brand-400" />
                <h2 className="text-base font-semibold">
                  Tasks
                  <span className="text-slate-500 font-normal ml-2 text-sm">
                    {tasks.data?.length || 0}
                  </span>
                </h2>
              </div>
              {tasks.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : tasks.data?.length ? (
                <ul className="divide-y divide-white/[0.04]">
                  {tasks.data.map((t) => (
                    <li key={t.id} className="py-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/projects/${t.project_id}`}
                          className="font-medium text-sm hover:text-brand-300 truncate block"
                        >
                          {t.title}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">
                          in {t.project_name}
                          {t.due_date && ` · due ${formatDate(t.due_date)}`}
                        </p>
                      </div>
                      <StatusBadge value={t.status} />
                      {t.assignee_name && (
                        <Avatar
                          name={t.assignee_name}
                          email={t.assignee_email}
                          src={t.assignee_avatar}
                          size="sm"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No matching tasks.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
