import { format, formatDistanceToNowStrict, isPast, isToday, parseISO } from 'date-fns';

export const formatDate = (input, pattern = 'MMM d, yyyy') => {
  if (!input) return '';
  const d = typeof input === 'string' ? parseISO(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  return format(d, pattern);
};

export const fromNow = (input) => {
  if (!input) return '';
  const d = typeof input === 'string' ? parseISO(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  return formatDistanceToNowStrict(d, { addSuffix: true });
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (Number.isNaN(d.getTime())) return false;
  return isPast(d) && !isToday(d);
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '?';

export const avatarColor = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 45%)`;
};
