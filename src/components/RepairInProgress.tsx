import { Wrench, Smartphone, CheckCircle2 } from 'lucide-react';

interface RepairInProgressProps {
  technicianName?: string;
  deviceType?: string;
}

const RepairInProgress = ({ technicianName, deviceType }: RepairInProgressProps) => {
  return (
    <div className="wolt-card-elevated overflow-hidden animate-slide-up">
      {/* Animated Illustration */}
      <div className="relative h-52 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating tools background */}
          <div className="absolute top-4 left-8 animate-float-slow opacity-20">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute top-12 right-12 animate-float-delayed opacity-20">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute bottom-20 left-16 animate-float opacity-15">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          
          {/* Sparkles */}
          <div className="absolute top-8 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" />
          <div className="absolute top-16 left-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-sparkle-delayed" />
          <div className="absolute bottom-24 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" />
        </div>

        {/* Main illustration - Technician fixing phone */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Work desk */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-4 bg-amber-700/80 dark:bg-amber-800/60 rounded-t-lg" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-2 bg-amber-600/60 dark:bg-amber-700/50 rounded-lg" />
            
            {/* Technician */}
            <svg viewBox="0 0 120 140" className="w-32 h-40 relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="60" cy="25" r="18" fill="#FBBF24" />
              <circle cx="60" cy="25" r="16" fill="#FCD34D" />
              
              {/* Hair */}
              <path d="M45 18 Q60 5 75 18" fill="hsl(var(--foreground))" fillOpacity="0.7" />
              
              {/* Face */}
              <circle cx="54" cy="23" r="2" fill="hsl(var(--foreground))" fillOpacity="0.8" /> {/* Left eye */}
              <circle cx="66" cy="23" r="2" fill="hsl(var(--foreground))" fillOpacity="0.8" /> {/* Right eye */}
              <path d="M55 30 Q60 34 65 30" stroke="hsl(var(--foreground))" strokeOpacity="0.6" strokeWidth="1.5" fill="none" /> {/* Smile */}
              
              {/* Body - shirt */}
              <path d="M40 45 L45 43 L60 48 L75 43 L80 45 L78 90 L42 90 Z" fill="hsl(var(--primary))" />
              
              {/* Collar */}
              <path d="M52 43 L60 50 L68 43" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
              
              {/* Arms */}
              <path d="M42 50 L30 70 L35 85" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />
              <path d="M78 50 L90 65 L85 80" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" className="animate-arm-working origin-top" style={{ transformOrigin: '78px 50px' }} />
              
              {/* Hands */}
              <circle cx="35" cy="88" r="5" fill="#FCD34D" />
              <circle cx="85" cy="83" r="5" fill="#FCD34D" className="animate-arm-working origin-top" style={{ transformOrigin: '78px 50px' }} />
              
              {/* Phone being repaired in left hand */}
              <rect x="25" y="88" width="20" height="35" rx="3" fill="hsl(var(--foreground))" fillOpacity="0.8" />
              <rect x="27" y="91" width="16" height="26" rx="1" fill="hsl(var(--background))" />
              <rect x="29" y="93" width="12" height="5" rx="1" fill="hsl(var(--primary))" fillOpacity="0.3" />
              <rect x="29" y="100" width="12" height="3" rx="1" fill="hsl(var(--muted))" />
              <rect x="29" y="105" width="8" height="3" rx="1" fill="hsl(var(--muted))" />
              
              {/* Screwdriver in right hand */}
              <rect x="82" y="75" width="3" height="18" rx="1" fill="#F59E0B" className="animate-arm-working origin-top" style={{ transformOrigin: '78px 50px' }} />
              <rect x="81" y="70" width="5" height="6" rx="1" fill="hsl(var(--foreground))" fillOpacity="0.6" className="animate-arm-working origin-top" style={{ transformOrigin: '78px 50px' }} />
              
              {/* Tool belt */}
              <rect x="42" y="85" width="36" height="5" rx="2" fill="hsl(var(--foreground))" fillOpacity="0.5" />
            </svg>
            
            {/* Progress dots */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Status text */}
        {technicianName && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border/50">
            <span className="text-sm font-semibold text-foreground">{technicianName} מתקן</span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Wrench className="w-5 h-5 text-primary animate-wiggle" />
            </div>
            <span className="text-sm font-semibold text-primary">עובדים על המכשיר שלך</span>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-medium text-sm">בתהליך</span>
          </div>
        </div>

        {deviceType && (
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
            <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">מכשיר בתיקון</p>
              <p className="font-medium text-foreground text-sm">{deviceType}</p>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-success/10 rounded-xl border border-success/20">
          <p className="text-sm text-success font-medium text-center">
            הטכנאי עובד על המכשיר שלך כרגע
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            נעדכן אותך ברגע שיסיים
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepairInProgress;