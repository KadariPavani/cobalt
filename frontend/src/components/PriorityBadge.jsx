import Badge from './Badge';
import { PRIORITIES } from '@/utils/constants';

export default function PriorityBadge({ value }) {
  const p = PRIORITIES.find((x) => x.value === value);
  if (!p) return null;
  return <Badge color={p.color}>{p.label} priority</Badge>;
}
