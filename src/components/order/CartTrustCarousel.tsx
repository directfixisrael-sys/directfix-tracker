import { useEffect, useState } from 'react';
import { BadgePercent, Star, ShieldCheck, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  count: number;
  onAddRepair?: () => void;
}

const INTERVAL = 4500;

export default function CartTrustCarousel({ count, onAddRepair }: Props) {
  const slides = [
    ...(onAddRepair
      ? [{
          icon: BadgePercent,
          title: count === 1 ? 'מוסיפים עוד תיקון?' : 'רוצים להוסיף עוד תיקון?',
          text: count === 1 ? '15% הנחה על הזול מביניהם' : 'ההנחה על הזול כבר פעילה',
          cta: true,
        }]
      : []),
    { icon: Star, title: 'מדורגים במידרג', text: 'ציונים מובילים באיכות ועמידה בזמנים', cta: false },
    { icon: ShieldCheck, title: 'אפס סיכון כספי', text: 'משלמים רק בסיום, אחרי שבדקתם שהכל עובד', cta: false },
    { icon: Lock, title: 'פרטיות ושקט נפשי', text: 'התיקון מולכם, בלי מסירת סיסמה או איפוס', cta: false },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const idx = i % slides.length;

  return (
    <div
      className="mt-3 rounded-2xl bg-primary/5 border border-primary/15 px-4 pt-2.5 pb-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="למה דיירקט פיקס"
    >
      <div className="relative h-14" aria-live="polite">
        {slides.map((s, n) => {
          const Icon = s.icon;
          const active = n === idx;
          return (
            <div
              key={s.title}
              aria-hidden={!active}
              className={`absolute inset-0 flex items-center justify-between gap-3 transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{s.text}</p>
                </div>
              </div>
              {s.cta && onAddRepair && (
                <Button size="sm" variant="outline" onClick={onAddRepair} tabIndex={active ? 0 : -1} className="h-9 rounded-full gap-1 px-3 flex-shrink-0 border-primary/30 text-primary">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  הוסף תיקון
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5 mt-1">
        {slides.map((s, n) => (
          <button
            key={s.title}
            type="button"
            onClick={() => { setI(n); setPaused(true); }}
            aria-label={`מעבר אל: ${s.title}`}
            className={`h-1.5 rounded-full transition-all ${n === idx ? 'w-5 bg-primary' : 'w-1.5 bg-primary/25'}`}
          />
        ))}
      </div>
    </div>
  );
}
