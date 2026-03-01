import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const EmergencyBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('emergency_banner_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('emergency_banner_dismissed', 'true');
  };

  return (
    <div className="bg-amber-500/15 border-b-2 border-amber-500/30 px-4 py-3 relative" dir="rtl">
      <div className="container flex items-start gap-3 max-w-lg mx-auto">
        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            עדכון חשוב – מצב ביטחוני
          </p>
          <p className="text-xs text-amber-700/90 dark:text-amber-400/80 mt-1 leading-relaxed">
            לנוכח המצב הביטחוני, ייתכנו עיכובים בזמני ההגעה או שינויים בלוח הזמנים. 
            אנחנו עושים כל מאמץ לתת שירות רציף – נעדכן אתכם בכל שינוי. תשמרו על עצמכם 🇮🇱
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-600/60 hover:text-amber-600 dark:text-amber-400/60 dark:hover:text-amber-400 transition-colors flex-shrink-0 mt-1"
          aria-label="סגור הודעה"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmergencyBanner;
