import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { PricePromotion, isPromoLive, promoDaysLeft } from '@/lib/pricePromotions';

interface Props {
  models: { id: string; name: string }[];
  repairTypes: { id: string; name: string }[];
}

const DEFAULT_INFO =
  'מבצע מיוחד לזמן מוגבל, בתוקף להזמנות שנקבעות דרך המערכת בלבד ובכפוף לזמינות טכנאי ומלאי.';

const emptyForm = {
  repair_type_id: '',
  model_id: 'all',
  mode: 'price' as 'price' | 'percent',
  promo_price: '',
  discount_percent: '',
  badge_text: 'מחיר מיוחד לשבוע בלבד',
  info_text: DEFAULT_INFO,
  starts_at: '',
  ends_at: '',
  is_active: true,
};

const PricePromotionsTab = ({ models, repairTypes }: Props) => {
  const [promos, setPromos] = useState<PricePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [priceMap, setPriceMap] = useState<Record<string, Record<string, number>>>({});

  const load = async () => {
    setIsLoading(true);
    const [{ data, error }, pricesRes] = await Promise.all([
      supabase.from('price_promotions').select('*').order('created_at', { ascending: false }),
      supabase.from('model_repair_prices').select('model_id, repair_type_id, price'),
    ]);
    if (error) toast.error('שגיאה בטעינת המבצעים');
    setPromos((data as PricePromotion[]) || []);
    const map: Record<string, Record<string, number>> = {};
    (pricesRes.data || []).forEach((row: any) => {
      map[row.model_id] = map[row.model_id] || {};
      map[row.model_id][row.repair_type_id] = Number(row.price);
    });
    setPriceMap(map);
    setIsLoading(false);
  };

  /** Regular price for the currently selected repair + model (null when "all models") */
  const basePrice =
    form.repair_type_id && form.model_id !== 'all'
      ? priceMap[form.model_id]?.[form.repair_type_id] ?? null
      : null;

  const previewPrice = (() => {
    if (basePrice == null) return null;
    if (form.mode === 'percent' && Number(form.discount_percent) > 0) {
      return Math.max(0, Math.round(basePrice * (1 - Number(form.discount_percent) / 100)));
    }
    if (form.mode === 'price' && Number(form.promo_price) > 0) return Math.round(Number(form.promo_price));
    return null;
  })();

  useEffect(() => {
    load();
  }, []);


  const openDialog = (promo?: PricePromotion) => {
    if (promo) {
      setEditingId(promo.id);
      setForm({
        repair_type_id: promo.repair_type_id || '',
        model_id: promo.model_id || 'all',
        mode: promo.discount_percent ? 'percent' : 'price',
        promo_price: promo.promo_price ? String(promo.promo_price) : '',
        discount_percent: promo.discount_percent ? String(promo.discount_percent) : '',
        badge_text: promo.badge_text,
        info_text: promo.info_text,
        starts_at: promo.starts_at || '',
        ends_at: promo.ends_at || '',
        is_active: promo.is_active,
      });
    } else {
      setEditingId(null);
      const today = new Date();
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setForm({
        ...emptyForm,
        starts_at: today.toISOString().split('T')[0],
        ends_at: weekLater.toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.repair_type_id) {
      toast.error('יש לבחור סוג תיקון');
      return;
    }
    const payload = {
      repair_type_id: form.repair_type_id,
      model_id: form.model_id === 'all' ? null : form.model_id,
      promo_price: form.mode === 'price' && form.promo_price ? Number(form.promo_price) : null,
      discount_percent: form.mode === 'percent' && form.discount_percent ? Number(form.discount_percent) : null,
      badge_text: form.badge_text || 'מחיר מיוחד',
      info_text: form.info_text || DEFAULT_INFO,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active,
    };
    if (!payload.promo_price && !payload.discount_percent) {
      toast.error('יש להזין מחיר מבצע או אחוז הנחה');
      return;
    }
    const { error } = editingId
      ? await supabase.from('price_promotions').update(payload).eq('id', editingId)
      : await supabase.from('price_promotions').insert(payload);
    if (error) {
      console.error(error);
      toast.error('שגיאה בשמירת המבצע');
      return;
    }
    toast.success(editingId ? 'המבצע עודכן' : 'המבצע נוצר');
    setIsDialogOpen(false);
    load();
  };

  const toggleActive = async (promo: PricePromotion) => {
    await supabase.from('price_promotions').update({ is_active: !promo.is_active }).eq('id', promo.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק את המבצע?')) return;
    await supabase.from('price_promotions').delete().eq('id', id);
    toast.success('המבצע נמחק');
    load();
  };

  const repairName = (id: string | null) => repairTypes.find(r => r.id === id)?.name || 'תיקון';
  const modelName = (id: string | null) => (id ? models.find(m => m.id === id)?.name || 'דגם' : 'כל הדגמים');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          מבצעים לזמן מוגבל שמוצגים ליד מחיר התיקון עם תגית והסבר ללקוח
        </p>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          מבצע חדש
        </Button>
      </div>

      {promos.length === 0 ? (
        <Card className="p-8 text-center">
          <Timer className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">אין מבצעי מחיר</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {promos.map(promo => {
            const live = isPromoLive(promo);
            const daysLeft = promoDaysLeft(promo);
            return (
              <Card key={promo.id} className={`p-4 ${live ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {repairName(promo.repair_type_id)} · {modelName(promo.model_id)}
                      </p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {promo.badge_text}
                      </span>
                      {!live && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          לא פעיל כעת
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {promo.discount_percent
                        ? `${promo.discount_percent}% הנחה`
                        : `מחיר מבצע ₪${promo.promo_price}`}
                      {promo.ends_at && ` · עד ${new Date(promo.ends_at).toLocaleDateString('he-IL')}`}
                      {live && daysLeft != null && ` (${daysLeft} ימים)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={promo.is_active} onCheckedChange={() => toggleActive(promo)} />
                    <Button variant="ghost" size="icon" onClick={() => openDialog(promo)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'עריכת מבצע מחיר' : 'מבצע מחיר חדש'}</DialogTitle>
            <DialogDescription>המחיר המוזל יוצג ללקוח עם תגית והסבר</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">סוג תיקון</label>
              <Select
                value={form.repair_type_id}
                onValueChange={v => setForm(p => ({ ...p, repair_type_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder="בחר סוג תיקון" /></SelectTrigger>
                <SelectContent>
                  {repairTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">דגם</label>
              <Select value={form.model_id} onValueChange={v => setForm(p => ({ ...p, model_id: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הדגמים</SelectItem>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">סוג הטבה</label>
              <Select value={form.mode} onValueChange={v => setForm(p => ({ ...p, mode: v as 'price' | 'percent' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">מחיר מבצע קבוע</SelectItem>
                  <SelectItem value="percent">אחוז הנחה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.mode === 'price' ? (
              <div>
                <label className="text-sm font-medium mb-1 block">מחיר מבצע (₪)</label>
                <Input
                  type="number"
                  min="0"
                  value={form.promo_price}
                  onChange={e => setForm(p => ({ ...p, promo_price: e.target.value }))}
                  placeholder="למשל: 449"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">אחוז הנחה (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={form.discount_percent}
                  onChange={e => setForm(p => ({ ...p, discount_percent: e.target.value }))}
                  placeholder="למשל: 15"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">תאריך התחלה</label>
                <Input
                  type="date"
                  value={form.starts_at}
                  onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">תאריך סיום</label>
                <Input
                  type="date"
                  value={form.ends_at}
                  onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">טקסט התגית</label>
              <Input
                value={form.badge_text}
                onChange={e => setForm(p => ({ ...p, badge_text: e.target.value }))}
                placeholder="מחיר מיוחד לשבוע בלבד"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">הסבר בכפתור המידע (i)</label>
              <Textarea
                rows={3}
                value={form.info_text}
                onChange={e => setForm(p => ({ ...p, info_text: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">מבצע פעיל</label>
              <Switch
                checked={form.is_active}
                onCheckedChange={c => setForm(p => ({ ...p, is_active: c }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? 'עדכן' : 'צור מבצע'}</Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricePromotionsTab;
