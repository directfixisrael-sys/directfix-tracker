import { useState, useEffect, useCallback } from 'react';
import { Gift, Sparkles, Check, X, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GiftPromoPopupProps {
  promotionTitle: string;
  promotionDescription: string;
  promotionIcon?: string;
  onClaimed: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, left, color }: { delay: number; left: number; color: string }) => (
  <div
    className="absolute w-2 h-2 rounded-full pointer-events-none"
    style={{
      left: `${left}%`,
      top: '-10px',
      backgroundColor: color,
      animation: `confetti-fall 1.5s ease-out ${delay}s forwards`,
      opacity: 0,
    }}
  />
);

const confettiColors = [
  'hsl(var(--primary))',
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
];

const GiftPromoPopup = ({ promotionTitle, promotionDescription, promotionIcon, onClaimed }: GiftPromoPopupProps) => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'claiming' | 'confetti' | 'secured' | 'exiting'>('entering');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Enter animation
    const t = setTimeout(() => setPhase('visible'), 100);
    return () => clearTimeout(t);
  }, []);

  const handleClaim = useCallback(() => {
    setPhase('claiming');
    
    // Show confetti after brief pulse
    setTimeout(() => {
      setPhase('confetti');
      setShowConfetti(true);
    }, 400);

    // Show secured state
    setTimeout(() => {
      setPhase('secured');
    }, 1800);

    // Auto close
    setTimeout(() => {
      setPhase('exiting');
      setTimeout(() => onClaimed(), 400);
    }, 3200);
  }, [onClaimed]);

  const handleDismiss = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => onClaimed(), 400);
  }, [onClaimed]);

  const getIcon = () => {
    switch (promotionIcon) {
      case 'gift': return '';
      case 'tag': return '';
      case 'sparkles': return '';
      case 'fire': return '';
      default: return '';
    }
  };

  return (
    <>
      {/* Confetti keyframes */}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(500px) rotate(720deg) scale(0.3); }
        }
        @keyframes gift-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-start justify-center px-6 pt-[15vh] overflow-y-auto transition-all duration-400",
          phase === 'entering' ? "bg-black/0" : phase === 'exiting' ? "bg-black/0" : "bg-black/50"
        )}
        onClick={phase === 'visible' ? handleDismiss : undefined}
      >
        {/* Confetti Layer */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={Math.random() * 0.5}
                left={Math.random() * 100}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
            phase === 'entering' && "scale-50 opacity-0 translate-y-20",
            phase === 'visible' && "scale-100 opacity-100 translate-y-0",
            phase === 'claiming' && "scale-105 opacity-100",
            phase === 'confetti' && "scale-100 opacity-100",
            phase === 'secured' && "scale-100 opacity-100",
            phase === 'exiting' && "scale-90 opacity-0 translate-y-10"
          )}
        >
          {/* Dismiss button */}
          {phase === 'visible' && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Top gradient decoration */}
          <div className="h-2 bg-gradient-to-r from-primary via-amber-400 to-primary" />

          {/* Content */}
          <div className="p-8 text-center">
            
            {/* Phase: Visible - Show promo */}
            {(phase === 'visible' || phase === 'entering') && (
              <div className="space-y-5">
                {/* Animated gift icon */}
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-primary/20" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
                  <div
                    className="relative w-20 h-20 bg-gradient-to-br from-primary/15 to-amber-400/15 rounded-full flex items-center justify-center"
                    style={{ animation: 'gift-bounce 2s ease-in-out infinite' }}
                  >
                    <span className="text-4xl">{getIcon()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-primary mb-1">מבצע החודש</p>
                  <h3 className="text-2xl font-extrabold text-foreground mb-2">{promotionTitle}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{promotionDescription}</p>
                </div>

                <Button
                  onClick={handleClaim}
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-2xl gap-3 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/85 group"
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'shimmer 3s linear infinite',
                    backgroundImage: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 50%, hsl(var(--primary)) 100%)',
                  }}
                >
                  <Gift className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  תבעו את המתנה!
                  <Sparkles className="w-4 h-4 opacity-70" />
                </Button>

                <p className="text-[11px] text-muted-foreground/60">*בתוקף עד סוף החודש. לתיקונים חדשים בלבד.</p>
              </div>
            )}

            {/* Phase: Claiming - pulse */}
            {phase === 'claiming' && (
              <div className="py-6 space-y-4 animate-fade-in">
                <div
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-amber-400/20 rounded-full flex items-center justify-center"
                  style={{ animation: 'gift-bounce 0.4s ease-in-out' }}
                >
                  <span className="text-4xl">{getIcon()}</span>
                </div>
                <p className="text-lg font-bold text-foreground">שומר את המתנה...</p>
              </div>
            )}

            {/* Phase: Confetti - celebration */}
            {phase === 'confetti' && (
              <div className="py-6 space-y-4 animate-scale-in">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-success/20 to-emerald-400/20 rounded-full flex items-center justify-center">
                  <PartyPopper className="w-12 h-12 text-success" />
                </div>
                <p className="text-xl font-extrabold text-foreground">מדהים!</p>
                <p className="text-muted-foreground">המתנה שלך נשמרה בהצלחה</p>
              </div>
            )}

            {/* Phase: Secured */}
            {phase === 'secured' && (
              <div className="py-6 space-y-4 animate-fade-in">
                <div className="mx-auto w-20 h-20 bg-success/15 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-success" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-foreground">המתנה שלך מובטחת</p>
                  <p className="text-sm text-muted-foreground mt-1">רק נשאר לבחור דגם ולהשלים את ההזמנה</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftPromoPopup;
