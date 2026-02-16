import { Gift, Heart, CreditCard, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface GiftOrderToggleProps {
  isGift: boolean;
  onToggle: (isGift: boolean) => void;
}

const GiftOrderToggle = ({ isGift, onToggle }: GiftOrderToggleProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const handleToggle = () => {
    const newVal = !isGift;
    if (newVal) {
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 800);
    }
    onToggle(newVal);
  };

  return (
    <div className="animate-fade-in">
      {/* Compact inline toggle */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
        isGift ? 'bg-primary/8 border border-primary/20' : ''
      }`}>
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            isGift ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          }`}>
            {isGift && <Heart className="w-3 h-3 text-primary-foreground fill-primary-foreground" />}
          </div>
          <Gift className={`w-4 h-4 ${isGift ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`font-medium ${isGift ? 'text-primary' : ''}`}>
            שליחת תיקון במתנה
          </span>

          {/* Instagram-style heart burst */}
          {heartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-10 h-10 text-primary fill-primary absolute animate-heart-burst" />
              {[...Array(6)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-3 h-3 text-primary fill-primary absolute animate-heart-particle"
                  style={{
                    '--particle-angle': `${i * 60}deg`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </button>

        {isGift && (
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary hover:underline flex items-center gap-0.5 mr-auto"
          >
            איך זה עובד?
            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Expanded details */}
      {isGift && showDetails && (
        <div className="mt-3 px-5 py-4 bg-primary/5 border border-primary/15 rounded-2xl space-y-3 animate-fade-in">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            איך שולחים תיקון במתנה?
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">בחרו תיקון והזינו את פרטי <strong className="text-foreground">מקבל המתנה</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">נציג שלנו ייצור איתכם קשר <strong className="text-foreground">לגביית התשלום</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">לאחר התשלום, נתאם הגעה <strong className="text-foreground">למקבל המתנה</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
            <CreditCard className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground font-medium">תשלום מראש נדרש לפני תיאום ההגעה</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftOrderToggle;
