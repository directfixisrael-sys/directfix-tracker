import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, Star, Shield, Clock, MapPin, ChevronLeft, Phone, Play, Tablet, PhoneCall, ArrowLeftRight, ChevronDown, HelpCircle, Bot, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Logo from '@/components/Logo';
import CustomerZone from '@/components/CustomerZone';
import LanguageToggle from '@/components/LanguageToggle';
import paymentBit from '@/assets/payment-bit.png';
import paymentPaybox from '@/assets/payment-paybox.png';
import paymentVisa from '@/assets/payment-visa.png';
import midragLogo from '@/assets/midrag-logo.png';
import easyLogo from '@/assets/easy-logo.png';
import heroTechnicians from '@/assets/hero-technicians.jpg';
import VideoPlayer from '@/components/VideoPlayer';
import TechnicianRecruitment from '@/components/TechnicianRecruitment';
import Header from '@/components/Header';
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";

const Index = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const heroBullets = [
    'זמינות מיידית: הגעה תוך שעה אחת',
    'מתקנים מסכים במהירות',
    'חלפים באיכות גבוהה, אחריות מלאה',
    'מתקנים את כל דגמי האייפון',
    'אלפי לקוחות מרוצים · מוניטין של 15 שנים',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" lang={i18n.language}>
      <SEO {...seo.home} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        {t('common.skipToContent')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 flex flex-col" role="main" aria-label="DirectFix">

        {/* Hero - DirectFix.co.il style */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'var(--gradient-hero)' }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-right animate-fade-in order-2 md:order-1">
              <h1 className="font-extrabold text-foreground tracking-tight leading-[1.1] mb-6 text-4xl sm:text-5xl lg:text-6xl">
                דיירקט פיקס — <span className="text-primary">תיקון אייפון עד הבית</span>
              </h1>

              <ul className="space-y-2.5 mb-8 inline-block text-right">
                {heroBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-base sm:text-lg text-foreground/85">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto md:mx-0">
                <button
                  onClick={() => navigate('/order')}
                  className="group h-20 rounded-2xl px-5 flex items-center justify-between gap-3 text-right shadow-lg shadow-black/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                  style={{ backgroundColor: 'hsl(var(--cta-order))', color: 'hsl(var(--cta-order-foreground))' }}
                >
                  <Wrench className="w-7 h-7 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-lg font-extrabold leading-tight">הזמנת תיקון</div>
                    <div className="text-xs opacity-90">פתיחת הזמנה במערכת</div>
                  </div>
                  <ChevronLeft className="w-5 h-5 opacity-80 group-hover:-translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:033106020"
                  className="group h-20 rounded-2xl px-5 flex items-center justify-between gap-3 text-right shadow-lg shadow-black/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                  style={{ backgroundColor: 'hsl(var(--cta-call))', color: 'hsl(var(--cta-call-foreground))' }}
                >
                  <Phone className="w-7 h-7 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-lg font-extrabold leading-tight">התקשרו עכשיו</div>
                    <div className="text-xs opacity-90" dir="ltr">03-3106020</div>
                  </div>
                  <ChevronLeft className="w-5 h-5 opacity-80 group-hover:-translate-x-1 transition-transform" />
                </a>
              </div>

              <button
                onClick={() => navigate('/track')}
                className="mt-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                {t('home.ctaTrack')}
              </button>
            </div>

            <div className="relative order-1 md:order-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-full overflow-hidden ring-8 ring-white/70 dark:ring-white/10 shadow-2xl shadow-primary/20">
                  <img
                    src={heroTechnicians}
                    alt="טכנאי DirectFix מגיע עד הבית"
                    className="w-full h-full object-cover"
                    width={1024}
                    height={1024}
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/95 backdrop-blur-md rounded-full px-4 py-2 border border-border shadow-lg">
                  <img src={paymentVisa} alt="Visa" className="h-6 w-auto object-contain" />
                  <img src={paymentBit} alt="bit" className="h-6 w-auto object-contain" />
                  <img src={paymentPaybox} alt="PayBox" className="h-6 w-auto object-contain rounded" />
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor" aria-label="Apple Pay"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09z" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto px-6 pb-6 -mt-4">
            <Collapsible>
              <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 group">
                <span className="text-sm font-semibold">{t('home.moreServices')}</span>
                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
                <Button variant="outline" size="lg" className="h-12 rounded-2xl gap-2 border-border/60" onClick={() => navigate('/ipad')}>
                  <Tablet className="w-4 h-4" /><span>{t('home.ipadRepair')}</span>
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-2xl gap-2 border-border/60" onClick={() => navigate('/consultation')}>
                  <PhoneCall className="w-4 h-4" /><span>{t('home.consultation')}</span>
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-2xl gap-2 border-border/60" onClick={() => navigate('/data-transfer')}>
                  <ArrowLeftRight className="w-4 h-4" /><span>{t('home.dataTransfer')}</span>
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-2xl gap-2 border-border/60" onClick={() => navigate('/ai-agent')}>
                  <Bot className="w-4 h-4" /><span>{t('home.aiAgent')}</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>



        {/* How it works - Video Section */}
        <section className="section-peach border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-2">
              <span className="text-3xl text-foreground">{t('home.howItWorksTitle')}</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base">{t('home.howItWorksSubtitle')}</p>
            
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
              <span className="text-foreground">{t('home.whyUsTitle')}</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-base">{t('home.whyUsSubtitle')}</p>
            
            <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="strategly-card text-center p-4" role="img" aria-label={t('home.comeToYou')}>
                <div className="w-14 h-14 bg-section-mint rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <MapPin className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">{t('home.comeToYou')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.comeToYouSub')}</p>
              </div>
              <div className="strategly-card text-center p-4" role="img" aria-label={t('home.fastRepair')}>
                <div className="w-14 h-14 bg-section-peach rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <Clock className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">{t('home.fastRepair')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.fastRepairSub')}</p>
              </div>
              <div className="strategly-card text-center p-4" role="img" aria-label={t('home.fullWarranty')}>
                <div className="w-14 h-14 bg-section-cream rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10">
                  <Shield className="w-6 h-6 text-foreground/70" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">{t('home.fullWarranty')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.fullWarrantySub')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section - Mint */}
        <section className="section-mint border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-6">
              <span className="text-foreground">{t('home.reviewsTitle')}</span>
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

        {/* FAQ Section - Cream */}
        <section className="section-cream border-b-2 border-foreground/10">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold mb-2">
                <span className="text-foreground">שאלות נפוצות</span>
              </h2>
              <p className="text-muted-foreground text-base">כל מה שרציתם לדעת על תיקון אייפון בבית</p>
            </div>

            <Accordion type="single" collapsible className="space-y-2.5 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {[
                { q: "כמה עולה החלפת מסך אייפון?", a: "מחירי החלפת מסך נעים בין ₪399 לדגמים ישנים ועד ₪1,890 ל-Pro Max החדשים. המחיר המדויק מוצג בעמוד ההזמנה לפי הדגם שלכם." },
                { q: "כמה זמן לוקח התיקון?", a: "רוב התיקונים מתבצעים במקום תוך 20-40 דקות. הטכנאי מגיע אליכם הביתה או למשרד עם כל הציוד הנדרש." },
                { q: "באילו אזורים אתם נותנים שירות?", a: "אנחנו פועלים בכל מרכז הארץ וגוש דן - מנתניה ועד מודיעין. כולל תל אביב, רמת גן, גבעתיים, הרצליה, רעננה, פתח תקווה, ראשון לציון, חולון ועוד." },
                { q: "איזו אחריות אתם נותנים?", a: "אחריות מלאה על כל תיקון: 12 חודשים על סוללה, 6 חודשים על שקע טעינה, ו-3 חודשים על מסך (לא כולל נזק שבירה)." },
                { q: "האם החלקים מקוריים?", a: "אנחנו מציעים מסך מקורי או תואם איכותי לבחירתכם. הסוללות שלנו מקוריות בלבד עם אחריות 12 חודשים." },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="strategly-card px-4 border-2 border-foreground/10"
                >
                  <AccordionTrigger className="text-right text-base font-bold hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 text-right">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-5">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <HelpCircle className="w-4 h-4" />
                <span>לכל השאלות הנפוצות</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Payment Section - Peach */}
        <section className="section-peach">
          <div className="max-w-2xl mx-auto px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold mb-6">
              <span className="text-foreground">{t('home.paymentTitle')}</span>
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
                <span className="text-success-foreground text-lg font-bold">{i18n.language?.startsWith('he') ? '₪' : '$'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Technician Recruitment */}
      <TechnicianRecruitment />

      {/* Footer */}
      <footer className="border-t-2 border-foreground/10 text-center py-5 text-sm text-muted-foreground bg-card" role="contentinfo">
        <p className="font-medium">{t('home.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>);

};

export default Index;