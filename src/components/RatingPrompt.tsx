import { useState } from 'react';
import { Star, ExternalLink, PartyPopper, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RatingPromptProps {
  onRate: (rating: number, feedback?: string) => void;
  currentRating?: number;
  currentFeedback?: string;
}

const RatingPrompt = ({ onRate, currentRating, currentFeedback }: RatingPromptProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating || 0);
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [step, setStep] = useState<'rating' | 'feedback' | 'done'>(currentRating ? 'done' : 'rating');

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    setStep('feedback');
  };

  const handleSubmitFeedback = () => {
    onRate(selectedRating, feedback.trim() || undefined);
    setStep('done');
  };

  const handleSkipFeedback = () => {
    onRate(selectedRating);
    setStep('done');
  };

  const googleReviewUrl = "https://share.google/8DfDFe9PoBcW62VRB";

  return (
    <div className="wolt-card-elevated p-6 text-center animate-slide-up">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <PartyPopper className="w-8 h-8 text-success" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">התיקון הושלם!</h3>
      <p className="text-muted-foreground text-sm mb-6">
        תודה שבחרתם בדיירקט פיקס
      </p>

      {step === 'rating' && (
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
      )}

      {step === 'feedback' && (
        <div className="animate-scale-in space-y-4">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-6 h-6",
                  selectedRating >= star
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          
          <p className="text-sm text-foreground">
            {selectedRating >= 4 ? 'שמחים לשמוע! רוצים לשתף אותנו?' : 'נשמח לשמוע מה יכולנו לעשות טוב יותר'}
          </p>
          
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={selectedRating >= 4 
              ? "מילה טובה תמיד משמחת..." 
              : "ספרו לנו מה קרה, נשתדל להשתפר..."
            }
            className="min-h-[100px] text-right"
          />
          
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleSkipFeedback}>
              דלג
            </Button>
            <Button onClick={handleSubmitFeedback} className="gap-2">
              <Send className="w-4 h-4" />
              שלח
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
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
          
          {feedback && (
            <div className="bg-muted/50 rounded-xl p-3 mb-4 text-sm text-muted-foreground">
              "{feedback}"
            </div>
          )}
          
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
                נשתדל להשתפר בפעמים הבאות
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingPrompt;
