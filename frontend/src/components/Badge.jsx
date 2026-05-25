import { cn } from '@/utils/cn';

const PALETTE = {
  slate:   'bg-slate-500/10   text-slate-300  ring-slate-500/20',
  amber:   'bg-amber-500/10   text-amber-300  ring-amber-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  rose:    'bg-rose-500/10    text-rose-300   ring-rose-500/30',
  sky:     'bg-sky-500/10     text-sky-300    ring-sky-500/30',
  brand:   'bg-brand-500/10   text-brand-200  ring-brand-500/30',
};

export default function Badge({ color = 'slate', className, children, dot = true, ...rest }) {
  return (
    <span className={cn('badge', PALETTE[color] || PALETTE.slate, className)} {...rest}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            color === 'amber' && 'bg-amber-400',
            color === 'emerald' && 'bg-emerald-400',
            color === 'rose' && 'bg-rose-400',
            color === 'sky' && 'bg-sky-400',
            color === 'brand' && 'bg-brand-400',
            (!color || color === 'slate') && 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
