import Badge from './Badge';
import { TASK_STATUSES, PROJECT_STATUSES } from '@/utils/constants';

export default function StatusBadge({ value, kind = 'task' }) {
  const list = kind === 'project' ? PROJECT_STATUSES : TASK_STATUSES;
  const item = list.find((x) => x.value === value);
  if (!item) return null;
  return <Badge color={item.color}>{item.label}</Badge>;
}
