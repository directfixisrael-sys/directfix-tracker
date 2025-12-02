import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center animate-slide-up">
          <img 
            src={logo} 
            alt="Direct Fix Logo" 
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">דיירקט פיקס</h1>
          <p className="text-lg text-muted-foreground mb-8">מערכת מעקב תיקונים</p>

          <div className="space-y-4 max-w-xs mx-auto">
            <Button 
              size="xl" 
              className="w-full gap-3"
              onClick={() => navigate('/track')}
            >
              <Phone className="w-5 h-5" />
              מעקב אחר תיקון
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full gap-3"
              onClick={() => navigate('/admin')}
            >
              <Settings className="w-5 h-5" />
              פאנל ניהול
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} דיירקט פיקס - כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};

export default Index;
