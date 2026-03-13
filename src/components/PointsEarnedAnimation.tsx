import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, ArrowLeft, Sparkles, Crown, Tag, Shield, Check, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePointsFromPrice } from '@/components/LoyaltyPointsDisplay';
import { Link } from 'react-router-dom';
import clubCardImage from '@/assets/club-card.png';

interface PointsEarnedAnimationProps {
  repairPrice: number;
  onContinue: (joinedClub: boolean) => void;
}

const POINT_VALUE = 0.5;

const PointsEarnedAnimation = ({ repairPrice, onContinue }: PointsEarnedAnimationProps) => {
  const pointsToEarn = calculatePointsFromPrice(repairPrice);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [joinClub, setJoinClub] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);

  useEffect(() => {
    if (pointsToEarn <= 0) {
      onContinue(false);
      return;
    }

    setTimeout(() => setCardAnimated(true), 200);

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

  const benefits = [
    { icon: Award, text: 'צבירת נקודות על כל תיקון', highlight: `+${pointsToEarn} נקודות` },
    { icon: Tag, text: 'מבצעים והנחות בלעדיות לחברים' },
    { icon: Star, text: 'עדיפות בתורים ושירות מועדף' },
    { icon: Shield, text: 'הארכת אחריות בונוס' },
  ];

  return (
    <div className="space-y-5 animate-fade-in py-4 text-center">
      {/* Shimmering Club Card */}
      <div className="relative flex justify-center mb-2">
        <div className="absolute w-72 h-44 bg-primary/20 rounded-3xl blur-3xl animate-pulse" />
        <div
          className={`relative transition-all duration-1000 ${
            cardAnimated ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 -rotate-6'
          }`}
        >
          <div className="relative w-72 mx-auto overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={clubCardImage}
              alt="DirectFix Club Card"
              className="w-full h-auto"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'shimmer 3s ease-in-out infinite' }}
            />
            <div className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <Award className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-extrabold text-lg leading-none">
                {displayedPoints}
              </span>
              <span className="text-primary-foreground/80 text-[10px]">נקודות</span>
            </div>
          </div>
        </div>

        {[0, 1, 2, 3, 4].map((i) => (
          <Sparkles
            key={i}
            className="absolute w-4 h-4 text-amber-400/70 animate-bounce"
            style={{
              top: `${5 + i * 18}%`,
              left: `${i % 2 === 0 ? 8 : 82}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: '2.5s',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-4 py-1.5 text-sm font-bold">
          <Crown className="w-4 h-4" />
          מועדון הלקוחות של דיירקט פיקס
        </div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1 text-xs font-bold">
          הצטרפות בחינם
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">
          הצטרפו וקבלו <span className="text-primary">{pointsToEarn} נקודות!</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          חברי המועדון נהנים מהטבות בלעדיות, נקודות נאמנות והנחות מיוחדות
        </p>
      </div>

      {/* Benefits list */}
      <div
        className={`transition-all duration-500 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-gradient-to-br from-amber-500/5 via-card to-primary/5 rounded-2xl p-4 border border-amber-500/20 max-w-sm mx-auto space-y-2.5">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-right">
              <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{benefit.text}</p>
              </div>
              {benefit.highlight && (
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
                  {benefit.highlight}
                </span>
              )}
            </div>
          ))}

          {/* Value display */}
          <div className="border-t border-border/50 pt-2.5 mt-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">שווי הנקודות שתצברו</span>
              <span className="font-bold text-success text-lg">₪{(pointsToEarn * POINT_VALUE).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Join checkbox - BELOW benefits */}
      <div
        className={`transition-all duration-500 delay-200 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          type="button"
          onClick={() => setJoinClub(!joinClub)}
          className={`w-full max-w-sm mx-auto flex items-center gap-3 rounded-2xl p-4 border-2 transition-all duration-300 ${
            joinClub
              ? 'border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
              : 'border-foreground/10 bg-card hover:border-foreground/20'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              joinClub
                ? 'bg-primary border-primary'
                : 'border-foreground/20 bg-transparent'
            }`}
          >
            {joinClub && <Check className="w-4 h-4 text-primary-foreground" />}
          </div>
          <div className="text-right flex-1">
            <p className="font-bold text-foreground text-sm">
              {joinClub ? 'מצטרף למועדון!' : 'רוצה להצטרף למועדון דיירקט פיקס'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {joinClub
                ? `תקבלו ${pointsToEarn} נקודות (₪${(pointsToEarn * POINT_VALUE).toFixed(0)} הנחה) כבר בהזמנה הבאה`
                : 'הצטרפות בחינם | בכפוף לתקנון המועדון'
              }
            </p>
          </div>
        </button>
      </div>

      {/* Marketing consent note + Terms link */}
      <div className="max-w-sm mx-auto space-y-2">
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-right px-2">
          בהצטרפות למועדון אני מאשר/ת לדיירקט פיקס לשלוח לי מבצעים, הנחות, עדכונים וברכות לחגים באמצעות WhatsApp, SMS ואימייל. ניתן לבטל בכל עת.
        </p>
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          ההצטרפות בחינם וכפופה ל
          <Link to="/club-terms" target="_blank" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-0.5 mx-1">
            תקנון המועדון המלא
            <ExternalLink className="w-3 h-3" />
          </Link>
          | הנקודות תקפות 24 חודשים | תקפות בדיירקט פיקס בלבד
        </p>
      </div>

      {/* Inline CTA - user must scroll to reach it */}
      <div
        className={`transition-all duration-500 delay-300 max-w-sm mx-auto space-y-2 pt-2 pb-8 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Button
          onClick={() => onContinue(joinClub)}
          className={`w-full h-14 text-base font-bold rounded-2xl shadow-lg gap-2 transition-all duration-300 ${
            joinClub
              ? 'bg-gradient-to-r from-amber-500 to-primary hover:from-amber-500/90 hover:to-primary/90'
              : ''
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          {joinClub ? `הצטרף וצבור ${pointsToEarn} נקודות` : 'המשך בלי מועדון'}
        </Button>
        {!joinClub && (
          <p className="text-center text-xs text-muted-foreground/50">
            ניתן להצטרף גם בהמשך
          </p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(15deg); }
          50% { transform: translateX(100%) rotate(15deg); }
          100% { transform: translateX(100%) rotate(15deg); }
        }
      `}</style>
    </div>
  );
};

export default PointsEarnedAnimation;
