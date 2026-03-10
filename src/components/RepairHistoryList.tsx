import { RepairOrder } from '@/types/repair';
import { statusLabels, statusIcons } from '@/types/repair';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, History } from 'lucide-react';

interface RepairHistoryListProps {
  orders: RepairOrder[];
  onSelectOrder: (order: RepairOrder) => void;
}

const RepairHistoryList = ({ orders, onSelectOrder }: RepairHistoryListProps) => {
  return (
    <div className="w-full max-w-sm mx-auto animate-slide-up space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <History className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">ההזמנות שלך</h2>
        <p className="text-sm text-muted-foreground">נמצאו {orders.length} הזמנות</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isActive = !['completed', 'cancelled'].includes(order.status);
          return (
            <button
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className={`w-full wolt-card p-4 text-right transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isActive ? 'border-2 border-primary/30 shadow-md' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{statusIcons[order.status]}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : order.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {statusLabels[order.status]}
                    </span>
                    {order.orderNumber && (
                      <span className="text-xs text-muted-foreground mr-auto">#{order.orderNumber}</span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-sm truncate">{order.deviceType}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.issueDescription}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(order.createdAt, 'dd/MM/yyyy', { locale: he })}
                    {' • '}
                    ₪{order.repairPrice}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RepairHistoryList;
