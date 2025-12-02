import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Settings } from 'lucide-react';
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
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-xl gap-3"
              onClick={() => navigate('/track')}
            >
              <Smartphone className="w-5 h-5" />
              עקוב אחר התיקון שלך
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full h-12 rounded-xl gap-3"
              onClick={() => navigate('/admin')}
            >
              <Settings className="w-5 h-5" />
              פאנל ניהול
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
