import { useEffect, useState } from 'react';
import { Plus, Trash2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  text: string;
  color: string;
  updated_at: number;
}

const COLORS = [
  'bg-yellow-200 dark:bg-yellow-300/90 text-yellow-950',
  'bg-pink-200 dark:bg-pink-300/90 text-pink-950',
  'bg-blue-200 dark:bg-blue-300/90 text-blue-950',
  'bg-green-200 dark:bg-green-300/90 text-green-950',
  'bg-purple-200 dark:bg-purple-300/90 text-purple-950',
  'bg-orange-200 dark:bg-orange-300/90 text-orange-950',
];

const STORAGE_KEY = 'admin_sticky_notes_v1';

const StickyNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Note[]) => {
    setNotes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      text: '',
      color: COLORS[notes.length % COLORS.length],
      updated_at: Date.now(),
    };
    persist([newNote, ...notes]);
  };

  const updateNote = (id: string, text: string) => {
    persist(notes.map(n => n.id === id ? { ...n, text, updated_at: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    persist(notes.filter(n => n.id !== id));
  };

  const cycleColor = (id: string) => {
    persist(notes.map(n => {
      if (n.id !== id) return n;
      const idx = COLORS.indexOf(n.color);
      const next = COLORS[(idx + 1) % COLORS.length];
      return { ...n, color: next };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">פתקים</h3>
          <p className="text-xs text-muted-foreground">
            {notes.length > 0 ? `${notes.length} פתקים` : 'אין פתקים עדיין'}
          </p>
        </div>
        <Button onClick={addNote} className="gap-2" size="sm">
          <Plus className="w-4 h-4" />
          פתק חדש
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <StickyNote className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-3">צור פתק ראשון לרישום מהיר</p>
          <Button onClick={addNote} variant="outline" size="sm">
            <Plus className="w-4 h-4 ml-1" />
            פתק חדש
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => (
            <div
              key={note.id}
              className={`${note.color} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all -rotate-[0.5deg] hover:rotate-0 relative group`}
              style={{ minHeight: '180px' }}
            >
              <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => cycleColor(note.id)}
                  className="w-5 h-5 rounded-full border-2 border-current/30 hover:scale-110 transition-transform"
                  title="שנה צבע"
                />
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 rounded-md hover:bg-black/10 transition-colors"
                  title="מחק"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={e => updateNote(note.id, e.target.value)}
                placeholder="כתוב משהו..."
                className="w-full bg-transparent border-0 outline-none resize-none text-base leading-relaxed placeholder:text-current/40 font-medium"
                style={{ minHeight: '120px', fontFamily: "'Caveat', 'Open Sans Hebrew', cursive" }}
                dir="rtl"
              />
              <div className="text-[10px] opacity-50 absolute bottom-2 left-3">
                {new Date(note.updated_at).toLocaleDateString('he-IL', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StickyNotes;
