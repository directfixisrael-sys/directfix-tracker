import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { REPAIR_ICON_OPTIONS } from '@/lib/repairIcons';
import { cn } from '@/lib/utils';

interface IconPickerFieldProps {
  value: string;
  onChange: (iconId: string) => void;
}

const INITIAL_VISIBLE = 8;

export default function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = search
    ? REPAIR_ICON_OPTIONS.filter(opt => opt.label.includes(search) || opt.id.includes(search.toLowerCase()))
    : REPAIR_ICON_OPTIONS;

  const visible = (expanded || search) ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hasMore = !search && !expanded && filtered.length > INITIAL_VISIBLE;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש אייקון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 h-9 text-sm"
        />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {visible.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
              value === id
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-primary/50 hover:bg-muted text-muted-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="truncate w-full text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-sm text-primary hover:underline py-1"
        >
          עוד {filtered.length - INITIAL_VISIBLE} אייקונים...
        </button>
      )}
      {expanded && !search && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full text-sm text-muted-foreground hover:underline py-1"
        >
          הצג פחות
        </button>
      )}
    </div>
  );
}
