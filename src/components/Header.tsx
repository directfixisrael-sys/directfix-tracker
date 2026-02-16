import { useState } from 'react';
import { ArrowRight, Moon, Sun, Phone, Accessibility, Menu, X } from 'lucide-react';
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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="תפריט"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        )}

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href="tel:033106020"
            className="h-9 w-9 rounded-full bg-success hover:bg-success/90 text-success-foreground flex items-center justify-center transition-colors"
            aria-label="התקשר 033106020"
          >
            <Phone className="w-4 h-4" />
          </a>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
        </div>

        {/* Logo - always visible */}
        <img 
          src={logo} 
          alt="Direct Fix Logo" 
          className="h-10 w-auto cursor-pointer"
          onClick={() => navigate('/')}
        />
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-card border-t border-border/50 animate-slide-down">
          <div className="flex items-center justify-center gap-4 py-3 px-4">
            <a
              href="tel:033106020"
              className="h-12 w-12 rounded-full bg-success hover:bg-success/90 text-success-foreground flex items-center justify-center transition-colors"
              aria-label="התקשר 033106020"
              onClick={() => setMenuOpen(false)}
            >
              <Phone className="w-5 h-5" />
            </a>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="h-12 w-12 rounded-full"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { window.dispatchEvent(new CustomEvent('open-accessibility-widget')); setMenuOpen(false); }}
              className="h-12 w-12 rounded-full"
              aria-label="נגישות"
            >
              <Accessibility className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
