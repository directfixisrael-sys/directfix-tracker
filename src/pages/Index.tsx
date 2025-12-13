import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Settings, Wrench, Sparkles, ShoppingBag } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center animate-slide-up max-w-sm">
          <img 
            src={logo} 
            alt="Direct Fix Logo" 
            className="h-20 w-auto mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">דיירקט פיקס</h1>
          <p className="text-muted-foreground mb-10">מערכת מעקב תיקונים בזמן אמת</p>

          <div className="space-y-4">
            {/* New Repair Order Button - Primary CTA */}
            <Button 
              size="lg" 
              className="w-full h-16 text-lg font-semibold rounded-2xl gap-3 bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => navigate('/order')}
            >
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span>הזמן תיקון חדש</span>
              <Sparkles className="w-4 h-4 opacity-70" />
            </Button>

            <Button 
              variant="outline"
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-xl gap-3 border-2"
              onClick={() => navigate('/track')}
            >
              <Smartphone className="w-5 h-5" />
              עקוב אחר התיקון שלך
            </Button>

            {/* Device Purchase Button */}
            <Button 
              variant="outline"
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-xl gap-3 border-2 bg-gradient-to-l from-accent/10 to-primary/10 border-primary/30 hover:border-primary/50"
              onClick={() => navigate('/devices')}
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>קניית מכשירים</span>
              <span className="text-xs bg-success text-success-foreground px-2 py-0.5 rounded-full">חדש!</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} דיירקט פיקס</p>
      </footer>
    </div>
  );
};

export default Index;
