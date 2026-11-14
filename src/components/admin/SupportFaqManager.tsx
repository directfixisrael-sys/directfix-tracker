import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Faq = { id: string; question: string; answer: string; is_active: boolean; sort_order: number };

const MAX_Q = 200;
const MAX_A = 2000;

function FaqForm({ initial, onSave, onCancel, saving }: { initial?: Pick<Faq, 'question' | 'answer'>; onSave: (q: string, a: string) => void; onCancel: () => void; saving: boolean }) {
  const [q, setQ] = useState(initial?.question || '');
  const [a, setA] = useState(initial?.answer || '');
  const valid = q.trim().length >= 2 && a.trim().length >= 2;
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-bold" htmlFor="faq-q">השאלה (כך היא תופיע ללקוח ככפתור)</label>
        <Input id="faq-q" value={q} maxLength={MAX_Q} onChange={(e) => setQ(e.target.value)} placeholder="לדוגמה: אפשר לשלם בביט?" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-bold" htmlFor="faq-a">התשובה</label>
        <Textarea id="faq-a" value={a} maxLength={MAX_A} rows={4} onChange={(e) => setA(e.target.value)} placeholder="מה העוזרת תענה ללקוח" />
        <p className="text-xs text-muted-foreground">העוזרת עונה לפי התשובה הזו, גם כשהלקוח שואל במילים אחרות.</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={!valid || saving} onClick={() => onSave(q.trim(), a.trim())} className="gap-1.5"><Check className="w-4 h-4" />שמירה</Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="gap-1.5"><X className="w-4 h-4" />ביטול</Button>
      </div>
    </div>
  );
}

const SupportFaqManager = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('support_faqs').select('id, question, answer, is_active, sort_order').order('sort_order').order('created_at');
    if (error) toast.error('לא הצלחנו לטעון את השאלות');
    setFaqs((data as Faq[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (question: string, answer: string) => {
    setSaving(true);
    const sort_order = (faqs.reduce((m, f) => Math.max(m, f.sort_order), 0) || 0) + 1;
    const { error } = await supabase.from('support_faqs').insert({ question, answer, sort_order });
    setSaving(false);
    if (error) { toast.error('השאלה לא נשמרה'); return; }
    toast.success('השאלה נוספה לצ\'אט');
    setAdding(false); load();
  };

  const update = async (id: string, patch: Partial<Faq>) => {
    setSaving(true);
    const { error } = await supabase.from('support_faqs').update(patch).eq('id', id);
    setSaving(false);
    if (error) { toast.error('השינוי לא נשמר'); return false; }
    load();
    return true;
  };

  const remove = async (f: Faq) => {
    if (!confirm(`למחוק את השאלה "${f.question}"?`)) return;
    const { error } = await supabase.from('support_faqs').delete().eq('id', f.id);
    if (error) { toast.error('לא הצלחנו למחוק'); return; }
    toast.success('השאלה נמחקה');
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const other = faqs[index + dir];
    const cur = faqs[index];
    if (!other) return;
    const [a, b] = await Promise.all([
      supabase.from('support_faqs').update({ sort_order: index + dir + 1 }).eq('id', cur.id),
      supabase.from('support_faqs').update({ sort_order: index + 1 }).eq('id', other.id),
    ]);
    if (a.error || b.error) toast.error('הסדר לא נשמר');
    load();
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-lg">שאלות ותשובות בצ'אט</h3>
          <p className="text-sm text-muted-foreground">השאלות המוצגות מופיעות ללקוח ככפתורים אחרי ההזמנה, לפי הסדר כאן.</p>
        </div>
        {!adding && <Button onClick={() => { setAdding(true); setEditingId(null); }} className="gap-1.5"><Plus className="w-4 h-4" />הוספת שאלה</Button>}
      </div>

      {adding && (
        <Card className="p-4 border-primary/40">
          <FaqForm onSave={add} onCancel={() => setAdding(false)} saving={saving} />
        </Card>
      )}

      {loading && <p className="text-sm text-muted-foreground">טוען...</p>}
      {!loading && faqs.length === 0 && !adding && <Card className="p-6 text-center text-sm text-muted-foreground">אין עדיין שאלות. הוסיפו שאלה ראשונה.</Card>}

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <Card key={f.id} className={cn('p-4', !f.is_active && 'opacity-60')}>
            {editingId === f.id ? (
              <FaqForm initial={f} saving={saving} onCancel={() => setEditingId(null)} onSave={async (question, answer) => { if (await update(f.id, { question, answer })) { setEditingId(null); toast.success('נשמר'); } }} />
            ) : (
              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => move(i, -1)} aria-label="הזזה למעלה"><ArrowUp className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === faqs.length - 1} onClick={() => move(i, 1)} aria-label="הזזה למטה"><ArrowDown className="w-4 h-4" /></Button>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold">{f.question}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.answer}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium">
                    {f.is_active ? 'מוצג' : 'מוסתר'}
                    <Switch checked={f.is_active} onCheckedChange={(v) => update(f.id, { is_active: v })} aria-label={f.is_active ? 'הסתרת השאלה' : 'הצגת השאלה'} />
                  </label>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(f.id); setAdding(false); }} aria-label="עריכה"><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(f)} aria-label="מחיקה"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupportFaqManager;
