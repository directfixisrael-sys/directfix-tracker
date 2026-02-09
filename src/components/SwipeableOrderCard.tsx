import { useState, useRef } from 'react';
import { RepairOrder, RepairStatus, statusLabels } from '@/types/repair';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableOrderCardProps {
  order: RepairOrder;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  getStatusColor: (status: RepairStatus) => string;
}

const SwipeableOrderCard = ({ order, isSelected, onClick, onDelete, getStatusColor }: SwipeableOrderCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const deleteThreshold = -80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    // Only allow swiping left (negative values)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    } else {
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < deleteThreshold) {
      // Show delete button
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete button behind */}
      <div 
        className="absolute inset-y-0 left-0 w-20 bg-destructive flex items-center justify-center"
        style={{ opacity: Math.min(Math.abs(translateX) / 80, 1) }}
      >
        <button 
          onClick={handleDelete}
          className="w-full h-full flex items-center justify-center"
        >
          <Trash2 className="w-6 h-6 text-destructive-foreground" />
        </button>
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (translateX === 0) {
            onClick();
          } else {
            setTranslateX(0);
          }
        }}
        style={{ 
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        className={cn(
          "w-full p-4 border-b border-border text-right transition-colors bg-background",
          isSelected 
            ? "bg-primary/5 border-r-2 border-r-primary" 
            : "hover:bg-muted/50"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <span className={cn("status-badge text-sm", getStatusColor(order.status))}>
            {statusLabels[order.status]}
          </span>
          <span className="font-medium text-foreground text-base">{order.customerName}</span>
        </div>
        <p className="text-muted-foreground mb-1">{order.deviceType}</p>
        <p className="text-xs text-muted-foreground/70 mb-1">
          {order.createdAt.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          {order.leadSource && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {order.leadSource}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeableOrderCard;
