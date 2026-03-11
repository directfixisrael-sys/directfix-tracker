import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Award, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoyaltyPointsDisplayProps {
  customerPhone: string;
  mode: 'tracker' | 'order' | 'summary';
  repairPrice?: number;
  showTerms?: boolean;
}

const POINT_VALUE = 0.5;
const POINTS_PER_100 = 10;

export const calculatePointsFromPrice = (price: number): number => {
  return Math.floor(price / 100) * POINTS_PER_100;
};

export const calculateDiscountFromPoints = (points: number): number => {
  return points * POINT_VALUE;
};

export const getCustomerPoints = async (phone: string): Promise<number> => {
  const normalized = phone.replace(/\D/g, '');
  const { data } = await supabase
    .from('loyalty_points')
    .select('points, type')
    .eq('customer_phone', normalized);

  if (!data) return 0;
  return data.reduce((sum, p) => {
    if (p.type === 'earned') return sum + p.points;
    if (p.type === 'redeemed') return sum - p.points;
    return sum + p.points; // adjustment (can be negative)
  }, 0);
};

const LoyaltyPointsDisplay = ({ customerPhone, mode, repairPrice = 0, showTerms = false }: LoyaltyPointsDisplayProps) => {
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showLegalTerms, setShowLegalTerms] = useState(false);

  useEffect(() => {
    if (!customerPhone) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      const pts = await getCustomerPoints(customerPhone);
      setCurrentPoints(pts);
      setIsLoading(false);
    };
    load();
  }, [customerPhone]);

  if (isLoading) return null;

  const pointsToEarn = calculatePointsFromPrice(repairPrice);
  const discount = calculateDiscountFromPoints(currentPoints);
  const futureTotal = currentPoints + pointsToEarn;

  // Summary mode - shows in order summary how many points will be earned
  if (mode === 'summary') {
    if (pointsToEarn <= 0) return null;
    return (
      <div className="flex justify-between items-center text-sm bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-3 border border-primary/20">
        <span className="text-primary font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          נקודות שתצברו
        </span>
        <div className="text-left">
          <span className="font-bold text-primary text-lg">{pointsToEarn}</span>
          <span className="text-xs text-muted-foreground mr-1">= ₪{(pointsToEarn * POINT_VALUE).toFixed(0)}</span>
        </div>
      </div>
    );
  }

  // Order page mode - shows existing balance + potential discount
  if (mode === 'order') {
    if (currentPoints <= 0 && pointsToEarn <= 0) return null;
    return (
      <div className="space-y-2">
        {currentPoints > 0 && (
          <Card className="p-4 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">יש לך {currentPoints} נקודות!</p>
                <p className="text-sm text-muted-foreground">
                  שווי ₪{discount.toFixed(0)} — ייחשב אוטומטית בסיכום ההזמנה
                </p>
              </div>
            </div>
          </Card>
        )}
        {pointsToEarn > 0 && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 rounded-xl px-3 py-2">
            <Award className="w-4 h-4" />
            <span>הזמנה זו תזכה אותך ב-<strong>{pointsToEarn} נקודות</strong> חדשות!</span>
          </div>
        )}
      </div>
    );
  }

  // Tracker mode - detailed view after completion
  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 animate-slide-up">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">נקודות הנאמנות שלך</h3>
        <p className="text-sm text-muted-foreground">תוכנית DirectFix Points</p>
      </div>

      <div className="bg-card/80 rounded-2xl p-5 text-center border border-border/50 mb-4">
        <p className="text-4xl font-extrabold text-primary">{currentPoints}</p>
        <p className="text-muted-foreground text-sm">נקודות פעילות</p>
        <p className="text-lg font-bold text-success mt-1">= ₪{discount.toFixed(0)} הנחה</p>
      </div>

      {pointsToEarn > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center mb-4">
          <p className="text-sm font-semibold text-success">
            + {pointsToEarn} נקודות חדשות מהתיקון הזה!
          </p>
        </div>
      )}

      {/* How to use */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="w-full flex items-center justify-between bg-muted/50 rounded-xl p-3 text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          איך משתמשים בנקודות?
        </span>
        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showInfo && (
        <div className="mt-3 space-y-3 text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <p>כל 100 ש"ח בתיקון = <strong className="text-foreground">10 נקודות</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <p>כל נקודה שווה <strong className="text-foreground">{POINT_VALUE} ש"ח</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <p>בהזמנה הבאה — פשוט הזינו את <strong className="text-foreground">מספר הטלפון</strong> שלכם וההנחה תופיע אוטומטית</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">4</span>
            </div>
            <p>הנקודות מצטברות — ככל שמתקנים יותר, החיסכון גדל!</p>
          </div>
        </div>
      )}

      {/* Legal terms */}
      {showTerms && (
        <>
          <button
            onClick={() => setShowLegalTerms(!showLegalTerms)}
            className="w-full text-center text-[11px] text-muted-foreground/70 mt-3 underline"
          >
            תנאי תוכנית הנקודות
          </button>
          {showLegalTerms && (
            <div className="mt-2 text-[10px] text-muted-foreground/60 leading-relaxed bg-muted/20 rounded-lg p-3">
              <p className="font-bold mb-1">תנאי תוכנית הנאמנות DirectFix Points</p>
              <p>1. תוכנית הנקודות מופעלת ומנוהלת על ידי דיירקט פיקס ("החברה").</p>
              <p>2. שווי כל נקודה הינו {POINT_VALUE} ש"ח ועשוי להשתנות בהתאם לשיקול דעת החברה בלבד.</p>
              <p>3. החברה שומרת לעצמה את הזכות לשנות, להשעות או לבטל את תוכנית הנקודות בכל עת וללא הודעה מוקדמת, בכפוף לחוק הגנת הצרכן, התשמ"א-1981.</p>
              <p>4. נקודות שנצברו אינן ניתנות להמרה למזומן, להעברה או למכירה.</p>
              <p>5. החברה רשאית לאפס יתרת נקודות במקרה של שימוש לרעה, הונאה או הפרת תנאי השימוש.</p>
              <p>6. הנקודות תקפות לתקופה של 24 חודשים ממועד הצבירה האחרונה.</p>
              <p>7. מימוש הנקודות כפוף לזמינות השירות ולתנאי ההזמנה הרגילים של החברה.</p>
              <p>8. על תוכנית זו חלים דיני מדינת ישראל, וכל מחלוקת תתברר בבתי המשפט המוסמכים בישראל.</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default LoyaltyPointsDisplay;
