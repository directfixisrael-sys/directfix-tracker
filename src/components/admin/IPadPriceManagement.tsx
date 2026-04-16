import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Tablet, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface IPadModel {
  id: string;
  name: string;
  screen_price: number;
  series: string;
  sort_order: number;
  is_active: boolean;
}

const IPadPriceManagement = () => {
  const [models, setModels] = useState<IPadModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<IPadModel | null>(null);
  const [form, setForm] = useState({ name: '', screen_price: 400, series: 'iPad', sort_order: 0 });

  const fetchModels = async () => {
    const { data } = await supabase.from('ipad_models').select('*').order('sort_order');
    if (data) setModels(data);
    setLoading(false);
  };

  useEffect(() => { fetchModels(); }, []);

  const openAdd = () => {
    setEditModel(null);
    setForm({ name: '', screen_price: 400, series: 'iPad', sort_order: models.length });
    setDialogOpen(true);
  };

  const openEdit = (m: IPadModel) => {
    setEditModel(m);
    setForm({ name: m.name, screen_price: m.screen_price, series: m.series, sort_order: m.sort_order });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('נא להזין שם דגם'); return; }
    
    if (editModel) {
      const { error } = await supabase.from('ipad_models').update({
        name: form.name,
        screen_price: form.screen_price,
        series: form.series,
        sort_order: form.sort_order,
      }).eq('id', editModel.id);
      if (error) { toast.error('שגיאה בעדכון'); return; }
      toast.success('הדגם עודכן');
    } else {
      const { error } = await supabase.from('ipad_models').insert({
        name: form.name,
        screen_price: form.screen_price,
        series: form.series,
        sort_order: form.sort_order,
      });
      if (error) { toast.error('שגיאה בהוספה'); return; }
      toast.success('דגם נוסף');
    }
    setDialogOpen(false);
    fetchModels();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('ipad_models').delete().eq('id', deleteId);
    setDeleteId(null);
    toast.success('הדגם נמחק');
    fetchModels();
  };

  const toggleActive = async (m: IPadModel) => {
    await supabase.from('ipad_models').update({ is_active: !m.is_active }).eq('id', m.id);
    fetchModels();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const grouped = models.reduce<Record<string, IPadModel[]>>((acc, m) => {
    const key = m.series || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tablet className="w-5 h-5" /> ניהול דגמי iPad
        </h2>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> הוספת דגם
        </Button>
      </div>

      {Object.entries(grouped).map(([series, seriesModels]) => (
        <div key={series} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">{series}</h3>
          {seriesModels.map(m => (
            <Card key={m.id} className={`p-4 flex items-center justify-between ${!m.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m)} />
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">מסך: {m.screen_price} ש"ח</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ))}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editModel ? 'עריכת דגם' : 'הוספת דגם חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">שם הדגם</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="iPad דור 11" dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">סדרה</label>
              <Input value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))} placeholder="iPad / iPad Air / iPad Pro" dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">מחיר מסך (ש"ח)</label>
              <Input type="number" value={form.screen_price} onChange={e => setForm(f => ({ ...f, screen_price: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">סדר מיון</label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="w-4 h-4" /> {editModel ? 'עדכן' : 'הוסף'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת דגם</AlertDialogTitle>
            <AlertDialogDescription>האם למחוק את הדגם? פעולה זו לא ניתנת לביטול.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IPadPriceManagement;
