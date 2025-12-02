import { Bike, MapPin, Navigation } from 'lucide-react';

interface TechnicianTrackerProps {
  technicianName: string;
  estimatedArrival?: string;
  customerAddress: string;
}

const TechnicianTracker = ({ technicianName, estimatedArrival, customerAddress }: TechnicianTrackerProps) => {
  return (
    <div className="wolt-card-elevated overflow-hidden animate-slide-up">
      {/* Map visualization */}
      <div className="relative h-48 bg-gradient-to-bl from-primary/5 via-background to-primary/10 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)/0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Road */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2">
          {/* Road background */}
          <div className="h-4 bg-foreground/10 rounded-full relative overflow-hidden">
            {/* Animated dashes */}
            <div className="absolute inset-y-0 inset-x-0 flex items-center overflow-hidden">
              <div className="flex items-center gap-3 animate-road">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 h-0.5 bg-background/50 rounded-full flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-wolt-lg">
              <MapPin className="w-6 h-6 text-success-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-success rotate-45 -z-10" />
          </div>
        </div>

        {/* Motorcycle with technician */}
        <div className="absolute right-1/3 top-1/2 -translate-y-1/2 z-20 animate-drive">
          <div className="relative">
            {/* Name bubble */}
            <div className="absolute -top-10 right-1/2 translate-x-1/2 bg-card px-3 py-1.5 rounded-full shadow-wolt whitespace-nowrap">
              <span className="text-xs font-semibold text-foreground">{technicianName} 🏍️</span>
            </div>
            {/* Bike icon */}
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-wolt-lg">
              <Bike className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary">בדרך אליך</span>
          </div>
          {estimatedArrival && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
              <span className="font-bold text-lg">{estimatedArrival}</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
          <Navigation className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">כתובת למשלוח</p>
            <p className="font-medium text-foreground text-sm">{customerAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianTracker;
