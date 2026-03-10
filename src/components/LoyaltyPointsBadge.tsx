import { useState, useEffect } from 'react';
import { Star, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface LoyaltyPointsBadgeProps {
  customerPhone: string;
  variant?: 'tracker' | 'order';
  onRedeem?: (discount: number) => void;
  redeemed?: boolean;
}

const POINTS_PER_REPAIR = 50;
const POINTS_TO_SHEKEL_RATIO = 10; // 100 points = ₪10

const LoyaltyPointsBadge = ({ customerPhone, variant = 'tracker', onRedeem, redeemed }: LoyaltyPointsBadgeProps) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<{ points: number; type: string; description: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!customerPhone) return;
    fetchPoints();
  }, [customerPhone]);

  const fetchPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const total = data.reduce((sum, row) => sum + row.points, 0);
      setTotalPoints(total);
      setHistory(data);
    }
    setLoading(false);
  };

  const availableDiscount = Math.floor(totalPoints / (POINTS_TO_SHEKEL_RATIO * 10)) * POINTS_TO_SHEKEL_RATIO;
  const pointsForNextDiscount = ((Math.floor(totalPoints / 100) + 1) * 100) - totalPoints;

  if (loading) return null;
  if (totalPoints === 0 && variant === 'order') return null;

  return (
    <div className="strategly-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-sm">תוכנית נאמנות</h3>
          <p className="text-xs text-muted-foreground">
            {totalPoints > 0 ? `יש לך ${totalPoints} נקודות` : 'צבור נקודות על כל תיקון'}
          </p>
        </div>
        {totalPoints > 0 && (
          <div className="text-left">
            <span className="text-xl font-extrabold text-amber-500">{totalPoints}</span>
            <p className="text-[10px] text-muted-foreground">נקודות</p>
          </div>
        )}
      </div>

      {/* Points progress bar */}
      {totalPoints > 0 && (
        <div className="px-4 pb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>{totalPoints % 100} / 100 לקראת ₪{POINTS_TO_SHEKEL_RATIO} הנחה</span>
            <span>עוד {pointsForNextDiscount} נקודות</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(totalPoints % 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Redeem section - only in order variant */}
      {variant === 'order' && availableDiscount > 0 && !redeemed && onRedeem && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">ניתן לממש ₪{availableDiscount} הנחה</p>
              <p className="text-[10px] text-muted-foreground">ינוכו {availableDiscount * POINTS_TO_SHEKEL_RATIO} נקודות</p>
            </div>
            <Button 
              size="sm" 
              className="h-8 gap-1.5 bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-xl text-xs"
              onClick={() => onRedeem(availableDiscount)}
            >
              <Gift className="w-3.5 h-3.5" />
              ממש נקודות
            </Button>
          </div>
        </div>
      )}

      {/* Redeemed confirmation */}
      {variant === 'order' && redeemed && (
        <div className="border-t border-border px-4 py-3 bg-success/5">
          <div className="flex items-center gap-2 text-success text-xs font-medium">
            <Gift className="w-3.5 h-3.5" />
            <span>הנחת נאמנות של ₪{availableDiscount} הופעלה! 🎉</span>
          </div>
        </div>
      )}

      {/* How it works / History toggle */}
      {totalPoints > 0 && variant === 'tracker' && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full border-t border-border px-4 py-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? 'הסתר היסטוריה' : 'הצג היסטוריה'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <div className="border-t border-border px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.description}</span>
                  <span className={`font-bold ${item.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                    {item.type === 'earned' ? '+' : ''}{item.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info for new customers */}
      {totalPoints === 0 && variant === 'tracker' && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Gift className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
            <p>על כל תיקון שמושלם תקבלו <strong className="text-foreground">{POINTS_PER_REPAIR} נקודות</strong>. כל 100 נקודות = ₪{POINTS_TO_SHEKEL_RATIO} הנחה בתיקון הבא!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPointsBadge;
