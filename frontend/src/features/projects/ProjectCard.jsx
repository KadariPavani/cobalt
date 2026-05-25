import { Link } from 'react-router-dom';
import { CalendarDays, Users, MoreVertical, Pencil, Trash2, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { formatDate, isOverdue } from '@/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { canEditProject, canDeleteProject } = usePermissions();
  const mayEdit   = canEditProject(project);
  const mayDelete = canDeleteProject(project);
  const completionPct =
    project.total_tasks > 0
      ? Math.round((project.completed_tasks / project.total_tasks) * 100)
      : 0;
  const overdueDeadline = isOverdue(project.deadline) && project.status === 'active';

  return (
    <article className="card card-hover p-5 group relative flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge value={project.status} kind="project" />
            <PriorityBadge value={project.priority} />
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="block text-[15.5px] font-semibold tracking-tight hover:text-brand-300 transition-colors line-clamp-1 leading-tight"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-[12.5px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
        {mayEdit || mayDelete ? (
          <ProjectMenu
            mayEdit={mayEdit}
            mayDelete={mayDelete}
            onEdit={() => onEdit(project)}
            onDelete={() => onDelete(project)}
          />
        ) : (
          <span
            title="View only — only the project creator or an admin can change this"
            className="text-slate-600 mt-1"
          >
            <Lock className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-300 font-medium">
              {project.completed_tasks}/{project.total_tasks} tasks
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {project.member_count} {project.member_count === 1 ? 'member' : 'members'}
          </span>
          {project.deadline ? (
            <span
              className={`inline-flex items-center gap-1.5 ${
                overdueDeadline ? 'text-rose-400 font-medium' : 'text-slate-400'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(project.deadline)}
            </span>
          ) : (
            <span className="text-slate-600">No deadline</span>
          )}
        </div>
      </div>
    </article>
  );
}

const ProjectMenu = ({ mayEdit, mayDelete, onEdit, onDelete }) => {
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
        className="btn-icon h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        onClick={() => setOpen((v) => !v)}
        aria-label="Project actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 w-40 card p-1 animate-fade-in">
          {mayEdit && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/[0.06] flex items-center gap-2"
              onClick={() => { setOpen(false); onEdit(); }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {mayDelete && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-rose-500/10 text-rose-300 flex items-center gap-2"
              onClick={() => { setOpen(false); onDelete(); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
