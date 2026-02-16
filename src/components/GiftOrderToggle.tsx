import { useState } from 'react';
import { Gift, Heart, CreditCard, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GiftOrderToggleProps {
  isGift: boolean;
  onToggle: (isGift: boolean) => void;
}

const GiftOrderToggle = ({ isGift, onToggle }: GiftOrderToggleProps) => {
  return (
    <div className="animate-fade-in">
      <button
        onClick={() => onToggle(!isGift)}
        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
          isGift
            ? 'border-primary bg-primary/10 shadow-md'
            : 'border-border hover:border-primary/30 hover:bg-muted/30'
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isGift 
            ? 'bg-primary/20' 
            : 'bg-muted'
        }`}>
          <Gift className={`w-7 h-7 transition-colors duration-300 ${isGift ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">שליחת תיקון במתנה</h3>
            {isGift && <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isGift ? 'מצב מתנה פעיל 🎁' : 'הפתיעו מישהו יקר בתיקון!'}
          </p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isGift ? 'border-primary bg-primary' : 'border-muted-foreground/30'
        }`}>
          {isGift && <Heart className="w-3 h-3 text-primary-foreground fill-primary-foreground" />}
        </div>
      </button>

      {/* Gift Info - shows when toggled on */}
      {isGift && (
        <div className="mt-4 animate-fade-in">
          {/* Gift Wrapping Visual */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/20 overflow-hidden">
            {/* Ribbon decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-primary/10" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-8 bg-primary/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12">
              <div className="w-full h-full relative">
                <div className="absolute top-1 left-0 w-5 h-5 bg-primary/30 rounded-full" />
                <div className="absolute top-1 right-0 w-5 h-5 bg-primary/30 rounded-full" />
              </div>
            </div>

            <div className="relative z-10 text-center space-y-3">
              <div className="text-4xl">🎁</div>
              <h3 className="font-bold text-lg">איך תיקון במתנה עובד?</h3>
              
              <div className="space-y-3 text-right max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">
                    בחרו את סוג התיקון והזינו את פרטי מקבל המתנה — אנחנו נגיע אליו ישירות
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">
                    לאחר ההזמנה, נציג שלנו ייצור איתכם קשר לגביית התשלום בצורה מאובטחת
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">
                    רק לאחר אישור התשלום, ניצור קשר עם מקבל המתנה ונתאם הגעה
                  </p>
                </div>
              </div>

              <div className="bg-card/80 rounded-xl p-3 mt-2 border border-border/50">
                <div className="flex items-center gap-2 justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold">
                    תיקונים במתנה דורשים תשלום מראש לפני תיאום ההגעה
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftOrderToggle;
