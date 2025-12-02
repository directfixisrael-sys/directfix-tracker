import { useState } from 'react';
import { Star, ExternalLink, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RatingPromptProps {
  onRate: (rating: number) => void;
  currentRating?: number;
}

const RatingPrompt = ({ onRate, currentRating }: RatingPromptProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating || 0);
  const [submitted, setSubmitted] = useState(!!currentRating);

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    onRate(rating);
    setSubmitted(true);
  };

  const googleReviewUrl = "https://g.page/r/directfix/review";

  return (
    <div className="wolt-card-elevated p-6 text-center animate-slide-up">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <PartyPopper className="w-8 h-8 text-success" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">התיקון הושלם! 🎉</h3>
      <p className="text-muted-foreground text-sm mb-6">
        תודה שבחרתם בדיירקט פיקס
      </p>

      {!submitted ? (
        <>
          <p className="text-sm text-foreground mb-4">איך הייתה החוויה?</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRate(star)}
                className="p-1.5 transition-transform hover:scale-125"
              >
                <Star
                  className={cn(
                    "w-9 h-9 transition-colors",
                    (hoveredRating || selectedRating) >= star
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-scale-in">
          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-7 h-7",
                  selectedRating >= star
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          
          {selectedRating >= 4 ? (
            <div className="space-y-4">
              <p className="text-success font-semibold">תודה רבה! 💚</p>
              <p className="text-sm text-muted-foreground">
                נשמח אם תשתפו את החוויה גם בגוגל
              </p>
              <Button 
                className="gap-2 rounded-full"
                onClick={() => window.open(googleReviewUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                דרגו אותנו בגוגל
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold text-foreground">תודה על המשוב</p>
              <p className="text-sm text-muted-foreground">
                נשתדל להשתפר. שלחו לנו הודעה בצ'אט אם יש משהו ספציפי.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingPrompt;
