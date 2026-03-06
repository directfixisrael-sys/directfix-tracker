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
    back_glass_price: number;
    charging_price?: number;
  }>;
  repairTypes: Array<{
    id: string;
    name: string;
    is_phone_only: boolean;
  }>;
  priceMap?: Record<string, Record<string, number>>;
  onModelAndRepairFound: (modelName: string, repairName: string) => void;
  onModelFound: (modelName: string) => void;
  inline?: boolean;
}

interface AIResult {
  model_name: string | null;
  repair_names: string[];
  confidence: string;
  suggestion: string;
}

const useSmartSearch = (
  models: SmartRepairInputProps['models'],
  repairTypes: SmartRepairInputProps['repairTypes'],
) => {
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

  const clearResults = () => {
    setShowResults(false);
    setResult(null);
  };

  const matchedModel = result?.model_name ? models.find(m => m.name === result.model_name) : null;
  const matchedRepairs = result?.repair_names?.map(name => repairTypes.find(r => r.name === name)).filter(Boolean) || [];

  return { query, setQuery, isLoading, result, showResults, handleSmartSearch, clearResults, matchedModel, matchedRepairs };
};

const ResultsCard = ({
  result,
  matchedModel,
  matchedRepairs,
  priceMap,
  onSelectOption,
  onSelectModelOnly,
}: {
  result: AIResult;
  matchedModel: SmartRepairInputProps['models'][0] | undefined;
  matchedRepairs: Array<SmartRepairInputProps['repairTypes'][0] | undefined>;
  priceMap?: Record<string, Record<string, number>>;
  onSelectOption: (name: string) => void;
  onSelectModelOnly: () => void;
}) => (
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
          {matchedRepairs.filter(repair => {
            if (!repair || !matchedModel) return !!repair;
            const price = priceMap?.[matchedModel.id]?.[repair.id] || 0;
            if (price <= 0 && !repair.is_phone_only && !repair.name.includes('אחר')) return false;
            return true;
          }).map(repair => {
            if (!repair) return null;
            const price = matchedModel ? (priceMap?.[matchedModel.id]?.[repair.id] || 0) : 0;
            return (
              <Button
                key={repair.id}
                variant="outline"
                className="w-full justify-between h-auto py-2.5 px-3 rounded-xl"
                onClick={() => onSelectOption(repair.name)}
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
          onClick={onSelectModelOnly}
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
);

const SmartRepairInput = ({
  models,
  repairTypes,
  priceMap,
  onModelAndRepairFound,
  onModelFound,
  inline = false,
}: SmartRepairInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, isLoading, result, showResults, handleSmartSearch, clearResults, matchedModel, matchedRepairs } =
    useSmartSearch(models, repairTypes);

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

  // Inline mode for desktop header
  if (inline) {
    return (
      <div className="relative">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                if (showResults) clearResults();
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleSmartSearch(); }}
              placeholder='חיפוש חכם: "מסך לאייפון 14"...'
              className="pr-9 text-right h-9 text-sm rounded-lg bg-muted/50 border-border"
              dir="rtl"
              disabled={isLoading}
            />
          </div>
          <Button
            size="sm"
            onClick={handleSmartSearch}
            disabled={isLoading || !query.trim()}
            className="h-9 px-3 rounded-lg gap-1.5"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="text-xs">חפש</span>
          </Button>
        </div>

        {/* Dropdown results */}
        {showResults && result && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50">
            <ResultsCard
              result={result}
              matchedModel={matchedModel}
              matchedRepairs={matchedRepairs}
              priceMap={priceMap}
              onSelectOption={handleSelectOption}
              onSelectModelOnly={handleSelectModelOnly}
            />
          </div>
        )}
      </div>
    );
  }

  // Mobile: button that opens dialog
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-xl gap-2.5 justify-center text-base font-semibold shadow-md"
      >
        <Sparkles className="w-5 h-5" />
        <span>חיפוש חכם עם AI</span>
        <Search className="w-4 h-4 opacity-70" />
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
                    if (showResults) clearResults();
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

            {showResults && result && (
              <ResultsCard
                result={result}
                matchedModel={matchedModel}
                matchedRepairs={matchedRepairs}
                onSelectOption={handleSelectOption}
                onSelectModelOnly={handleSelectModelOnly}
              />
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
