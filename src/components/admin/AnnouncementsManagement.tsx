import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Save, Loader2, Megaphone, AlertTriangle, Info, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  placement: string;
  is_active: boolean;
  bg_color: string;
  created_at: string;
}

const PLACEMENTS = [
  { value: 'header_banner', label: 'באנר עליון (הדר)', icon: '' },
  { value: 'popup', label: 'חלון קופץ (פופאפ)', icon: '' },
  { value: 'toast', label: 'התראה צפה (טוסט)', icon: '' },
];

const COLORS = [
  { value: 'warning', label: 'כתום / אזהרה', className: 'bg-warning text-warning-foreground' },
  { value: 'destructive', label: 'אדום / דחוף', className: 'bg-destructive text-destructive-foreground' },
  { value: 'primary', label: 'כחול / ראשי', className: 'bg-primary text-primary-foreground' },
  { value: 'success', label: 'ירוק / חיובי', className: 'bg-success text-success-foreground' },
];

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    placement: 'header_banner',
    bg_color: 'warning',
    is_active: true,
  });

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAnnouncements(data as any);
    setIsLoading(false);
  };

  const openDialog = (ann?: Announcement) => {
    if (ann) {
      setEditing(ann);
      setForm({ title: ann.title, message: ann.message, placement: ann.placement, bg_color: ann.bg_color, is_active: ann.is_active });
    } else {
      setEditing(null);
      setForm({ title: '', message: '', placement: 'header_banner', bg_color: 'warning', is_active: true });
    }
    setIsDialogOpen(true);
  };

  const save = async () => {
    if (!form.message.trim()) { toast.error('יש להזין תוכן הודעה'); return; }
    try {
      if (editing) {
        await supabase.from('announcements').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
        toast.success('ההודעה עודכנה');
      } else {
        await supabase.from('announcements').insert(form as any);
        toast.success('ההודעה נוספה');
      }
      setIsDialogOpen(false);
      loadAnnouncements();
    } catch { toast.error('שגיאה בשמירה'); }
  };

  const toggleActive = async (ann: Announcement) => {
    await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id);
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_active: !a.is_active } : a));
    toast.success(ann.is_active ? 'ההודעה כובתה' : 'ההודעה הופעלה');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('announcements').delete().eq('id', deleteId);
    setDeleteId(null);
    loadAnnouncements();
    toast.success('ההודעה נמחקה');
  };

  const getPlacementLabel = (p: string) => PLACEMENTS.find(pl => pl.value === p)?.label || p;
  const getPlacementIcon = (p: string) => PLACEMENTS.find(pl => pl.value === p)?.icon || '';
  const getColorInfo = (c: string) => COLORS.find(cl => cl.value === c) || COLORS[0];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">הודעות והתראות</h2>
        <p className="text-muted-foreground text-sm">הוסיפו הודעות שיופיעו ללקוחות - באנרים, פופאפים או התראות</p>
      </div>

      <Button onClick={() => openDialog()} className="gap-2 mb-4">
        <Plus className="w-4 h-4" />
        הוסף הודעה חדשה
      </Button>

      {announcements.length === 0 ? (
        <Card className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">אין הודעות פעילות</p>
          <p className="text-sm text-muted-foreground">הוסיפו הודעה חדשה כדי להציג ללקוחות</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const colorInfo = getColorInfo(ann.bg_color);
            return (
              <Card key={ann.id} className={`p-4 transition-all ${!ann.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${colorInfo.className}`}>
                    {getPlacementIcon(ann.placement)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.title && <p className="font-semibold truncate">{ann.title}</p>}
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {getPlacementLabel(ann.placement)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={ann.is_active} onCheckedChange={() => toggleActive(ann)} />
                    <Button variant="ghost" size="icon" onClick={() => openDialog(ann)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(ann.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'עריכת הודעה' : 'הודעה חדשה'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">כותרת (אופציונלי)</label>
              <Input placeholder="למשל: הודעה חשובה" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">תוכן ההודעה *</label>
              <Textarea placeholder="הטקסט שיוצג ללקוחות..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">מיקום הצגה</label>
              <Select value={form.placement} onValueChange={v => setForm({ ...form, placement: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLACEMENTS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">{p.icon} {p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">צבע</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, bg_color: c.value })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${c.className} ${
                      form.bg_color === c.value ? 'ring-2 ring-offset-2 ring-foreground/30' : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">הצג ללקוחות</span>
              <Switch checked={form.is_active} onCheckedChange={checked => setForm({ ...form, is_active: checked })} />
            </div>

            {/* Preview */}
            {form.message && (
              <div>
                <label className="block text-sm font-medium mb-2">תצוגה מקדימה</label>
                <div className={`p-3 rounded-lg text-center text-sm font-medium ${getColorInfo(form.bg_color).className}`}>
                  {form.title && <strong>{form.title}: </strong>}
                  {form.message}
                </div>
              </div>
            )}

            <Button onClick={save} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {editing ? 'שמור שינויים' : 'הוסף הודעה'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הודעה</AlertDialogTitle>
            <AlertDialogDescription>האם למחוק את ההודעה? פעולה זו בלתי הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnnouncementsManagement;
