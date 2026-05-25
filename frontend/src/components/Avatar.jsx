import { cn } from '@/utils/cn';
import { avatarColor, initials } from '@/utils/format';

export default function Avatar({ name = '', email = '', src, size = 'md', className }) {
  const sizeCls = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-base',
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || email}
        className={cn('rounded-full object-cover ring-1 ring-white/10', sizeCls, className)}
      />
    );
  }
  return (
    <span
      title={name || email}
      style={{ backgroundColor: avatarColor(email || name) }}
      className={cn(
        'rounded-full font-semibold text-white grid place-items-center ring-1 ring-white/10 shrink-0',
        sizeCls,
        className
      )}
    >
      {initials(name || email)}
    </span>
  );
}
