export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted-bg ${className}`}
      aria-hidden
    />
  );
}

export function BulletSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full max-w-[90%]" />
      <Skeleton className="h-5 w-full max-w-[95%]" />
    </div>
  );
}

export function ThreeBulletsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <BulletSkeleton />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <BulletSkeleton />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <BulletSkeleton />
      </div>
    </div>
  );
}
