import { CalendarDays, MoreHorizontal, Pencil, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import PriorityBadge from '@/components/PriorityBadge';
import Avatar from '@/components/Avatar';
import { formatDate, isOverdue } from '@/utils/format';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/utils/cn';

export default function TaskCard({ task, onEdit, onDelete, onToggle, dragHandleProps }) {
  const { canEditTask, canDeleteTask, taskLockReason } = usePermissions();
  const mayEdit = canEditTask(task);
  const mayDelete = canDeleteTask(task);
  const lockReason = taskLockReason(task);
  const overdue = isOverdue(task.due_date) && task.status !== 'completed';
  const done = task.status === 'completed';
  return (
    <article
      className={cn(
        'card card-hover p-3.5 space-y-2.5 select-none',
        mayEdit
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-default opacity-90',
        done && 'opacity-75'
      )}
      {...(mayEdit ? dragHandleProps : {})}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          disabled={!mayEdit}
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors grid place-items-center',
            done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-brand-400',
            !mayEdit && 'opacity-40 cursor-not-allowed hover:border-slate-500'
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (mayEdit) onToggle?.(task);
          }}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {done && <CheckCircle2 className="h-3 w-3 text-surface-950" strokeWidth={3} />}
        </button>
        <p
          className={cn(
            'text-sm font-medium leading-snug flex-1 line-clamp-2',
            done && 'line-through text-slate-500'
          )}
        >
          {task.title}
        </p>
        {mayEdit || mayDelete ? (
          <TaskMenu
            mayEdit={mayEdit}
            mayDelete={mayDelete}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ) : (
          <span
            title={lockReason || 'View only'}
            aria-label={lockReason || 'View only'}
            className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-inset ring-white/10"
          >
            <Lock className="h-2.5 w-2.5" /> Read-only
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pl-6 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <PriorityBadge value={task.priority} />
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px]',
                overdue ? 'text-rose-400 font-medium' : 'text-slate-500'
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.due_date, 'MMM d')}
            </span>
          )}
        </div>
        {task.assignee_name ? (
          <Avatar
            name={task.assignee_name}
            email={task.assignee_email}
            src={task.assignee_avatar}
            size="sm"
          />
        ) : (
          <span className="text-[11px] text-slate-600">Unassigned</span>
        )}
      </div>
    </article>
  );
}

const TaskMenu = ({ mayEdit, mayDelete, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn-icon h-7 w-7"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Task actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 w-36 card p-1 animate-fade-in">
          {mayEdit && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-white/[0.06] flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {mayDelete && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-rose-500/10 text-rose-300 flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
