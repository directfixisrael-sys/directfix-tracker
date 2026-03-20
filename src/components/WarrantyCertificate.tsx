import { Shield, Calendar, Smartphone, Wrench, CheckCircle2 } from 'lucide-react';
import { RepairOrder } from '@/types/repair';
import { format, addMonths, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

interface WarrantyCertificateProps {
  order: RepairOrder;
}

const getWarrantyDuration = (issueDescription: string): { months: number; days?: number; label: string } => {
  const lower = issueDescription.toLowerCase();
  
  if (lower.includes('סוללה') || lower.includes('battery')) {
    return { months: 12, label: '12 חודשים' };
  }
  if (lower.includes('מסך') || lower.includes('screen')) {
    return { months: 0, days: 90, label: '90 ימים' };
  }
  if (lower.includes('טעינה') || lower.includes('שקע') || lower.includes('charging')) {
    return { months: 6, label: '6 חודשים' };
  }
  // Default warranty
  return { months: 3, label: '3 חודשים' };
};

const WarrantyCertificate = ({ order }: WarrantyCertificateProps) => {
  if (order.status !== 'completed' || !order.completedAt) return null;

  // Use override warranty_months if set, otherwise fall back to auto-detection
  const autoWarranty = getWarrantyDuration(order.issueDescription);
  const warranty = order.warrantyMonths
    ? { months: order.warrantyMonths, label: `${order.warrantyMonths} חודשים` }
    : autoWarranty;
  const completedDate = new Date(order.completedAt);
  const expiryDate = (!order.warrantyMonths && autoWarranty.days)
    ? addDays(completedDate, autoWarranty.days)
    : addMonths(completedDate, warranty.months);
  
  const isExpired = new Date() > expiryDate;
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/5 via-background to-success/10 p-6 animate-slide-up">
      {/* Decorative badge */}
      <div className="absolute top-0 left-0 bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-br-xl">
        <Shield className="w-3 h-3 inline ml-1" />
        אחריות
      </div>

      <div className="text-center mt-4 mb-5">
        <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground">תעודת אחריות</h3>
        <p className="text-sm text-muted-foreground">DirectFix - דיירקט פיקס</p>
      </div>

      <div className="space-y-3 bg-card/50 rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-3">
          <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">מכשיר:</span>
          <span className="text-sm font-semibold text-foreground mr-auto">{order.deviceType}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">תיקון:</span>
          <span className="text-sm font-semibold text-foreground mr-auto">{order.issueDescription}</span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">תאריך תיקון:</span>
          <span className="text-sm font-semibold text-foreground mr-auto">
            {format(completedDate, 'dd/MM/yyyy', { locale: he })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">תקופת אחריות:</span>
          <span className="text-sm font-bold text-success mr-auto">{warranty.label}</span>
        </div>

        <div className="border-t border-border/50 pt-3 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">תוקף עד:</span>
          <span className={`text-sm font-bold mr-auto ${isExpired ? 'text-destructive' : 'text-success'}`}>
            {format(expiryDate, 'dd/MM/yyyy', { locale: he })}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className={`mt-4 rounded-xl p-3 text-center ${
        isExpired 
          ? 'bg-destructive/10 border border-destructive/20' 
          : 'bg-success/10 border border-success/20'
      }`}>
        {isExpired ? (
          <p className="text-sm font-semibold text-destructive">האחריות פגה</p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-sm font-semibold text-success">
              אחריות בתוקף — נותרו {daysLeft} ימים
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-3">
        הזמנה #{order.orderNumber} • {order.customerName}
      </p>
    </div>
  );
};

export default WarrantyCertificate;
