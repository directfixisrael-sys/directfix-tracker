import { ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ showBackButton, onBack }: HeaderProps) => {
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
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
          <img 
            src={logo} 
            alt="Direct Fix Logo" 
            className="h-9 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
