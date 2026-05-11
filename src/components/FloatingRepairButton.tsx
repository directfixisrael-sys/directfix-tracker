import { Link } from 'react-router-dom';
import { Wrench, Plus } from 'lucide-react';

const FloatingRepairButton = () => {
  return (
    <Link
      to="/order"
      aria-label="הזמן תיקון עכשיו"
      className="fixed bottom-6 right-6 z-50 group"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="relative flex items-center justify-center">
        {/* Pulse rings */}
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/40 animate-ping" />
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-pulse" />

        {/* Main button */}
        <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-2 border-background transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
          <Wrench className="w-7 h-7 transition-transform duration-500 group-hover:rotate-[20deg]" />
          {/* Plus badge */}
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center border-2 border-background shadow-sm">
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
        </span>
      </span>
    </Link>
  );
};

export default FloatingRepairButton;
