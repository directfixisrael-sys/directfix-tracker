import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

const FloatingTrustBadge = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 animate-slide-up">
      <div className="bg-card/95 backdrop-blur-md border-2 border-amber-300 dark:border-amber-700 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -right-2 bg-muted rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
          aria-label="סגור"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-sm font-bold text-foreground">4.9</span>
        <span className="text-xs text-muted-foreground">מתוך 312 ביקורות</span>
      </div>
    </div>
  );
};

export default FloatingTrustBadge;
