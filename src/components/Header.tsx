import logo from '@/assets/logo.png';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ showBackButton, onBack }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        {showBackButton ? (
          <button 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            → חזור
          </button>
        ) : (
          <div />
        )}
        
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">דיירקט פיקס</span>
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
