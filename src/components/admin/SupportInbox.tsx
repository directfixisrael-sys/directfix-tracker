import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Bot, Headset, Send, Trash2, CheckCheck, Phone, Package } from 'lucide-react';

type Conv = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  verified_order_id: string | null;
  status: 'bot' | 'waiting_human' | 'human' | 'closed';
  handoff_reason: string | null;
  admin_unread: boolean;
  last_message_at: string;
};
type Msg = { id: string; role: 'customer' | 'bot' | 'admin' | 'system'; content: string; tool_calls: any; created_at: string };

const STATUS: Record<Conv['status'], { label: string; cls: string }> = {
  waiting_human: { label: 'ממתין לנציג', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  human: { label: 'בטיפול נציג', cls: 'bg-accent/10 text-accent border-accent/30' },
  bot: { label: 'הבוט עונה', cls: 'bg-success/10 text-success border-success/30' },
  closed: { label: 'סגור', cls: 'bg-muted text-muted-foreground border-border' },
};

const fmt = (d: string) => new Date(d).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

const SupportInbox = () => {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [sending, setSending] = useState(false);

  const loadConvs = useCallback(async () => {
    const { data } = await supabase.from('support_conversations').select('id, customer_name, customer_phone, verified_order_id, status, handoff_reason, admin_unread, last_message_at').order('last_message_at', { ascending: false }).limit(200);
    setConvs((data as Conv[]) || []);
  }, []);

  const loadMsgs = useCallback(async (id: string) => {
    const { data } = await supabase.from('support_messages').select('id, role, content, tool_calls, created_at').eq('conversation_id', id).order('created_at');
    setMsgs((data as Msg[]) || []);
  }, []);

  useEffect(() => {
    loadConvs();
    const t = setInterval(loadConvs, 10000);
    return () => clearInterval(t);
  }, [loadConvs]);

  useEffect(() => {
    if (!selectedId) return;
    loadMsgs(selectedId);
    supabase.from('support_conversations').update({ admin_unread: false }).eq('id', selectedId).then(() => loadConvs());
    const t = setInterval(() => loadMsgs(selectedId), 6000);
    return () => clearInterval(t);
  }, [selectedId, loadMsgs, loadConvs]);

  const visible = useMemo(() => {
    const list = filter === 'open' ? convs.filter((c) => c.status === 'waiting_human' || c.status === 'human' || c.admin_unread) : convs;
    return [...list].sort((a, b) => Number(b.status === 'waiting_human') - Number(a.status === 'waiting_human'));
  }, [convs, filter]);
  const selected = convs.find((c) => c.id === selectedId) || null;

  const setStatus = async (status: Conv['status']) => {
    if (!selected) return;
    const { error } = await supabase.from('support_conversations').update({ status }).eq('id', selected.id);
    if (error) { toast.error('לא הצלחנו לעדכן'); return; }
    if (status === 'bot') await supabase.from('support_messages').insert({ conversation_id: selected.id, role: 'system', content: 'העוזרת החכמה חזרה לענות בשיחה.' });
    if (status === 'closed') await supabase.from('support_messages').insert({ conversation_id: selected.id, role: 'system', content: 'השיחה נסגרה. אפשר לכתוב שוב בכל זמן.' });
    loadConvs(); loadMsgs(selected.id);
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({ conversation_id: selected.id, role: 'admin', content: reply.trim() });
    if (error) { toast.error('ההודעה לא נשלחה'); setSending(false); return; }
    await supabase.from('support_conversations').update({ status: 'human', admin_unread: false, last_message_at: new Date().toISOString() }).eq('id', selected.id);
    setReply('');
    setSending(false);
    loadMsgs(selected.id); loadConvs();
  };

  const remove = async () => {
    if (!selected || !confirm('למחוק את השיחה לצמיתות?')) return;
    await supabase.from('support_conversations').delete().eq('id', selected.id);
    setSelectedId(null); setMsgs([]); loadConvs();
  };

  const waPhone = selected?.customer_phone ? `972${selected.customer_phone.replace(/\D/g, '').replace(/^0/, '')}` : null;

  return (
    <div dir="rtl" className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="p-3 space-y-2 max-h-[75vh] overflow-y-auto">
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant={filter === 'open' ? 'default' : 'outline'} onClick={() => setFilter('open')}>דורש טיפול</Button>
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>כל השיחות</Button>
          <Button size="sm" variant="ghost" asChild className="mr-auto">
            <a href="/chat-preview" target="_blank" rel="noopener noreferrer">צפייה בצ'אט</a>
          </Button>
        </div>
        {visible.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">אין שיחות {filter === 'open' ? 'שממתינות לך' : 'עדיין'}</p>}
        {visible.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={cn('w-full text-right rounded-xl border p-3 transition-colors', selectedId === c.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm truncate">{c.customer_name || 'אורח'}</span>
              {c.admin_unread && <span className="w-2.5 h-2.5 rounded-full bg-destructive flex-shrink-0" aria-label="הודעה חדשה" />}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className={cn('text-[11px] font-bold rounded-full border px-2 py-0.5', STATUS[c.status].cls)}>{STATUS[c.status].label}</span>
              <span className="text-[11px] text-muted-foreground">{fmt(c.last_message_at)}</span>
            </div>
            {c.handoff_reason && c.status === 'waiting_human' && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.handoff_reason}</p>}
          </button>
        ))}
      </Card>

      <Card className="p-0 flex flex-col min-h-[60vh] max-h-[75vh]">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-8">בחרו שיחה מהרשימה</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold">{selected.customer_name || 'אורח'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {selected.customer_phone && <span dir="ltr">{selected.customer_phone}</span>}
                  {selected.verified_order_id && <span className="flex items-center gap-1 text-success"><Package className="w-3 h-3" />הזמנה אומתה</span>}
                </p>
              </div>
              {waPhone && (
                <Button size="sm" variant="outline" asChild>
                  <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"><Phone className="w-4 h-4 ml-1" />ווטסאפ</a>
                </Button>
              )}
              {selected.status !== 'bot' && <Button size="sm" variant="outline" onClick={() => setStatus('bot')}><Bot className="w-4 h-4 ml-1" />החזרה לבוט</Button>}
              {selected.status !== 'closed' && <Button size="sm" variant="outline" onClick={() => setStatus('closed')}><CheckCheck className="w-4 h-4 ml-1" />סגירה</Button>}
              <Button size="sm" variant="ghost" onClick={remove} aria-label="מחיקת שיחה"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m) => {
                if (m.role === 'system') return <p key={m.id} className="text-center text-xs text-muted-foreground">{m.content}</p>;
                const mine = m.role === 'admin';
                const bot = m.role === 'bot';
                return (
                  <div key={m.id} className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'customer' ? 'mr-0 ml-auto bg-muted' : mine ? 'mr-auto ml-0 bg-primary text-primary-foreground' : 'mr-auto ml-0 border border-border')}>
                    <p className="text-[11px] font-bold opacity-70 mb-0.5 flex items-center gap-1">
                      {m.role === 'customer' ? 'לקוח' : bot ? <><Bot className="w-3 h-3" />בוט</> : <><Headset className="w-3 h-3" />אתה</>}
                      <span className="font-normal">· {fmt(m.created_at)}</span>
                    </p>
                    {Array.isArray(m.tool_calls) && m.tool_calls.length > 0 && (
                      <p className="text-[11px] opacity-70 mb-1">כלים: {m.tool_calls.map((t: any) => t.name).join(', ')}</p>
                    )}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border p-3 flex gap-2 items-end">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder="כתבו תשובה ללקוח... (הבוט מפסיק לענות כשאתם עונים)"
                className="min-h-[48px] max-h-40 text-sm"
              />
              <Button onClick={sendReply} disabled={!reply.trim() || sending} size="icon" aria-label="שליחת תשובה"><Send className="w-4 h-4" /></Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SupportInbox;
