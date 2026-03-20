import { ShoppingCart, User, LogOut, Gift } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useCartStore } from '@/store/cartStore';

interface StoreHeaderProps {
  customerName: string;
  points: number;
  onLogout: () => void;
}

const StoreHeader = ({ customerName, points, onLogout }: StoreHeaderProps) => {
  const navigate = useNavigate();
  const itemCount = useCartStore(s => s.getItemCount());

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">חנות ההטבות</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors">ראשי</Link>
          <Link to="/store/category/iphones" className="text-muted-foreground hover:text-foreground transition-colors">אייפונים</Link>
          <Link to="/store/category/cases" className="text-muted-foreground hover:text-foreground transition-colors">כיסויים</Link>
          <Link to="/store/category/chargers" className="text-muted-foreground hover:text-foreground transition-colors">מטענים</Link>
          <Link to="/store/category/audio" className="text-muted-foreground hover:text-foreground transition-colors">אוזניות</Link>
          <Link to="/store/category/protection" className="text-muted-foreground hover:text-foreground transition-colors">מגנים</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-xs text-muted-foreground">נקודות:</span>
            <span className="text-sm font-bold text-primary">{points.toLocaleString()}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/store/cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                {itemCount}
              </Badge>
            )}
          </Button>

          <div className="hidden md:flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{customerName}</span>
          </div>

          <Button variant="ghost" size="icon" onClick={onLogout} title="התנתק">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
