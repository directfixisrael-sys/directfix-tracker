import { createPortal } from 'react-dom';
import { ShoppingBag, X, Trash2, ChevronLeft, Plus, BadgePercent } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export interface RepairCartLine {
  key: string;
  model: string;
  repair: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  onRemove?: () => void;
}

export interface RepairCartAdjustment {
  label: string;
  amount: number; // discount, shown as minus
}

interface RepairCartProps {
  lines: RepairCartLine[];
  adjustments: RepairCartAdjustment[];
  subtotal: number;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'floating' | 'inline';
  note?: string;
  onContinue?: () => void;
  continueLabel?: string;
  onAddRepair?: () => void;
}

export const cartCountLabel = (n: number) => (n === 1 ? 'תיקון אחד' : `${n} תיקונים`);

const RepairCart = ({
  lines,
  adjustments,
  subtotal,
  total,
  open,
  onOpenChange,
  variant,
  note,
  onContinue,
  continueLabel = 'המשך להזמנה',
  onAddRepair,
}: RepairCartProps) => {
  const count = lines.length;
  if (count === 0) return null;
  const hasDiscount = total < subtotal;
  const countLabel = cartCountLabel(count);

  const trigger = (
    <button
      type="button"
      dir="rtl"
      onClick={() => onOpenChange(true)}
      aria-label={`פתיחת הסל: ${countLabel}, סך הכול ${total} שקלים`}
      className={
        variant === 'floating'
          ? 'w-full flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/90 backdrop-blur-xl px-3 py-2.5 text-right shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.65)] transition-transform active:scale-[0.98]'
          : 'w-full flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2 text-right transition-colors hover:bg-muted/70'
      }
    >
      <span
        className={`relative flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center ${
          variant === 'floating' ? 'w-11 h-11' : 'w-9 h-9'
        }`}
        aria-hidden="true"
      >
        <ShoppingBag className={variant === 'floating' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span className="absolute -top-1.5 -left-1.5 min-w-[20px] h-5 px-1 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center border-2 border-card">
          {count}
        </span>
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block font-extrabold leading-tight ${variant === 'floating' ? 'text-base' : 'text-sm'}`}>הסל שלי</span>
        <span className="block text-xs text-muted-foreground leading-tight mt-0.5">{countLabel} · לחצו לצפייה</span>
      </span>
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-left leading-tight">
          {hasDiscount && <span className="block text-xs line-through text-muted-foreground">₪{subtotal}</span>}
          <span className={`block font-extrabold text-primary ${variant === 'floating' ? 'text-xl' : 'text-lg'}`}>₪{total}</span>
        </span>
        <ChevronLeft className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      </span>
    </button>
  );

  return (
    <>
      {variant === 'floating'
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none animate-fade-in">
              <div className="max-w-3xl mx-auto pointer-events-auto">{trigger}</div>
            </div>,
            document.body,
          )
        : trigger}

      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent dir="rtl" className="max-h-[88vh] rounded-t-3xl">
          <div className="w-full max-w-3xl mx-auto px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <div>
                  <DrawerTitle className="text-2xl font-extrabold leading-tight">הסל שלי</DrawerTitle>
                  <DrawerDescription className="text-sm text-muted-foreground">{countLabel} בהזמנה</DrawerDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="סגירת הסל"
                className="w-10 h-10 rounded-xl bg-muted/70 hover:bg-muted flex items-center justify-center border border-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-2 overflow-y-auto min-h-0" aria-label="תיקונים בסל">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-snug">{line.repair}</p>
                    <p className="text-sm text-muted-foreground leading-snug">{line.model}</p>
                    {line.badge && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2 py-0.5 bg-success/10 text-success border border-success/30">
                        <BadgePercent className="w-3 h-3" aria-hidden="true" />
                        {line.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0 leading-tight">
                    {line.originalPrice !== undefined && line.originalPrice > line.price && (
                      <span className="block text-xs line-through text-muted-foreground">₪{line.originalPrice}</span>
                    )}
                    <span className="block font-extrabold text-lg">₪{line.price}</span>
                  </div>
                  {line.onRemove && (
                    <button
                      type="button"
                      onClick={line.onRemove}
                      aria-label={`הסרת ${line.repair} ל${line.model} מהסל`}
                      className="w-10 h-10 flex-shrink-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {count === 1 && onAddRepair && (
              <p className="mt-3 text-sm text-muted-foreground text-center">
                מוסיפים עוד תיקון? מקבלים 15% הנחה על הזול מביניהם
              </p>
            )}

            <div className="mt-4 pt-4 border-t-2 border-dashed border-border space-y-2">
              {adjustments.length > 0 && (
                <div className="flex justify-between items-center text-base">
                  <span className="text-muted-foreground">סכום ביניים</span>
                  <span className="font-semibold">₪{subtotal}</span>
                </div>
              )}
              {adjustments.map((adj) => (
                <div key={adj.label} className="flex justify-between items-center text-base text-success">
                  <span className="font-medium">{adj.label}</span>
                  <span className="font-bold">-₪{adj.amount}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-extrabold">סה״כ</span>
                <span className="text-2xl font-extrabold text-primary">₪{total}</span>
              </div>
              {hasDiscount && (
                <p className="text-sm font-semibold text-success text-left">חסכתם ₪{subtotal - total}</p>
              )}
              {note && <p className="text-sm text-muted-foreground">{note}</p>}
            </div>

            <div className="mt-5 space-y-2">
              {onContinue && (
                <Button onClick={onContinue} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg">
                  {continueLabel}
                </Button>
              )}
              {onAddRepair && (
                <Button variant="outline" onClick={onAddRepair} className="w-full h-12 text-sm rounded-2xl gap-2">
                  <Plus className="w-4 h-4" />
                  הוספת תיקון נוסף
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default RepairCart;
