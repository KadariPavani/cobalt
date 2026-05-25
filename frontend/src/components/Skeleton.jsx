import { cn } from '@/utils/cn';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-28" />
    <Skeleton className="h-2 w-32" />
  </div>
);

export const RowSkeleton = () => (
  <div className="card p-4 flex items-center gap-3">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);
