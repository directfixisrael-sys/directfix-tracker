import { RepairStatus, statusLabels } from '@/types/repair';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: RepairStatus;
  estimatedArrival?: string;
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

const StatusTimeline = ({ currentStatus, estimatedArrival }: StatusTimelineProps) => {
  const displayStatus = getDisplayStatus(currentStatus);
  const currentIndex = statusOrder.indexOf(displayStatus);

  return (
    <div className="wolt-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-lg font-bold text-foreground mb-6">סטטוס התיקון</h3>
      
      <div className="space-y-1">
        {statusOrder.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div 
              key={status}
              className={cn(
                "relative flex items-center gap-4 py-3 transition-all duration-300",
                isPending && "opacity-40"
              )}
            >
              {/* Connector line */}
              {index < statusOrder.length - 1 && (
                <div 
                  className={cn(
                    "absolute right-[18px] top-[42px] w-0.5 h-6 transition-colors duration-500",
                    index < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Status circle */}
              <div 
                className={cn(
                  "relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  isCompleted && "bg-primary",
                  isCurrent && "bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]",
                  isPending && "bg-muted border-2 border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse-slow" />
                ) : (
                  <div className="w-2 h-2 bg-border rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm transition-colors",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {statusLabels[status]}
                </p>
                
                {status === 'on_the_way' && isCurrent && estimatedArrival && (
                  <p className="text-xs text-primary font-medium mt-0.5 animate-fade-in">
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
