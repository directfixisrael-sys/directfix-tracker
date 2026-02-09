import { useRef, useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import midragLogo from '@/assets/midrag-logo.png';
import easyLogo from '@/assets/easy-logo.png';

interface Testimonial {
  name: string;
  text: string;
  date: string;
  source: 'google' | 'midrag' | 'easy';
}

const testimonials: Testimonial[] = [
  {
    name: 'Emotion Love',
    text: 'הגיע תוך שעה, החליף מסך ב-5 דקות. מרוצה לגמרי!',
    date: 'ינואר 2026',
    source: 'google',
  },
  {
    name: 'Bar Shimshi',
    text: 'הגיע תוך חצי שעה, אחלה מחיר ועבודה. ממליצה!',
    date: 'דצמבר 2025',
    source: 'google',
  },
  {
    name: 'אלכסנדר י.',
    text: 'תיקון מהיר ומקצועי עד הבית. מצוין!',
    date: 'ספטמבר 2025',
    source: 'midrag',
  },
  {
    name: 'לקוח מאומת',
    text: 'הגיע עד הבית, הוגן ומקסים. תקתק את העבודה.',
    date: 'אוקטובר 2025',
    source: 'midrag',
  },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TestimonialsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const timer = setInterval(() => {
      const nextIdx = (activeIdx + 1) % testimonials.length;
      const card = container.children[nextIdx] as HTMLElement;
      if (card) {
        container.scrollTo({ left: card.offsetLeft - 12, behavior: 'smooth' });
      }
      setActiveIdx(nextIdx);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIdx]);

  // Track scroll position
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = (container.children[0] as HTMLElement)?.offsetWidth || 200;
    const idx = Math.round(scrollLeft / (cardWidth + 8));
    setActiveIdx(Math.min(idx, testimonials.length - 1));
  };

  return (
    <div className="mb-2">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 w-[75%] bg-card border border-border rounded-xl px-3 py-2.5"
          >
            {/* Top row: stars + source */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-warning text-warning" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {t.source === 'google' ? (
                  <>
                    <GoogleIcon />
                    <span className="text-[10px] text-muted-foreground">Google</span>
                  </>
                ) : (
                  <>
                    <img src={midragLogo} alt="מידרג" className="h-3.5 w-3.5 rounded-full object-cover" />
                    <span className="text-[10px] text-muted-foreground">מידרג</span>
                  </>
                )}
              </div>
            </div>

            {/* Text */}
            <p className="text-xs text-foreground leading-relaxed mb-1.5">"{t.text}"</p>

            {/* Footer */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-foreground">{t.name}</span>
              <CheckCircle2 className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">מאומת</span>
              <span className="text-[10px] text-muted-foreground">· {t.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === activeIdx ? 'bg-primary w-3' : 'bg-muted-foreground/20 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSlider;
