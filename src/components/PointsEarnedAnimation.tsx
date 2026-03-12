import { useState, useEffect } from 'react';
import { Award, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePointsFromPrice } from '@/components/LoyaltyPointsDisplay';

interface PointsEarnedAnimationProps {
  repairPrice: number;
  onContinue: () => void;
}

const POINT_VALUE = 0.5;

const PointsEarnedAnimation = ({ repairPrice, onContinue }: PointsEarnedAnimationProps) => {
  const pointsToEarn = calculatePointsFromPrice(repairPrice);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (pointsToEarn <= 0) {
      onContinue();
      return;
    }

    // Count-up animation
    const duration = 1200;
    const steps = 30;
    const increment = pointsToEarn / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      current = Math.min(Math.round(increment * frame), pointsToEarn);
      setDisplayedPoints(current);
      if (frame >= steps) {
        clearInterval(timer);
        setTimeout(() => setShowDetails(true), 300);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [pointsToEarn]);

  if (pointsToEarn <= 0) return null;

  return (
    <div className="space-y-6 animate-fade-in py-8 text-center">
      {/* Glowing circle */}
      <div className="relative flex justify-center mb-8">
        <div className="absolute w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-28 h-28 bg-primary/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="relative w-32 h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full flex items-center justify-center border-2 border-primary/30">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex flex-col items-center justify-center shadow-xl">
            <Award className="w-8 h-8 text-primary-foreground mb-1" />
            <span className="text-3xl font-extrabold text-primary-foreground leading-none">
              {displayedPoints}
            </span>
          </div>
        </div>
        {/* Floating sparkles */}
        {[0, 1, 2, 3].map((i) => (
          <Sparkles
            key={i}
            className="absolute w-5 h-5 text-primary/60 animate-bounce"
            style={{
              top: `${15 + i * 20}%`,
              left: `${i % 2 === 0 ? 15 : 75}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-foreground">
          צברת <span className="text-primary">{pointsToEarn}</span> נקודות!
        </h2>
        <p className="text-muted-foreground text-base">
          בתיקון הזה אתה צובר נקודות נאמנות
        </p>
      </div>

      {/* Details card */}
      <div
        className={`transition-all duration-500 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-gradient-to-br from-primary/5 via-card to-primary/10 rounded-2xl p-5 border border-primary/20 max-w-sm mx-auto space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">נקודות שנצברו</span>
            <span className="font-bold text-primary text-lg">+{pointsToEarn}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">שווי הנחה לתיקון הבא</span>
            <span className="font-bold text-success text-lg">₪{(pointsToEarn * POINT_VALUE).toFixed(0)}</span>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              כל 100 ש"ח = 10 נקודות · כל נקודה = ₪{POINT_VALUE} הנחה
              <br />
              הנקודות ייזקפו אוטומטית בתיקון הבא
            </p>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div
        className={`transition-all duration-500 delay-300 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Button
          onClick={onContinue}
          className="h-14 px-10 text-base font-bold rounded-2xl shadow-lg gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          המשך להזמנה
        </Button>
      </div>
    </div>
  );
};

export default PointsEarnedAnimation;
