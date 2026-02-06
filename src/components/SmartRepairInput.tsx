import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      const {
        data,
        error
      } = await supabase.functions.invoke('parse-repair-request', {
        body: {
          message: query.trim()
        }
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
    }
  };
  const handleSelectModelOnly = () => {
    if (result?.model_name) {
      onModelFound(result.model_name);
    }
  };
  const matchedModel = result?.model_name ? models.find(m => m.name === result.model_name) : null;
  const matchedRepairs = result?.repair_names?.map(name => repairTypes.find(r => r.name === name)).filter(Boolean) || [];
  return <div className="space-y-3 mb-6">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input value={query} onChange={e => {
            setQuery(e.target.value);
            if (showResults) {
              setShowResults(false);
              setResult(null);
            }
          }} onKeyDown={e => {
            if (e.key === 'Enter') handleSmartSearch();
          }} placeholder='למשל: "מסך לאייפון 14" או "סוללה ל-15 פרו"' className="pr-10 text-right h-12 text-base rounded-xl" dir="rtl" disabled={isLoading} />
          </div>
          <Button onClick={handleSmartSearch} disabled={isLoading || !query.trim()} className="h-12 px-4 rounded-xl gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">חפש</span>
          </Button>
        </div>
      </div>

      {/* AI Results */}
      {showResults && result && <Card className="p-4 animate-fade-in border-primary/20 bg-primary/5">
          <div className="space-y-3">
            {/* Suggestion text */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">{result.suggestion}</p>
            </div>

            {/* Model found */}
            {matchedModel && <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-muted-foreground">דגם:</span>
                <span className="font-semibold">{matchedModel.name}</span>
              </div>}

            {/* Repair options */}
            {matchedRepairs.length > 0 ? <div className="space-y-2">
                {matchedRepairs.map(repair => {
            if (!repair) return null;
            let price = 0;
            if (matchedModel) {
              if (repair.name.includes('מסך מקורי')) price = matchedModel.original_screen_price;else if (repair.name.includes('מסך תואם')) price = matchedModel.compatible_screen_price;else if (repair.name.includes('סוללה')) price = matchedModel.battery_price;
            }
            return <Button key={repair.id} variant="outline" className="w-full justify-between h-auto py-3 px-4 rounded-xl" onClick={() => handleSelectOption(repair.name)}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">{repair.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {price > 0 && <span className="text-primary font-bold">₪{price}</span>}
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Button>;
          })}
              </div> : matchedModel ? <Button variant="outline" className="w-full justify-center h-auto py-3 rounded-xl" onClick={handleSelectModelOnly}>
                <span>בחר תיקון ל-{matchedModel.name}</span>
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button> : null}

            {!matchedModel && !matchedRepairs.length && <p className="text-sm text-muted-foreground text-center">
                לא מצאתי התאמה, בחר ידנית מהרשימה למטה 👇
              </p>}
          </div>
        </Card>}

      <div className="text-center">
        <p className="text-sm text-secondary-foreground">
          ✨ כתבו מה תרצו לתקן והמערכת תזהה אוטומטית, או בחרו ידנית מהרשימה
        </p>
      </div>
    </div>;
};
export default SmartRepairInput;