import { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import midragLogo from '@/assets/midrag-logo.png';

interface Testimonial {
  name: string;
  text: string;
  date: string;
  source: 'google' | 'midrag';
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Emotion Love',
    text: 'בחור תותח. הגיע תוך שעה, החליף מסך ב-5 דקות. מרוצה לגמרי. הציל אותי! 💫',
    date: 'ינואר 2026',
    source: 'google',
    rating: 5,
  },
  {
    name: 'Bar Shimshi',
    text: 'מושלם. הגיע תוך חצי שעה, החליף מסך שבור תוך חמש דקות, אחלה מחיר אחלה עבודה ממליצה!!',
    date: 'דצמבר 2025',
    source: 'google',
    rating: 5,
  },
  {
    name: 'אלכסנדר י.',
    text: 'אלירן הגיע עד הבית וביצע את התיקון באופן מהיר ומקצועי. אני מרוצה. היה מצוין!',
    date: 'ספטמבר 2025',
    source: 'midrag',
    rating: 5,
  },
  {
    name: 'לקוח מאומת',
    text: 'אלירן הגיע אליי עד הבית, היה מאוד הוגן ותקתק את העבודה. ממש מקסים.',
    date: 'אוקטובר 2025',
    source: 'midrag',
    rating: 5,
  },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TestimonialsSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <div className="mt-6 mb-2">
      <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-4 min-h-[120px]">
        <div
          key={current}
          className="animate-fade-in space-y-2"
        >
          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
            ))}
          </div>

          {/* Text */}
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">
            "{t.text}"
          </p>

          {/* Footer: name, source, date */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{t.name}</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">מאומת</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {t.source === 'google' ? (
                <>
                  <GoogleIcon />
                  <span className="text-[10px] text-muted-foreground">Google</span>
                </>
              ) : (
                <>
                  <img src={midragLogo} alt="מידרג" className="h-4 w-4 rounded-full object-cover" />
                  <span className="text-[10px] text-muted-foreground">מידרג</span>
                </>
              )}
              <span className="text-[10px] text-muted-foreground">· {t.date}</span>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-primary w-4' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSlider;
