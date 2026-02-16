import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presetRanges = [
  {
    label: 'היום',
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'אתמול',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: 'שבוע אחרון',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: 'חודש אחרון',
    getValue: () => ({
      from: startOfDay(subMonths(new Date(), 1)),
      to: endOfDay(new Date()),
    }),
  },
];

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRange, setCustomRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue();
    onChange({
      ...range,
      label: preset.label,
    });
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!customRange.from || (customRange.from && customRange.to)) {
      setCustomRange({ from: date, to: undefined });
    } else {
      if (date && date < customRange.from) {
        setCustomRange({ from: date, to: customRange.from });
      } else {
        setCustomRange({ from: customRange.from, to: date });
      }
    }
  };

  const applyCustomRange = () => {
    if (customRange.from && customRange.to) {
      onChange({
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
        label: `${format(customRange.from, 'dd/MM', { locale: he })} - ${format(customRange.to, 'dd/MM', { locale: he })}`,
      });
      setIsOpen(false);
      setIsCustomMode(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1.5 min-w-[120px] text-xs sm:text-sm">
          <CalendarIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{value.label}</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {!isCustomMode ? (
          <div className="p-2 space-y-1">
            {presetRanges.map((preset) => (
              <Button
                key={preset.label}
                variant={value.label === preset.label ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setIsCustomMode(true);
                setCustomRange({ from: undefined, to: undefined });
              }}
            >
              תאריך מותאם...
            </Button>
          </div>
        ) : (
          <div className="p-3">
            <div className="mb-3 text-sm text-muted-foreground text-center">
              {customRange.from ? (
                customRange.to ? (
                  `${format(customRange.from, 'dd/MM/yyyy', { locale: he })} - ${format(customRange.to, 'dd/MM/yyyy', { locale: he })}`
                ) : (
                  `מ-${format(customRange.from, 'dd/MM/yyyy', { locale: he })} - בחר תאריך סיום`
                )
              ) : (
                'בחר תאריך התחלה'
              )}
            </div>
            <Calendar
              mode="single"
              selected={customRange.to || customRange.from}
              onSelect={handleCustomDateSelect}
              locale={he}
              modifiers={{
                selected: (date) => 
                  (customRange.from && date.getTime() === customRange.from.getTime()) ||
                  (customRange.to && date.getTime() === customRange.to.getTime()),
                inRange: (date) =>
                  customRange.from && customRange.to
                    ? date > customRange.from && date < customRange.to
                    : false,
              }}
              modifiersStyles={{
                inRange: { backgroundColor: 'hsl(var(--primary) / 0.1)' },
              }}
              className="rounded-md border"
            />
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCustomMode(false);
                  setCustomRange({ from: undefined, to: undefined });
                }}
              >
                ביטול
              </Button>
              <Button
                className="flex-1"
                disabled={!customRange.from || !customRange.to}
                onClick={applyCustomRange}
              >
                החל
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
