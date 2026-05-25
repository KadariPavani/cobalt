import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Circle, Lock } from 'lucide-react';

import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import Avatar from '@/components/Avatar';
import { formatDate, isOverdue } from '@/utils/format';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/utils/cn';

export default function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggle,
  showProject = false,
}) {
  const { canEditTask, canDeleteTask, taskLockReason } = usePermissions();
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/[0.06]">
              <th className="px-4 py-3 font-medium w-10"></th>
              <th className="px-4 py-3 font-medium">Task</th>
              {showProject && <th className="px-4 py-3 font-medium">Project</th>}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const done = t.status === 'completed';
              const overdue = isOverdue(t.due_date) && !done;
              const mayEdit = canEditTask(t);
              const mayDelete = canDeleteTask(t);
              const lockReason = taskLockReason(t);
              return (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={!mayEdit}
                      onClick={() => mayEdit && onToggle?.(t)}
                      className={cn(
                        'transition-colors',
                        mayEdit
                          ? 'text-slate-400 hover:text-emerald-400'
                          : 'text-slate-700 cursor-not-allowed'
                      )}
                      title={mayEdit ? (done ? 'Mark incomplete' : 'Mark complete') : lockReason || undefined}
                      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className={cn(
                        'text-left font-medium transition-colors',
                        mayEdit ? 'hover:text-brand-300' : 'cursor-default text-slate-200',
                        done && 'line-through text-slate-500'
                      )}
                      onClick={() => onEdit(t)}
                      title={mayEdit ? 'Edit task' : lockReason || 'View details'}
                    >
                      {t.title}
                    </button>
                    {t.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                        {t.description}
                      </p>
                    )}
                  </td>
                  {showProject && (
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${t.project_id}`}
                        className="text-sm text-slate-300 hover:text-brand-300"
                      >
                        {t.project_name}
                      </Link>
                    </td>
                  )}
                  <td className="px-4 py-3"><StatusBadge value={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge value={t.priority} /></td>
                  <td className="px-4 py-3">
                    {t.due_date ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs',
                          overdue ? 'text-rose-400 font-medium' : 'text-slate-400'
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(t.due_date)}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.assignee_name ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={t.assignee_name}
                          email={t.assignee_email}
                          src={t.assignee_avatar}
                          size="sm"
                        />
                        <span className="text-xs text-slate-400">{t.assignee_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {mayEdit && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => onEdit(t)}
                      >
                        Edit
                      </button>
                    )}
                    {mayDelete && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm text-rose-300 hover:bg-rose-500/10"
                        onClick={() => onDelete(t)}
                      >
                        Delete
                      </button>
                    )}
                    {!mayEdit && !mayDelete && (
                      <span
                        title={lockReason || undefined}
                        className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-medium text-slate-400 ring-1 ring-inset ring-white/10"
                      >
                        <Lock className="h-2.5 w-2.5" /> Read-only
                      </span>
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
}
