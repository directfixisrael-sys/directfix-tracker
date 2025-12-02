import { useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
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
    <div className="glass-card rounded-2xl p-6 animate-slide-up text-center">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🎉</span>
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">התיקון הושלם בהצלחה!</h3>
      <p className="text-muted-foreground mb-6">
        תודה שבחרתם בדיירקט פיקס. נשמח לשמוע את דעתכם!
      </p>

      {!submitted ? (
        <>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRate(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating || selectedRating) >= star
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">לחצו על הכוכבים לדירוג</p>
        </>
      ) : (
        <div className="animate-scale-in">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-8 h-8",
                  selectedRating >= star
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          
          {selectedRating >= 4 && (
            <div className="space-y-3">
              <p className="text-success font-medium">תודה רבה! 💚</p>
              <p className="text-sm text-muted-foreground">
                נשמח אם תשתפו את החוויה שלכם גם בגוגל
              </p>
              <Button 
                variant="accent" 
                className="gap-2"
                onClick={() => window.open(googleReviewUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                דרגו אותנו בגוגל
              </Button>
            </div>
          )}
          
          {selectedRating < 4 && (
            <div className="space-y-3">
              <p className="text-foreground font-medium">תודה על המשוב!</p>
              <p className="text-sm text-muted-foreground">
                נשתדל להשתפר. אפשר לשלוח לנו הודעה בצ'אט אם יש משהו ספציפי.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingPrompt;
