import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smartphone, Wrench, Sparkles, Home, Building2, Clock, Shield, Star, CheckCircle2, Award, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="text-center animate-fade-in max-w-md w-full">
          {/* Logo & Title */}
          <div className="mb-6">
            <img 
              src={logo} 
              alt="Direct Fix Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground mb-1">דיירקט פיקס</h1>
            <p className="text-muted-foreground text-sm">תיקוני סלולר מקצועיים עד הבית</p>
          </div>

          {/* Main CTAs */}
          <div className="space-y-3 mb-8">
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-2xl gap-3 bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => navigate('/order')}
            >
              <div className="w-9 h-9 bg-primary-foreground/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <span>הזמן תיקון חדש</span>
              <Sparkles className="w-4 h-4 opacity-70" />
            </Button>

            <Button 
              variant="outline"
              size="lg" 
              className="w-full h-12 text-sm font-semibold rounded-xl gap-2 border-2"
              onClick={() => navigate('/track')}
            >
              <Smartphone className="w-4 h-4" />
              עקוב אחר התיקון שלך
            </Button>
          </div>

          {/* Experience Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-4 py-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">15+ שנות ניסיון</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <Card className="p-3 text-center bg-gradient-to-br from-card to-muted/30 border-muted">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-0.5">תיקון בבית</h3>
              <p className="text-xs text-muted-foreground">מגיעים עד אליך</p>
            </Card>
            
            <Card className="p-3 text-center bg-gradient-to-br from-card to-muted/30 border-muted">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold text-sm mb-0.5">תיקון במשרד</h3>
              <p className="text-xs text-muted-foreground">גם בסביבת העבודה</p>
            </Card>
            
            <Card className="p-3 text-center bg-gradient-to-br from-card to-muted/30 border-muted">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold text-sm mb-0.5">תיקון מהיר</h3>
              <p className="text-xs text-muted-foreground">עד 30 דקות</p>
            </Card>
            
            <Card className="p-3 text-center bg-gradient-to-br from-card to-muted/30 border-muted">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-sm mb-0.5">אחריות מלאה</h3>
              <p className="text-xs text-muted-foreground">על כל תיקון</p>
            </Card>
          </div>

          {/* Rating Badge */}
          <Card className="p-3 mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-medium">דירוג 5 כוכבים באתר מידרג</span>
            </div>
          </Card>

          {/* Why Us */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">למה לבחור בנו?</h3>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span>טכנאי מוסמך עם ניסיון של 15+ שנה</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span>חלקי חילוף מקוריים ואיכותיים</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span>תשלום רק בסיום התיקון</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span>ללא עלויות נסיעה</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">אמצעי תשלום</h3>
            <div className="flex items-center justify-center gap-4">
              {/* Apple Pay */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-foreground rounded-md flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-4 text-background" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground">Apple Pay</span>
              </div>
              
              {/* Google Pay */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-card border border-border rounded-md flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-4" fill="none">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground">Google Pay</span>
              </div>
              
              {/* Bit */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-gradient-to-br from-sky-400 to-sky-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">bit</span>
                </div>
                <span className="text-[10px] text-muted-foreground">ביט</span>
              </div>
              
              {/* Credit Card */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground">אשראי</span>
              </div>
              
              {/* Cash */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-8 bg-gradient-to-br from-success to-green-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">₪</span>
                </div>
                <span className="text-[10px] text-muted-foreground">מזומן</span>
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>שירות בכל אזור השרון והמרכז</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} דיירקט פיקס - כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};

export default Index;
