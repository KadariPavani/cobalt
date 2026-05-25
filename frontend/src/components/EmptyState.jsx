import { cn } from '@/utils/cn';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'card p-10 text-center flex flex-col items-center gap-3 animate-fade-in',
        className
      )}
    >
      {Icon && (
        <div className="h-11 w-11 rounded-lg bg-brand-500/10 grid place-items-center ring-1 ring-brand-500/25">
          <Icon className="h-5 w-5 text-brand-300" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
