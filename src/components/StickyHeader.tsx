import { Bike } from 'lucide-react';

interface StickyHeaderProps {
  technicianName: string;
  estimatedArrival?: string;
  isVisible: boolean;
}

const StickyHeader = ({ technicianName, estimatedArrival, isVisible }: StickyHeaderProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-lg">
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Bike className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{technicianName} בדרך אליך</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-primary">בדרך</span>
                </div>
              </div>
            </div>
            {estimatedArrival && (
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full">
                <span className="font-bold">{estimatedArrival}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;
