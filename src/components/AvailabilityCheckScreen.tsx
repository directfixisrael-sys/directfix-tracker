import { useEffect, useRef, useState } from 'react';
import { MapPin, Wrench } from 'lucide-react';

type Props = {
  /** True once the order page data has loaded */
  ready: boolean;
  onDone: () => void;
  title?: string;
  messages?: string[];
};

const SEARCH_MIN_MS = 1400;
const FINISH_MS = 350;

const DEFAULT_MESSAGES = [
  'בודקים זמינות באזור השרון, המרכז וגוש דן...',
  'מכינים עבורך את ההזמנה...',
];

const AvailabilityCheckScreen = ({ ready, onDone, title = 'תכף מתחילים', messages = DEFAULT_MESSAGES }: Props) => {
  const [minElapsed, setMinElapsed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const found = minElapsed && ready;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t0 = setTimeout(() => setStarted(true), 30);
    const t1 = setTimeout(() => setMsgIndex(1), SEARCH_MIN_MS / 2);
    const t2 = setTimeout(() => setMinElapsed(true), SEARCH_MIN_MS);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!found) return;
    const t = setTimeout(() => onDoneRef.current(), FINISH_MS);
    return () => clearTimeout(t);
  }, [found]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-background px-6"
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="relative mx-auto mb-8 h-24 w-24">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-primary/10" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg bg-card text-primary border-2 border-primary/30">
            <MapPin className="h-11 w-11" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
          <p key={msgIndex} className="mt-3 min-h-[3.5rem] text-base text-muted-foreground animate-fade-in">
            {messages[Math.min(msgIndex, messages.length - 1)]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted" dir="ltr">
          <div
            className="h-full rounded-full transition-all ease-out bg-primary"
            style={{
              width: found ? '100%' : minElapsed ? '92%' : started ? '80%' : '0%',
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
