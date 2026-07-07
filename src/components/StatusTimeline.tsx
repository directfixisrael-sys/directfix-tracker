import { RepairStatus, statusLabels } from '@/types/repair';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: RepairStatus;
  estimatedArrival?: string;
  updatedAt?: Date;
}

// Simplified status order - removed technician_assigned, arrived, in_progress
const statusOrder: RepairStatus[] = [
  'pending',
  'confirmed',
  'on_the_way',
  'completed',
];

// Map original statuses to display statuses
const getDisplayStatus = (status: RepairStatus): RepairStatus => {
  if (status === 'technician_assigned') return 'confirmed';
  if (status === 'arrived' || status === 'in_progress') return 'on_the_way';
  return status;
};

const StatusTimeline = ({ currentStatus, estimatedArrival, updatedAt }: StatusTimelineProps) => {
  const displayStatus = getDisplayStatus(currentStatus);
  const currentIndex = statusOrder.indexOf(displayStatus);

  // Generate mock timestamps based on updatedAt for demo purposes
  const getStatusTime = (index: number) => {
    if (!updatedAt || index > currentIndex) return null;
    const time = new Date(updatedAt);
    // Subtract time for earlier statuses (roughly 30 min per status)
    time.setMinutes(time.getMinutes() - (currentIndex - index) * 30);
    return time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="wolt-card p-6 animate-slide-up-soft" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-xl font-extrabold text-foreground mb-6 tracking-tight">סטטוס התיקון</h3>
      
      <div className="space-y-1">
        {statusOrder.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const statusTime = getStatusTime(index);

          return (
            <div 
              key={status}
              className={cn(
                "relative flex items-center gap-4 py-3.5 transition-all duration-300",
                isPending && "opacity-40"
              )}
            >
              {/* Connector line */}
              {index < statusOrder.length - 1 && (
                <div 
                  className={cn(
                    "absolute right-[22px] top-[52px] w-0.5 h-7 transition-colors duration-500",
                    index < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Status circle */}
              <div 
                className={cn(
                  "relative z-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  isCurrent ? "w-11 h-11" : "w-10 h-10",
                  isCompleted && "bg-primary",
                  isCurrent && "bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.18)] animate-soft-pulse",
                  isPending && "bg-muted border-2 border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                ) : isCurrent ? (
                  <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-border rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "font-semibold transition-colors",
                    isCurrent ? "text-primary text-base" : isCompleted ? "text-foreground text-sm" : "text-muted-foreground text-sm"
                  )}>
                    {statusLabels[status]}
                  </p>
                  {statusTime && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {statusTime}
                    </span>
                  )}
                </div>
                
                {status === 'on_the_way' && isCurrent && estimatedArrival && (
                  <p className="text-xs text-primary font-semibold mt-1 animate-fade-in">
                    הגעה משוערת: {estimatedArrival}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
