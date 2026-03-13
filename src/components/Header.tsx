import { useState } from 'react';
import { ArrowRight, Moon, Sun, Phone, Accessibility, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import Logo from '@/components/Logo';
import CustomerZone from '@/components/CustomerZone';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ showBackButton, onBack }: HeaderProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b-2 border-foreground/10 sticky top-0 z-50 pt-[env(safe-area-inset-top)]" role="banner" aria-label="כותרת עליונה">
      <nav className="container flex items-center justify-between h-14 px-4" aria-label="ניווט ראשי">
        {/* Mobile left buttons - always show profile + menu */}
        <div className="flex items-center gap-2 sm:hidden">
          <CustomerZone />
          {showBackButton ? (
            <button 
              onClick={onBack}
              className="h-10 w-10 rounded-xl bg-muted/80 border-2 border-foreground/10 flex items-center justify-center transition-transform hover:scale-105"
              aria-label="חזור לדף הקודם"
            >
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-muted/80 border-2 border-foreground/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="תפריט"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2" role="toolbar" aria-label="פעולות מהירות">
          <CustomerZone />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-xl border-2 border-foreground/10" aria-label={resolvedTheme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}>
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-accessibility-widget'))}
            className="h-9 w-9 rounded-xl border-2 border-foreground/10"
            aria-label="נגישות"
          >
            <Accessibility className="w-4 h-4" />
          </Button>
          <a
            href="tel:033106020"
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105"
            aria-label="התקשר אלינו 033106020"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <Logo size="sm" />
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-card border-t-2 border-foreground/10 animate-slide-down">
          <div className="flex items-center justify-center gap-4 py-3 px-4">
            <a
              href="tel:033106020"
              className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105"
              aria-label="התקשר 033106020"
              onClick={() => setMenuOpen(false)}
            >
              <Phone className="w-5 h-5" />
            </a>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="h-12 w-12 rounded-xl border-2 border-foreground/15"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { window.dispatchEvent(new CustomEvent('open-accessibility-widget')); setMenuOpen(false); }}
              className="h-12 w-12 rounded-xl border-2 border-foreground/15"
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
