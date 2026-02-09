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

const ModelPicker = ({ models, selectedModel, onSelect, onConfirm }: ModelPickerProps) => {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const grouped = models.reduce<Record<string, IphoneModel[]>>((acc, model) => {
    const key = getSeriesKey(model.name);
    if (!acc[key]) acc[key] = [];
    acc[key].push(model);
    return acc;
  }, {});

  const sortedSeries = seriesOrder.filter(s => grouped[s]?.length);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {sortedSeries.map((series) => {
          const isExpanded = expandedSeries === series;
          const seriesModels = grouped[series];

          return (
            <div key={series} className={cn(
              isExpanded && "col-span-2"
            )}>
              {/* Series header */}
              <button
                onClick={() => setExpandedSeries(isExpanded ? null : series)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all",
                  isExpanded
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    isExpanded ? "bg-primary/15" : "bg-muted"
                  )}>
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-bold text-sm">{series}</span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} />
              </button>

              {/* Expanded models */}
              {isExpanded && (
                <div className="grid grid-cols-2 gap-2 mt-2 animate-fade-in">
                  {seriesModels.map((model) => {
                    const isSelected = selectedModel?.id === model.id;

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
                          "py-2.5 px-3 rounded-xl text-center transition-all active:scale-[0.97] border",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                        )}
                      >
                        <span className="font-medium text-sm block">{model.name}</span>
                        {isSelected && (
                          <span className="text-[11px] text-primary font-medium mt-0.5 block animate-fade-in">
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
    </div>
  );
};

export default ModelPicker;
