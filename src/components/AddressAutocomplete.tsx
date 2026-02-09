import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Prediction {
  description: string;
  place_id: string;
}

const AddressAutocomplete = ({ value, onChange, placeholder = 'עיר, רחוב, מספר בית/דירה', className }: AddressAutocompleteProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionToken] = useState(() => crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
        body: { input, sessionToken },
      });

      if (error) throw error;
      setPredictions(data?.predictions || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setShowDropdown(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={className}
        />
        {isLoading && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full text-right px-3 py-2.5 hover:bg-accent/10 transition-colors flex items-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{prediction.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
