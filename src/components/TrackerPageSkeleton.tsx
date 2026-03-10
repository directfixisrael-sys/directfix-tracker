import { Skeleton } from '@/components/ui/skeleton';

const TrackerPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header skeleton */}
      <header className="bg-card/95 backdrop-blur-md border-b-2 border-foreground/10 sticky top-0 z-50">
        <nav className="container flex items-center justify-between h-14 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </nav>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Search bar skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-52 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-40 mx-auto rounded" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>

        {/* Order card skeleton */}
        <div className="strategly-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          {/* Timeline skeleton */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackerPageSkeleton;
