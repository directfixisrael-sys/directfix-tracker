import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Loader2, Search, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmartRepairInputProps {
  models: Array<{
    id: string;
    name: string;
    original_screen_price: number;
    compatible_screen_price: number;
    battery_price: number;
  }>;
  repairTypes: Array<{
    id: string;
    name: string;
    is_phone_only: boolean;
  }>;
  onModelAndRepairFound: (modelName: string, repairName: string) => void;
  onModelFound: (modelName: string) => void;
}

interface AIResult {
  model_name: string | null;
  repair_names: string[];
  confidence: string;
  suggestion: string;
}

const SmartRepairInput = ({
  models,
  repairTypes,
  onModelAndRepairFound,
  onModelFound
}: SmartRepairInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSmartSearch = async () => {
    if (!query.trim()) {
      toast.error('כתוב מה אתה רוצה לתקן');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setShowResults(false);
    try {
      const { data, error } = await supabase.functions.invoke('parse-repair-request', {
        body: { message: query.trim() }
      });
      if (error) throw error;
      if (data.error && !data.model_name && data.repair_names?.length === 0) {
        toast.error(data.suggestion || 'לא הצלחתי לזהות, אנא בחר ידנית');
        return;
      }
      setResult(data);
      setShowResults(true);
    } catch (err) {
      console.error('Smart search error:', err);
      toast.error('שגיאה בזיהוי, אנא בחר ידנית');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (repairName: string) => {
    if (result?.model_name) {
      onModelAndRepairFound(result.model_name, repairName);
      setIsOpen(false);
    }
  };

  const handleSelectModelOnly = () => {
    if (result?.model_name) {
      onModelFound(result.model_name);
      setIsOpen(false);
    }
  };

  const matchedModel = result?.model_name ? models.find(m => m.name === result.model_name) : null;
  const matchedRepairs = result?.repair_names?.map(name => repairTypes.find(r => r.name === name)).filter(Boolean) || [];

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full h-11 rounded-xl gap-2 text-muted-foreground justify-center border-dashed"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">חיפוש חכם עם AI</span>
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              חיפוש חכם
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    if (showResults) {
                      setShowResults(false);
                      setResult(null);
                    }
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSmartSearch(); }}
                  placeholder='למשל: "מסך לאייפון 14"'
                  className="text-right h-11 text-base rounded-xl"
                  dir="rtl"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button onClick={handleSmartSearch} disabled={isLoading || !query.trim()} className="h-11 px-4 rounded-xl">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* AI Results */}
            {showResults && result && (
              <Card className="p-3 animate-fade-in border-primary/20 bg-primary/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground">{result.suggestion}</p>
                  </div>

                  {matchedModel && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">דגם:</span>
                      <span className="font-semibold">{matchedModel.name}</span>
                    </div>
                  )}

                  {matchedRepairs.length > 0 ? (
                    <div className="space-y-1.5">
                      {matchedRepairs.map(repair => {
                        if (!repair) return null;
                        let price = 0;
                        if (matchedModel) {
                          if (repair.name.includes('מסך מקורי')) price = matchedModel.original_screen_price;
                          else if (repair.name.includes('מסך תואם')) price = matchedModel.compatible_screen_price;
                          else if (repair.name.includes('סוללה')) price = matchedModel.battery_price;
                        }
                        return (
                          <Button
                            key={repair.id}
                            variant="outline"
                            className="w-full justify-between h-auto py-2.5 px-3 rounded-xl"
                            onClick={() => handleSelectOption(repair.name)}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              <span className="font-medium text-sm">{repair.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {price > 0 && <span className="text-primary font-bold text-sm">₪{price}</span>}
                              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  ) : matchedModel ? (
                    <Button
                      variant="outline"
                      className="w-full justify-center h-auto py-2.5 rounded-xl"
                      onClick={handleSelectModelOnly}
                    >
                      <span>בחר תיקון ל-{matchedModel.name}</span>
                      <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                    </Button>
                  ) : null}

                  {!matchedModel && !matchedRepairs.length && (
                    <p className="text-xs text-muted-foreground text-center">
                      לא מצאתי התאמה, בחר ידנית מהרשימה 👇
                    </p>
                  )}
                </div>
              </Card>
            )}

            <p className="text-xs text-muted-foreground text-center">
              כתבו מה תרצו לתקן והמערכת תזהה אוטומטית
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartRepairInput;
