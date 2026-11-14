import { useEffect, useState } from 'react';
import { Check, MapPin, Wrench } from 'lucide-react';

export type AvailabilityResult = { dayLabel: string; slot: string } | null;

type Props = {
  /** True once the order page data (models, slots, blocks) has loaded */
  ready: boolean;
  /** Real next free slot, computed from the same rules the schedule step uses */
  result: AvailabilityResult;
  onDone: () => void;
};

const SEARCH_MIN_MS = 1400;
const FOUND_MS = 1100;

const MESSAGES = [
  'בודקים זמינות באזור השרון, המרכז וגוש דן...',
  'מאתרים טכנאי פנוי עבורך...',
];

const AvailabilityCheckScreen = ({ ready, result, onDone }: Props) => {
  const [minElapsed, setMinElapsed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const found = minElapsed && ready;

  useEffect(() => {
    const t1 = setTimeout(() => setMsgIndex(1), SEARCH_MIN_MS / 2);
    const t2 = setTimeout(() => setMinElapsed(true), SEARCH_MIN_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!found) return;
    const t = setTimeout(onDone, FOUND_MS);
    return () => clearTimeout(t);
  }, [found, onDone]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-background px-6"
      dir="rtl"
      role="status"
      aria-live="polite"
      onClick={() => found && onDone()}
    >
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="relative mx-auto mb-8 h-24 w-24">
          {!found && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-primary/10" />
            </>
          )}
          <div
            className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${
              found ? 'bg-success text-success-foreground animate-scale-in' : 'bg-card text-primary border-2 border-primary/30'
            }`}
          >
            {found ? <Check className="h-12 w-12" strokeWidth={3} /> : <MapPin className="h-11 w-11" />}
          </div>
        </div>

        {found ? (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-foreground">
              {result ? 'נמצא טכנאי פנוי' : 'הכל מוכן'}
            </h2>
            {result ? (
              <p className="mt-3 text-lg text-foreground/85">
                {result.dayLabel} · <span dir="ltr" className="font-bold text-success">{result.slot}</span>
              </p>
            ) : (
              <p className="mt-3 text-lg text-foreground/85">בוחרים מועד בהמשך</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">תכף מתחילים</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">תכף מתחילים</h2>
            <p key={msgIndex} className="mt-3 min-h-[3.5rem] text-base text-muted-foreground animate-fade-in">
              {MESSAGES[msgIndex]}
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mx-auto mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted" dir="ltr">
          <div
            className={`h-full rounded-full transition-all ease-out ${found ? 'bg-success' : 'bg-primary'}`}
            style={{
              width: found ? '100%' : minElapsed ? '92%' : '75%',
              transitionDuration: found ? '300ms' : `${SEARCH_MIN_MS}ms`,
            }}
          />
        </div>

        <div className="mt-6 flex flex-row-reverse items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Direct Fix · טכנאי עד הבית</span>
          <Wrench className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCheckScreen;
