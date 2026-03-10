import { Skeleton } from '@/components/ui/skeleton';

const OrderPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header skeleton */}
      <header className="bg-card/95 backdrop-blur-md border-b-2 border-foreground/10 sticky top-0 z-50">
        <nav className="container flex items-center justify-between h-14 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </nav>
      </header>

      {/* Progress bar skeleton */}
      <div className="bg-card border-b-2 border-foreground/10 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-64 mx-auto rounded" />
        </div>

        {/* Model picker grid skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="strategly-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repair types skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="strategly-card p-4 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderPageSkeleton;
