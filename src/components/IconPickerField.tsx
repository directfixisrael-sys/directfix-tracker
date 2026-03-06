import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { REPAIR_ICON_OPTIONS, getRepairIconComponent } from '@/lib/repairIcons';
import { cn } from '@/lib/utils';

interface IconPickerFieldProps {
  value: string;
  onChange: (iconId: string) => void;
}

export default function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? REPAIR_ICON_OPTIONS.filter(opt => opt.label.includes(search) || opt.id.includes(search.toLowerCase()))
    : REPAIR_ICON_OPTIONS;

  const SelectedIcon = getRepairIconComponent(value);
  const selectedLabel = REPAIR_ICON_OPTIONS.find(o => o.id === value)?.label || 'בחר אייקון';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors"
        >
          <SelectedIcon className="w-5 h-5 text-primary" />
          <span className="flex-1 text-right">{selectedLabel}</span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש אייקון..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
            {filtered.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { onChange(id); setOpen(false); setSearch(''); }}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[10px] transition-all',
                  value === id
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-transparent hover:border-primary/50 hover:bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate w-full text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">לא נמצאו תוצאות</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
