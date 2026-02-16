import { Gift, Heart, CreditCard, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface GiftOrderToggleProps {
  isGift: boolean;
  onToggle: (isGift: boolean) => void;
}

const GiftOrderToggle = ({ isGift, onToggle }: GiftOrderToggleProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Compact inline toggle */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
        isGift ? 'bg-primary/8 border border-primary/20' : ''
      }`}>
        <button
          onClick={() => onToggle(!isGift)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Collapsible details - only when expanded */}
      {isGift && showDetails && (
        <div className="mt-2 px-4 py-3 bg-muted/50 rounded-xl text-sm space-y-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-primary mt-0.5">1.</span>
            <p className="text-xs text-muted-foreground">בחרו תיקון והזינו את פרטי מקבל המתנה</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-primary mt-0.5">2.</span>
            <p className="text-xs text-muted-foreground">נציג ייצור איתכם קשר לגביית התשלום</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-primary mt-0.5">3.</span>
            <p className="text-xs text-muted-foreground">לאחר התשלום, נתאם הגעה למקבל המתנה</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-border mt-1">
            <CreditCard className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">תשלום מראש נדרש לפני תיאום ההגעה</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftOrderToggle;
