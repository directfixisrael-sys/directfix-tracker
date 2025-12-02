import { Bike, MapPin, Clock } from 'lucide-react';

interface TechnicianTrackerProps {
  technicianName: string;
  estimatedArrival?: string;
  customerAddress: string;
}

const TechnicianTracker = ({ technicianName, estimatedArrival, customerAddress }: TechnicianTrackerProps) => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">הטכנאי בדרך!</h3>
        {estimatedArrival && (
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-sm">הגעה ב-{estimatedArrival}</span>
          </div>
        )}
      </div>

      {/* Map visualization */}
      <div className="relative bg-gradient-to-bl from-primary/5 via-background to-accent/5 rounded-xl h-40 mb-4 overflow-hidden">
        {/* Road */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-muted/50">
          <div className="absolute inset-0 flex items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-1 h-0.5 mx-1 bg-border/50" />
            ))}
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-success-foreground" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs text-muted-foreground">יעד</span>
            </div>
          </div>
        </div>

        {/* Motorcycle animation */}
        <div className="absolute right-1/3 top-1/2 -translate-y-1/2 animate-drive">
          <div className="relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-glow">
              <Bike className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="absolute -top-8 right-1/2 translate-x-1/2 bg-card px-2 py-1 rounded-lg shadow-md whitespace-nowrap">
              <span className="text-xs font-medium text-foreground">{technicianName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm text-muted-foreground">כתובת היעד</p>
          <p className="font-medium text-foreground">{customerAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianTracker;
