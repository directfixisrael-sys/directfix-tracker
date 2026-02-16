import { useState, useMemo } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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
  const [search, setSearch] = useState('');
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return models.reduce<Record<string, IphoneModel[]>>((acc, model) => {
      const key = getSeriesKey(model.name);
      if (!acc[key]) acc[key] = [];
      acc[key].push(model);
      return acc;
    }, {});
  }, [models]);

  const sortedSeries = seriesOrder.filter(s => grouped[s]?.length);

  // If searching, show flat filtered list
  const filteredModels = useMemo(() => {
    if (!search.trim()) return null;
    return models.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [models, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חפש דגם..."
          className="pr-10 h-12 rounded-2xl bg-muted/50 border-border text-right"
          dir="rtl"
        />
      </div>

      {/* Search results */}
      {filteredModels ? (
        <div className="space-y-1.5">
          {filteredModels.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">לא נמצאו דגמים</p>
          ) : (
            filteredModels.map(model => (
              <ModelButton
                key={model.id}
                model={model}
                isSelected={selectedModel?.id === model.id}
                onSelect={onSelect}
                onConfirm={onConfirm}
              />
            ))
          )}
        </div>
      ) : (
        /* Series chips + expanded list */
        <div className="space-y-3">
          {/* Series chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {sortedSeries.map(series => (
              <button
                key={series}
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
            <div className="space-y-1.5 animate-fade-in pt-1">
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

          {!activeSeries && (
            <p className="text-center text-muted-foreground text-sm py-4">
              בחרו סדרה או חפשו דגם ☝️
            </p>
          )}
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
