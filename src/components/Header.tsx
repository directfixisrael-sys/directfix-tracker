import { ArrowRight, Moon, Sun, Phone, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/directfix-logo.png';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ showBackButton, onBack }: HeaderProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="container flex items-center justify-between h-14 px-4">
        {showBackButton ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            חזור
          </button>
        ) : (
          <div />
        )}
        
        <div className="flex items-center gap-2">
          <a
            href="tel:033106020"
            className="h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
            aria-label="התקשר 033106020"
          >
            <Phone className="w-4 h-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-accessibility-widget'))}
            className="h-9 w-9 rounded-full"
            aria-label="נגישות"
          >
            <Accessibility className="w-4 h-4" />
          </Button>
          <img 
            src={logo} 
            alt="Direct Fix Logo" 
            className="h-10 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
