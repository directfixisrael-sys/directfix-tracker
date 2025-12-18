import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ExternalLink } from 'lucide-react';

interface OrderPrivacyConsentProps {
  open: boolean;
  onAccept: () => void;
}

const OrderPrivacyConsent = ({ open, onAccept }: OrderPrivacyConsentProps) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Small delay for animation effect
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleAccept = () => {
    if (acceptTerms) {
      localStorage.setItem('order_privacy_consent', 'true');
      localStorage.setItem('order_privacy_consent_date', new Date().toISOString());
      onAccept();
    }
  };

  const openPrivacyPolicy = () => {
    window.open('https://directfix.co.il/privacy-policy/', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className={`max-w-md p-6 transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
        dir="rtl"
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center mt-3">הגנת הפרטיות שלך חשובה לנו</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-base text-foreground leading-relaxed">
              ב-DirectFix אנו מחויבים לשמור על פרטיותך.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              במסגרת ביצוע ההזמנה, אנו אוספים פרטים בסיסיים כגון:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside mr-2">
              <li>שם מלא</li>
              <li>מספר טלפון</li>
              <li>כתובת למשלוח</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              פרטים אלו משמשים אותנו אך ורק ליצירת קשר, תיאום התיקון ומתן שירות מיטבי.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={openPrivacyPolicy}
            className="w-full flex items-center justify-center gap-2 h-12"
          >
            <span>קרא את מדיניות הפרטיות המלאה</span>
            <ExternalLink className="w-4 h-4" />
          </Button>

          <div className="flex items-start gap-3 p-3 bg-background border border-border rounded-xl">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="mt-0.5 w-5 h-5"
            />
            <label htmlFor="terms" className="text-base cursor-pointer leading-relaxed">
              קראתי ואני מסכים/ה למדיניות הפרטיות ולתנאי השימוש
            </label>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!acceptTerms}
            className="w-full h-14 text-lg font-medium"
          >
            המשך להזמנה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderPrivacyConsent;
