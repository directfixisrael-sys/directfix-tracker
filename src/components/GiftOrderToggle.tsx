import { Gift, Heart, CreditCard, ChevronDown, Truck, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface GiftOrderToggleProps {
  isGift: boolean;
  onToggle: (isGift: boolean) => void;
  label?: string;
}

const GiftOrderToggle = ({ isGift, onToggle, label = 'שליחת תיקון במתנה' }: GiftOrderToggleProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const handleToggle = () => {
    const newVal = !isGift;
    if (newVal) {
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 800);
    } else {
      setShowDetails(false);
    }
    onToggle(newVal);
  };

  const steps = [
    {
      icon: <Gift className="w-4 h-4 text-primary" />,
      title: 'בחרו תיקון',
      desc: 'בחרו את סוג התיקון והזינו את פרטי מקבל המתנה',
    },
    {
      icon: <CreditCard className="w-4 h-4 text-primary" />,
      title: 'שלמו מראש באשראי',
      desc: 'התשלום מתבצע לפני הגעת הטכנאי — מקבל המתנה לא משלם כלום!',
    },
    {
      icon: <Mail className="w-4 h-4 text-primary" />,
      title: 'אישור במייל',
      desc: 'לאחר התשלום נשלח אישור הזמנה אליכם ולמקבל המתנה',
    },
    {
      icon: <Truck className="w-4 h-4 text-primary" />,
      title: 'טכנאי מגיע',
      desc: 'נתאם הגעה ישירות עם מקבל המתנה — הפתעה מושלמת!',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Toggle row */}
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
            {label}
          </span>

          {heartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-10 h-10 text-primary fill-primary absolute animate-heart-burst" />
              {[...Array(6)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-3 h-3 text-primary fill-primary absolute animate-heart-particle"
                  style={{ '--particle-angle': `${i * 60}deg` } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </button>

        {isGift && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mr-auto bg-primary/10 px-3 py-1.5 rounded-full"
          >
            <Sparkles className="w-3 h-3" />
            איך זה עובד?
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Expandable steps */}
      {isGift && showDetails && (
        <div className="mt-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-primary/10 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-bold text-foreground">שירות תיקון במתנה 🎁</h4>
          </div>

          <div className="px-5 py-4 space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-[15px] top-8 w-0.5 h-[calc(100%+4px)] bg-primary/15" />
                )}
                {/* Step number circle */}
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 z-10">
                  {step.icon}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom highlight */}
          <div className="px-5 py-3 bg-primary/10 border-t border-primary/15 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs font-medium text-foreground">
              💳 התשלום באשראי מתבצע <strong>לפני</strong> הגעת הטכנאי — כך מקבל המתנה לא צריך לשלם כלום!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftOrderToggle;
