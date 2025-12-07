import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Bell, Share2 } from 'lucide-react';

interface PrivacyConsentModalProps {
  open: boolean;
  onAccept: () => void;
  customerName: string;
}

const PrivacyConsentModal = ({ open, onAccept, customerName }: PrivacyConsentModalProps) => {
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDataCollection, setAcceptDataCollection] = useState(false);
  const [acceptCommunication, setAcceptCommunication] = useState(false);

  const canProceed = acceptPrivacy && acceptDataCollection;

  const handleAccept = () => {
    if (canProceed) {
      // Save consent to localStorage
      localStorage.setItem('privacy_consent_accepted', 'true');
      localStorage.setItem('privacy_consent_date', new Date().toISOString());
      localStorage.setItem('privacy_consent_communication', acceptCommunication.toString());
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0" dir="rtl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">מדיניות פרטיות והסכמה</DialogTitle>
              <DialogDescription className="text-sm">
                שלום {customerName}, לפני שנמשיך
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] px-6">
          <div className="space-y-6 pb-4">
            {/* Data Collection Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">המידע שאנו אוספים</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                במסגרת מתן השירות, אנו אוספים ומעבדים את המידע הבא:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li><span className="font-medium text-foreground">שם מלא</span> - לצורך זיהוי והתקשרות</li>
                <li><span className="font-medium text-foreground">מספר טלפון</span> - ליצירת קשר ושליחת עדכונים</li>
                <li><span className="font-medium text-foreground">כתובת</span> - להגעת הטכנאי לביצוע התיקון</li>
                <li><span className="font-medium text-foreground">סוג המכשיר ותיאור התקלה</span> - לצורך אבחון ותיקון</li>
                <li><span className="font-medium text-foreground">היסטוריית תיקונים</span> - לשיפור השירות</li>
              </ul>
            </div>

            {/* Privacy Policy Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">מדיניות הפרטיות שלנו</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותקנותיו, אנו מתחייבים:
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>לאבטח את המידע שלך בהתאם לתקני האבטחה המחמירים ביותר</li>
                  <li>לא להעביר מידע לצד שלישי ללא הסכמתך, למעט במקרים הנדרשים על פי חוק</li>
                  <li>לאפשר לך לעיין במידע השמור אודותיך ולבקש את מחיקתו</li>
                  <li>לשמור את המידע רק לתקופה הנדרשת למתן השירות</li>
                </ul>
              </div>
            </div>

            {/* Rights */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">הזכויות שלך</h3>
              <p className="text-sm text-muted-foreground">
                בכל עת תוכל/י לפנות אלינו לצורך: עיון במידע, תיקון מידע, מחיקת מידע, או הגבלת עיבוד. 
                לפניות בנושא פרטיות ניתן ליצור קשר בטלפון או בהודעה.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Consent Checkboxes */}
        <div className="p-6 pt-0 space-y-4 border-t">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="privacy" className="text-sm cursor-pointer">
                <span className="font-medium text-foreground">קראתי ואני מסכים/ה למדיניות הפרטיות</span>
                <span className="text-destructive"> *</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  הסכמה זו נדרשת להמשך השימוש בשירות
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="dataCollection"
                checked={acceptDataCollection}
                onCheckedChange={(checked) => setAcceptDataCollection(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="dataCollection" className="text-sm cursor-pointer">
                <span className="font-medium text-foreground">אני מאשר/ת את איסוף ועיבוד המידע האישי שלי</span>
                <span className="text-destructive"> *</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  כולל שם, טלפון, כתובת ופרטי התיקון לצורך מתן השירות
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="communication"
                checked={acceptCommunication}
                onCheckedChange={(checked) => setAcceptCommunication(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="communication" className="text-sm cursor-pointer">
                <span className="font-medium text-foreground">אני מסכים/ה לקבל עדכונים ומבצעים</span>
                <span className="text-muted-foreground text-xs mr-1">(אופציונלי)</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  נשלח לך מידע על מבצעים והטבות. ניתן לבטל בכל עת
                </p>
              </label>
            </div>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            {canProceed ? 'אני מאשר/ת והמשך' : 'יש לאשר את כל השדות הנדרשים'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            ההסכמה שלך נשמרת באופן מאובטח בהתאם לחוק הגנת הפרטיות
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyConsentModal;
