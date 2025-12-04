import { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => void;
  children: ReactNode;
}

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull-to-refresh when at top of scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      // Apply resistance to pull
      setPullDistance(Math.min(diff * 0.4, 120));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      
      // Trigger refresh
      onRefresh();
      
      // Wait a bit before resetting
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: pullDistance }}
      >
        <div className={cn(
          "flex items-center gap-2 text-primary",
          isRefreshing && "animate-pulse"
        )}>
          <RefreshCw className={cn(
            "w-5 h-5 transition-transform",
            isRefreshing && "animate-spin",
            pullDistance >= threshold && !isRefreshing && "rotate-180"
          )} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'מרענן...' : pullDistance >= threshold ? 'שחרר לרענון' : 'משוך לרענון'}
          </span>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default PullToRefresh;
