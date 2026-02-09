import { useState } from 'react';
import { ChevronDown, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IphoneModel {
  id: string;
  name: string;
  original_screen_price: number;
  compatible_screen_price: number;
  battery_price: number;
}

interface ModelPickerProps {
  models: IphoneModel[];
  selectedModel: IphoneModel | null;
  onSelect: (model: IphoneModel) => void;
  onConfirm: (model: IphoneModel) => void;
}

const getSeriesKey = (name: string): string => {
  if (name.includes('סמסונג')) return 'Samsung';
  const match = name.match(/iPhone\s+(X[SR]?|8|11|12|13|14|15|16)/);
  if (!match) return 'Other';
  const base = match[1];
  if (['X', 'XS', 'XR'].includes(base)) return 'iPhone X';
  return `iPhone ${base}`;
};

const seriesOrder = [
  'iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone 13',
  'iPhone 12', 'iPhone 11', 'iPhone X', 'iPhone 8', 'Samsung', 'Other'
];

const getShortName = (name: string): string => {
  // Strip "iPhone XX " prefix to show just variant
  return name
    .replace(/^iPhone\s+\d+\s*/, '')
    .replace(/^iPhone\s+X[SR]?\s*/, '')
    .replace(/^iPhone\s+8\s*/, '')
    .replace(/^סמסונג גלקסי\s*/, '')
    .trim() || 'רגיל';
};

const ModelPicker = ({ models, selectedModel, onSelect, onConfirm }: ModelPickerProps) => {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  // Group models by series
  const grouped = models.reduce<Record<string, IphoneModel[]>>((acc, model) => {
    const key = getSeriesKey(model.name);
    if (!acc[key]) acc[key] = [];
    acc[key].push(model);
    return acc;
  }, {});

  const sortedSeries = seriesOrder.filter(s => grouped[s]?.length);

  return (
    <div className="space-y-2">
      {sortedSeries.map((series) => {
        const isExpanded = expandedSeries === series;
        const seriesModels = grouped[series];

        return (
          <div key={series} className="border border-border rounded-2xl overflow-hidden transition-all">
            {/* Series header */}
            <button
              onClick={() => setExpandedSeries(isExpanded ? null : series)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-base">{series}</span>
                <span className="text-xs text-muted-foreground">({seriesModels.length})</span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </button>

            {/* Models */}
            {isExpanded && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-2 animate-fade-in">
                {seriesModels.map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  const shortName = getShortName(model.name);

                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (isSelected) {
                          onConfirm(model);
                        } else {
                          onSelect(model);
                        }
                      }}
                      className={cn(
                        "py-3 px-3 rounded-xl text-center transition-all active:scale-[0.97] border",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      <span className="font-medium text-sm block">{model.name}</span>
                      {isSelected && (
                        <span className="text-[11px] text-primary font-medium mt-1 block animate-fade-in">
                          לחץ שוב לאישור ←
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModelPicker;
