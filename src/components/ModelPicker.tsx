import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IphoneModel {
  id: string;
  name: string;
  original_screen_price: number;
  compatible_screen_price: number;
  battery_price: number;
  back_glass_price: number;
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
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const modelsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSeries && modelsListRef.current) {
      setTimeout(() => {
        modelsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeSeries]);

  const grouped = useMemo(() => {
    return models.reduce<Record<string, IphoneModel[]>>((acc, model) => {
      const key = getSeriesKey(model.name);
      if (!acc[key]) acc[key] = [];
      acc[key].push(model);
      return acc;
    }, {});
  }, [models]);

  const sortedSeries = seriesOrder.filter(s => grouped[s]?.length);

  return (
    <div className="space-y-3" role="region" aria-label="בחירת דגם מכשיר">
      {!activeSeries && (
        <p className="text-center text-muted-foreground text-sm" id="model-picker-hint">
          בחרו סדרה ☝️
        </p>
      )}

      {/* Series chips */}
      <div className="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="סדרות מכשירים">
        {sortedSeries.map(series => (
          <button
            key={series}
            role="tab"
            aria-selected={activeSeries === series}
            aria-controls={`models-${series.replace(/\s/g, '-')}`}
            onClick={() => setActiveSeries(activeSeries === series ? null : series)}
            className={cn(
              "px-4 py-2.5 rounded-full text-sm font-semibold transition-all",
              activeSeries === series
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            {series}
          </button>
        ))}
      </div>

      {/* Models list for active series */}
      {activeSeries && grouped[activeSeries] && (
        <div id={`models-${activeSeries.replace(/\s/g, '-')}`} role="tabpanel" aria-label={`דגמי ${activeSeries}`} className="space-y-1.5 animate-fade-in pt-1">
          {grouped[activeSeries].map(model => (
            <ModelButton
              key={model.id}
              model={model}
              isSelected={selectedModel?.id === model.id}
              onSelect={onSelect}
              onConfirm={onConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ModelButton = ({
  model,
  isSelected,
  onSelect,
  onConfirm,
}: {
  model: IphoneModel;
  isSelected: boolean;
  onSelect: (m: IphoneModel) => void;
  onConfirm: (m: IphoneModel) => void;
}) => (
  <button
    onClick={() => isSelected ? onConfirm(model) : onSelect(model)}
    aria-label={isSelected ? `אישור בחירת ${model.name}` : `בחר דגם ${model.name}`}
    aria-pressed={isSelected}
    className={cn(
      "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98]",
      isSelected
        ? "bg-primary text-primary-foreground shadow-md"
        : "bg-card border border-border hover:border-primary/40 hover:bg-primary/5"
    )}
  >
    <span className={cn("font-semibold text-sm", isSelected && "text-primary-foreground")}>
      {model.name}
    </span>
    {isSelected ? (
      <span className="text-xs opacity-90 flex items-center gap-1">
        לחץ לאישור
        <ChevronLeft className="w-3.5 h-3.5" />
      </span>
    ) : (
      <ChevronLeft className="w-4 h-4 text-muted-foreground" />
    )}
  </button>
);

export default ModelPicker;
