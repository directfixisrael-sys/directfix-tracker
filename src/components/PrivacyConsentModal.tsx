import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield } from 'lucide-react';

interface PrivacyConsentModalProps {
  open: boolean;
  onAccept: () => void;
  customerName: string;
}

const PrivacyConsentModal = ({ open, onAccept, customerName }: PrivacyConsentModalProps) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptCommunication, setAcceptCommunication] = useState(false);

  const handleAccept = () => {
    if (acceptTerms) {
      localStorage.setItem('privacy_consent_accepted', 'true');
      localStorage.setItem('privacy_consent_date', new Date().toISOString());
      localStorage.setItem('privacy_consent_communication', acceptCommunication.toString());
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm p-5" dir="rtl">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <DialogTitle className="text-base">הסכמה לתנאי שימוש</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            שלום {customerName}, לצורך מעקב אחר התיקון אנו אוספים מידע בסיסי (שם, טלפון, כתובת).
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
                אני מסכים/ה ל<span className="text-primary underline">תנאי השימוש</span> ולמדיניות הפרטיות
              </label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="communication"
                checked={acceptCommunication}
                onCheckedChange={(checked) => setAcceptCommunication(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="communication" className="text-sm cursor-pointer text-muted-foreground leading-tight">
                אני מסכים/ה לקבל עדכונים ומבצעים (אופציונלי)
              </label>
            </div>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!acceptTerms}
            className="w-full"
          >
            המשך
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyConsentModal;