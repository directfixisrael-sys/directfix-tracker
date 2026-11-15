import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RepairCart, { type RepairCartLine, type RepairCartAdjustment } from '@/components/order/RepairCart';

const CART_STORAGE_KEY = 'df_cart_v1';
const CART_TTL_MS = 48 * 60 * 60 * 1000;

interface SavedCartDisplay {
  lines: RepairCartLine[];
  adjustments: RepairCartAdjustment[];
  subtotal: number;
  total: number;
}

const readSavedCart = (): SavedCartDisplay | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || 'null');
    if (!saved || Date.now() - (saved.savedAt || 0) >= CART_TTL_MS) return null;
    const display = saved.display;
    if (!display || !Array.isArray(display.lines) || display.lines.length === 0) return null;
    return {
      lines: display.lines,
      adjustments: Array.isArray(display.adjustments) ? display.adjustments : [],
      subtotal: Number(display.subtotal) || 0,
      total: Number(display.total) || 0,
    };
  } catch {
    return null;
  }
};

/**
 * Floating cart bar for pages outside the order flow (e.g. the home page).
 * Shows the cart saved by the order page (48h TTL) and leads back to /order,
 * where the full cart is restored. Read-only: no item removal or coupon editing.
 */
const SavedCartBar = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<SavedCartDisplay | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCart(readSavedCart());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) setCart(readSavedCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!cart) return null;

  return (
    <RepairCart
      variant="floating"
      lines={cart.lines}
      adjustments={cart.adjustments}
      subtotal={cart.subtotal}
      total={cart.total}
      open={open}
      onOpenChange={setOpen}
      note="הסל נשמר מהביקור שלכם בעמוד ההזמנה"
      onContinue={() => navigate('/order')}
      continueLabel="סיום הזמנה"
    />
  );
};

export default SavedCartBar;
