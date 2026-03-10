import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, Star, Shield, Clock, MapPin, ChevronLeft, Phone, Play } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/Logo';
import paymentBit from '@/assets/payment-bit.png';
import paymentPaybox from '@/assets/payment-paybox.png';
import paymentVisa from '@/assets/payment-visa.png';
import midragLogo from '@/assets/midrag-logo.png';
import easyLogo from '@/assets/easy-logo.png';
import VideoPlayer from '@/components/VideoPlayer';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col" lang="he">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        דלג לתוכן הראשי
      </a>

      {/* Strategly-style Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-foreground/10" role="banner">
        <nav className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14" aria-label="ניווט ראשי">
          <div className="flex items-center gap-2">
            <a
              href="tel:033106020"
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105"
              aria-label="התקשר 033106020">
              
              <Phone className="w-4 h-4 border-0" />
            </a>
          </div>
          <Logo size="sm" />
        </nav>
      </header>


      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col" role="main" aria-label="דף הבית - דיירקט פיקס">
        
        {/* Hero Section - Cream Background */}
        <section className="section-cream border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <div className="mb-6 animate-fade-in">
              <Logo size="lg" clickable={false} className="justify-center mb-5" />
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-3">
                תיקוני אייפון עם{' '}
                <span className="text-primary font-extrabold text-3xl">החברה המובילה בישראל</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed text-sm">
                טכנאי מגיע עד אליך. מהיר, מקצועי, עם אחריות מלאה.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '150ms' }}>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-extrabold rounded-2xl gap-2 border-2 border-foreground/10 shadow-[4px_4px_0_0_hsl(var(--foreground)/0.1)] hover:shadow-[6px_6px_0_0_hsl(var(--foreground)/0.12)] hover:-translate-y-0.5 transition-all duration-200 bg-[#0073ff]"
                onClick={() => navigate('/order')}>
                
                <Wrench className="w-5 h-5" />
                <span>הזמן תיקון עכשיו</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-bold rounded-2xl gap-2 border-2 border-foreground/15 shadow-[3px_3px_0_0_hsl(var(--foreground)/0.06)] hover:shadow-[4px_4px_0_0_hsl(var(--foreground)/0.1)] hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => navigate('/track')}>
                
                <Smartphone className="w-4 h-4" />
                <span>עקוב אחר התיקון שלך</span>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works - Video Section */}
        <section className="section-peach border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-2">
              <span className="text-3xl text-foreground">איך השירות עובד?</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base">צפו בסרטון קצר ותבינו כמה זה פשוט</p>
            
            <div className="relative max-w-md mx-auto animate-fade-in" style={{ animationDelay: '180ms' }}>
              {/* Blur glow behind */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl" />
              <div className="absolute -inset-2 bg-primary/10 rounded-3xl blur-xl" />
              
              {/* Video card */}
              <VideoPlayer
                src="https://directfix.co.il/wp-content/uploads/2026/03/directfixexplain2.mp4"
                className="border-2 border-foreground/10 bg-card/80 backdrop-blur-md shadow-[4px_4px_0_0_hsl(var(--foreground)/0.1)]" />
              
            </div>
          </div>
        </section>

        <section className="section-lavender border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-2">
              <span className="text-foreground">למה לבחור בנו?</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-base">15+ שנות ניסיון ואלפי לקוחות מרוצים</p>
            
            <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="strategly-card text-center p-4" role="img" aria-label="מגיעים אליך">
                <div className="w-14 h-14 bg-section-mint rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <MapPin className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">מגיעים אליך</p>
                <p className="text-xs text-muted-foreground mt-1">עד הבית</p>
              </div>
              <div className="strategly-card text-center p-4" role="img" aria-label="תיקון מהיר">
                <div className="w-14 h-14 bg-section-peach rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <Clock className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">תיקון מהיר</p>
                <p className="text-xs text-muted-foreground mt-1">תוך דקות</p>
              </div>
              <div className="strategly-card text-center p-4" role="img" aria-label="אחריות מלאה">
                <div className="w-14 h-14 bg-section-cream rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <Shield className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">אחריות מלאה</p>
                <p className="text-xs text-muted-foreground mt-1">על כל תיקון</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section - Mint */}
        <section className="section-mint border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-6">
              <span className="text-highlight">מה הלקוחות אומרים</span>
            </h2>
            
            <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in" style={{ animationDelay: '250ms' }}>
              <div className="strategly-card flex items-center gap-2 px-4 py-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-base font-extrabold">5.0</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
              </div>

              <div className="strategly-card flex items-center gap-2 px-4 py-3">
                <img src={midragLogo} alt="מידרג" className="h-5 w-5 rounded-full object-cover" />
                <span className="text-base font-extrabold">9.92</span>
              </div>

              <div className="strategly-card flex items-center gap-2 px-4 py-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-base font-extrabold">5.0</span>
              </div>

              <div className="strategly-card flex items-center gap-2 px-4 py-3">
                <img src={easyLogo} alt="Easy" className="h-5 w-5 rounded-full object-cover" />
                <span className="text-base font-extrabold">9.94</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Section - Peach */}
        <section className="section-peach">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-6">
              <span className="text-highlight">אמצעי תשלום</span>
            </h2>
            <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="strategly-card h-14 w-18 flex items-center justify-center p-2">
                <img src={paymentVisa} alt="Visa" className="h-8 w-auto object-contain" />
              </div>
              <div className="strategly-card h-14 w-18 flex items-center justify-center p-2">
                <img src={paymentBit} alt="bit" className="h-8 w-auto object-contain" />
              </div>
              <div className="strategly-card h-14 w-18 flex items-center justify-center p-2">
                <img src={paymentPaybox} alt="PayBox" className="h-8 w-auto object-contain rounded-md" />
              </div>
              <div className="strategly-card h-14 w-14 flex items-center justify-center bg-foreground border-foreground">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-background" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
              </div>
              <div className="strategly-card h-14 w-14 flex items-center justify-center bg-success border-success">
                <span className="text-success-foreground text-lg font-bold">₪</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/10 text-center py-5 text-sm text-muted-foreground bg-card" role="contentinfo">
        <p className="font-medium">© {new Date().getFullYear()} דיירקט פיקס — תיקוני אייפון עד הבית</p>
      </footer>
    </div>);

};

export default Index;