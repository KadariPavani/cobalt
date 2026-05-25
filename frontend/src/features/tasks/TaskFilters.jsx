import { Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { TASK_STATUSES, PRIORITIES } from '@/utils/constants';
import { cn } from '@/utils/cn';

export default function TaskFilters({ values, setValue, clear, activeCount }) {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  return (
    <section className="card p-3 sm:p-4 flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={values.search || ''}
        onChange={(e) => setValue('search', e.target.value)}
        placeholder="Search tasks…"
        className="input input-sm flex-1 min-w-[220px]"
      />

      <Group label="Status">
        {TASK_STATUSES.map((s) => (
          <Chip
            key={s.value}
            active={values.status === s.value}
            onClick={() => setValue('status', values.status === s.value ? '' : s.value)}
          >
            {s.label}
          </Chip>
        ))}
      </Group>

      <Group label="Priority">
        {PRIORITIES.map((p) => (
          <Chip
            key={p.value}
            active={values.priority === p.value}
            onClick={() => setValue('priority', values.priority === p.value ? '' : p.value)}
          >
            {p.label}
          </Chip>
        ))}
      </Group>

      <select
        value={values.assigned_to || ''}
        onChange={(e) => setValue('assigned_to', e.target.value)}
        className="input input-sm w-40"
      >
        <option value="">Any assignee</option>
        <option value="unassigned">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      {activeCount > 0 && (
        <button type="button" className="btn-ghost btn-sm ml-auto" onClick={clear}>
          Clear ({activeCount})
        </button>
      )}
    </section>
  );
}

const Group = ({ label, children }) => (
  <div className="flex items-center gap-1.5">
    <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 mr-1">
      <Filter className="h-3 w-3" /> {label}:
    </span>
    {children}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={cn('chip', active && 'chip-active')}>
    {children}
  </button>
);
