import { RepairStatus, statusLabels } from '@/types/repair';
import { Check, Clock, MapPin, Wrench, UserCheck, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: RepairStatus;
  estimatedArrival?: string;
}

const statusOrder: RepairStatus[] = [
  'pending',
  'confirmed',
  'technician_assigned',
  'on_the_way',
  'arrived',
  'in_progress',
  'completed',
];

const statusIcons: Record<RepairStatus, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <Check className="w-5 h-5" />,
  technician_assigned: <UserCheck className="w-5 h-5" />,
  on_the_way: <Truck className="w-5 h-5" />,
  arrived: <MapPin className="w-5 h-5" />,
  in_progress: <Wrench className="w-5 h-5" />,
  completed: <CheckCircle2 className="w-5 h-5" />,
};

const StatusTimeline = ({ currentStatus, estimatedArrival }: StatusTimelineProps) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-6">סטטוס התיקון</h3>
      
      <div className="relative">
        {/* Progress line */}
        <div className="absolute right-[22px] top-0 bottom-0 w-0.5 bg-border" />
        <div 
          className="absolute right-[22px] top-0 w-0.5 bg-primary transition-all duration-500"
          style={{ height: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
        />

        <div className="space-y-6">
          {statusOrder.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div 
                key={status}
                className={cn(
                  "relative flex items-center gap-4 transition-all duration-300",
                  isPending && "opacity-40"
                )}
              >
                {/* Icon circle */}
                <div 
                  className={cn(
                    "relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-success text-success-foreground",
                    isCurrent && "bg-primary text-primary-foreground shadow-glow",
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
                  )}
                  {statusIcons[status]}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={cn(
                    "font-medium transition-colors",
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {statusLabels[status]}
                  </p>
                  
                  {status === 'on_the_way' && isCurrent && estimatedArrival && (
                    <p className="text-sm text-accent font-medium mt-0.5 animate-fade-in">
                      זמן הגעה משוער: {estimatedArrival}
                    </p>
                  )}
                </div>

                {/* Status indicator */}
                {isCompleted && (
                  <div className="text-success">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
