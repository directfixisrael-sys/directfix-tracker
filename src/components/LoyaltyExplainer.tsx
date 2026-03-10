import { Star, Gift, Trophy } from 'lucide-react';

interface LoyaltyExplainerProps {
  variant?: 'section' | 'compact';
}

const LoyaltyExplainer = ({ variant = 'section' }: LoyaltyExplainerProps) => {
  if (variant === 'compact') {
    return (
      <div className="strategly-card p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm">תוכנית נאמנות</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              צוברים <strong className="text-foreground">50 נקודות</strong> על כל תיקון.
              כל 100 נקודות = <strong className="text-foreground">₪10 הנחה</strong> בתיקון הבא!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5">
      <h2 className="text-2xl font-extrabold">
        <span className="text-highlight">תוכנית נאמנות</span>
      </h2>
      <p className="text-muted-foreground text-base max-w-xs mx-auto">צוברים נקודות, חוסכים בתיקון הבא</p>

      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="strategly-card text-center p-4">
          <div className="w-12 h-12 bg-section-peach rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-foreground/10">
            <Star className="w-5 h-5 text-foreground/70" />
          </div>
          <p className="text-sm font-bold">50 נקודות</p>
          <p className="text-xs text-muted-foreground mt-0.5">על כל תיקון</p>
        </div>

        <div className="strategly-card text-center p-4">
          <div className="w-12 h-12 bg-section-mint rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-foreground/10">
            <Gift className="w-5 h-5 text-foreground/70" />
          </div>
          <p className="text-sm font-bold">₪10 הנחה</p>
          <p className="text-xs text-muted-foreground mt-0.5">כל 100 נקודות</p>
        </div>

        <div className="strategly-card text-center p-4">
          <div className="w-12 h-12 bg-section-lavender rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-foreground/10">
            <Trophy className="w-5 h-5 text-foreground/70" />
          </div>
          <p className="text-sm font-bold">מימוש קל</p>
          <p className="text-xs text-muted-foreground mt-0.5">בהזמנה הבאה</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyExplainer;
