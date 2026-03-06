import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface IphoneModel {
  id: string;
  name: string;
  original_screen_price: number;
  compatible_screen_price: number;
  battery_price: number;
  back_glass_price: number;
  charging_price?: number;
  series?: string;
}

interface ModelPickerProps {
  models: IphoneModel[];
  selectedModel: IphoneModel | null;
  onSelect: (model: IphoneModel) => void;
  onConfirm: (model: IphoneModel) => void;
}

const INITIAL_VISIBLE = 5;

const ModelPicker = ({ models, selectedModel, onSelect, onConfirm }: ModelPickerProps) => {
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
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
      const key = model.series || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(model);
      return acc;
    }, {});
  }, [models]);

  const sortedSeries = useMemo(() => {
    let savedOrder: string[] = [];
    try {
      const saved = localStorage.getItem('series_order');
      if (saved) savedOrder = JSON.parse(saved);
    } catch {}

    const defaultOrder = [
      'iPhone 17', 'iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone 13',
      'iPhone 12', 'iPhone 11', 'iPhone X', 'iPhone 8', 'Samsung', 'Other'
    ];
    
    const allSeries = Object.keys(grouped);
    
    if (savedOrder.length > 0) {
      const ordered = savedOrder.filter(s => allSeries.includes(s));
      const extra = allSeries.filter(s => !savedOrder.includes(s)).sort();
      return [...ordered, ...extra];
    }
    
    const ordered = defaultOrder.filter(s => allSeries.includes(s));
    const extra = allSeries.filter(s => !defaultOrder.includes(s)).sort();
    return [...ordered, ...extra];
  }, [grouped]);

  const getFilteredModels = (series: string) => {
    const seriesModels = grouped[series] || [];
    const query = (searchQueries[series] || '').trim().toLowerCase();
    if (!query) return seriesModels;
    return seriesModels.filter(m => m.name.toLowerCase().includes(query));
  };

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
            onClick={() => {
              setActiveSeries(activeSeries === series ? null : series);
              setExpandedSeries(prev => { const n = new Set(prev); n.delete(series); return n; });
              setSearchQueries(prev => ({ ...prev, [series]: '' }));
            }}
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
      {activeSeries && grouped[activeSeries] && (() => {
        const filteredModels = getFilteredModels(activeSeries);
        const totalCount = grouped[activeSeries].length;
        const hasMany = totalCount > INITIAL_VISIBLE;
        const isExpanded = expandedSeries.has(activeSeries);
        const isSearching = (searchQueries[activeSeries] || '').trim().length > 0;
        const visibleModels = (isExpanded || isSearching) ? filteredModels : filteredModels.slice(0, INITIAL_VISIBLE);

        return (
          <div ref={modelsListRef} id={`models-${activeSeries.replace(/\s/g, '-')}`} role="tabpanel" aria-label={`דגמי ${activeSeries}`} className="space-y-2 animate-fade-in pt-1">
            
            {/* Search input for series with many models */}
            {hasMany && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQueries[activeSeries] || ''}
                  onChange={e => setSearchQueries(prev => ({ ...prev, [activeSeries!]: e.target.value }))}
                  placeholder="חפשו דגם, למשל A16..."
                  className="pr-9 text-right h-10 rounded-xl bg-muted/50 border-border text-sm"
                  dir="rtl"
                />
              </div>
            )}

            <div className="space-y-1.5">
              {visibleModels.map(model => (
                <ModelButton
                  key={model.id}
                  model={model}
                  isSelected={selectedModel?.id === model.id}
                  onSelect={onSelect}
                  onConfirm={onConfirm}
                />
              ))}
            </div>

            {/* Show more button with fade */}
            {hasMany && !isExpanded && !isSearching && filteredModels.length > INITIAL_VISIBLE && (
              <div className="relative">
                {/* Fade overlay */}
                <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                <button
                  onClick={() => setExpandedSeries(prev => new Set(prev).add(activeSeries!))}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <span>עוד {filteredModels.length - INITIAL_VISIBLE} דגמים</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {isSearching && filteredModels.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-3">
                לא נמצאו דגמים תואמים 🔍
              </p>
            )}
          </div>
        );
      })()}
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
