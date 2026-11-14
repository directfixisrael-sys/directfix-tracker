import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ChatStatus } from 'ai';
import { X, MessageCircle, UserRound, Package, Tag, Headset, RotateCcw } from 'lucide-react';
import shiraAvatar from '@/assets/shira-avatar.png';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit, PromptInputTools, type PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Tool, ToolHeader, ToolContent, ToolOutput } from '@/components/ai-elements/tool';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  fetchHistory, getSession, requestHuman, sendMessage, clearSession, setChatContext,
  type SupportMessage, type SupportStatus, type SupportTool,
} from '@/lib/supportChat';

// Questions customers ask after placing an order
const SUGGESTIONS = ['מתי הטכנאי מגיע?', 'איך משלמים בסוף התיקון?', 'מה להכין לפני שהטכנאי מגיע?', 'אפשר לשנות את מועד ההגעה?', 'כמה זמן לוקח התיקון?', 'מה האחריות על התיקון?'];
const TOOL_TITLES: Record<string, string> = {
  lookup_order: 'בדיקת הזמנה',
  get_repair_prices: 'בדיקת מחירון',
  handoff_to_human: 'העברה לנציג',
};

const statusLine: Record<SupportStatus, string> = {
  bot: 'עונה מיד, 24/7',
  waiting_human: 'ממתינים לנציג',
  human: 'נציג בשיחה',
  closed: 'השיחה נסגרה',
};

function ToolResult({ tool }: { tool: SupportTool }) {
  const out = tool.output || {};
  if (tool.name === 'lookup_order') {
    if (!out.found) return <p className="text-sm text-muted-foreground">{out.error || 'לא נמצאה הזמנה'}</p>;
    return (
      <div className="rounded-xl border border-border bg-card p-3 text-sm space-y-1">
        <p className="font-bold flex items-center gap-2"><Package className="w-4 h-4 text-primary" aria-hidden="true" />הזמנה #{out.order_number}</p>
        <p>{out.status}</p>
        <p className="text-muted-foreground">{out.device} · {out.repair}</p>
        {out.estimated_arrival && <p className="text-muted-foreground">הגעה משוערת: {out.estimated_arrival}</p>}
      </div>
    );
  }
  if (tool.name === 'get_repair_prices') {
    const models: { model: string; repairs: { repair: string; price: number }[] }[] = out.models || [];
    if (!models.length) return <p className="text-sm text-muted-foreground">{out.note || 'הדגם לא נמצא'}</p>;
    return (
      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.model} className="rounded-xl border border-border bg-card p-3 text-sm">
            <p className="font-bold mb-1 flex items-center gap-2"><Tag className="w-4 h-4 text-primary" aria-hidden="true" />{m.model}</p>
            <ul className="space-y-0.5">
              {m.repairs.map((r) => (
                <li key={r.repair} className="flex justify-between gap-3"><span>{r.repair}</span><span className="font-semibold">₪{r.price}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  if (tool.name === 'handoff_to_human') return <p className="text-sm text-muted-foreground">השיחה הועברה לנציג מהצוות</p>;
  return null;
}

function ToolCard({ tool }: { tool: SupportTool }) {
  return (
    <Tool defaultOpen={false} className="mb-0 w-full">
      <ToolHeader type="dynamic-tool" toolName={tool.name} title={TOOL_TITLES[tool.name] || tool.name} state={tool.state} />
      <ToolContent>
        <ToolOutput className="p-3" output={<ToolResult tool={tool} />} errorText={undefined} />
      </ToolContent>
    </Tool>
  );
}

interface SupportChatProps { orderNumber?: number | null; name?: string; phone?: string }

const SupportChat = ({ orderNumber, name, phone }: SupportChatProps) => {
  useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [convStatus, setConvStatus] = useState<SupportStatus>('bot');
  const [chatStatus, setChatStatus] = useState<ChatStatus>('ready');
  const [streamText, setStreamText] = useState('');
  const [streamTools, setStreamTools] = useState<SupportTool[]>([]);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(false);
  const busy = chatStatus === 'submitted' || chatStatus === 'streaming';
  const panelRef = useRef<HTMLDivElement>(null);
  const focusInput = () => panelRef.current?.querySelector('textarea')?.focus();
  const lastAdminCount = useRef(0);

  const loadHistory = useCallback(async () => {
    if (!getSession()) return;
    try {
      const h = await fetchHistory();
      if (!h) return;
      setMessages(h.messages);
      setConvStatus(h.status);
      const adminCount = h.messages.filter((m) => m.role === 'admin').length;
      if (adminCount > lastAdminCount.current && !open) setUnread(true);
      lastAdminCount.current = adminCount;
    } catch { /* ignore */ }
  }, [open]);

  useEffect(() => {
    setChatContext({ orderNumber, name, phone });
    loadHistory();
  }, [orderNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => {
    if (busy) return;
    clearSession();
    setMessages([]);
    setConvStatus('bot');
    setWhatsappUrl(null);
    setInput('');
    lastAdminCount.current = 0;
    focusInput();
  };

  // While a person handles the chat, check for replies
  useEffect(() => {
    if (convStatus === 'bot' || chatStatus !== 'ready') return;
    const t = setInterval(loadHistory, open ? 5000 : 20000);
    return () => clearInterval(t);
  }, [convStatus, chatStatus, open, loadHistory]);

  useEffect(() => {
    if (!open) return;
    setUnread(false);
    loadHistory();
    const t = setTimeout(focusInput, 150);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || chatStatus === 'submitted' || chatStatus === 'streaming') return;
    setInput('');
    const optimistic: SupportMessage = { id: `local-${Date.now()}`, role: 'customer', content: clean, tool_calls: null, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setChatStatus('submitted');
    setStreamText('');
    setStreamTools([]);
    try {
      await sendMessage(clean, (ev) => {
        if (ev.type === 'customer') {
          setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? ev.message : m)));
        } else if (ev.type === 'delta') {
          setChatStatus('streaming');
          setStreamText((t) => t + ev.delta);
        } else if (ev.type === 'tool') {
          setStreamTools((t) => [...t, ev.tool]);
        } else if (ev.type === 'done') {
          setMessages((prev) => [...prev, ev.message, ...(ev.system ? [ev.system] : [])]);
          setConvStatus(ev.status);
          if (ev.whatsappUrl) setWhatsappUrl(ev.whatsappUrl);
          setStreamText('');
          setStreamTools([]);
          setChatStatus('ready');
        } else if (ev.type === 'queued') {
          setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? ev.messages[0] || m : m)));
          setConvStatus(ev.status);
          if (ev.whatsappUrl) setWhatsappUrl(ev.whatsappUrl);
          setChatStatus('ready');
        } else if (ev.type === 'error') {
          setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'system', content: ev.message, tool_calls: null, created_at: new Date().toISOString() }]);
          if (ev.whatsappUrl) setWhatsappUrl(ev.whatsappUrl);
          setStreamText('');
          setStreamTools([]);
          setChatStatus('ready');
        }
      });
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'system', content: 'אין חיבור כרגע. נסו שוב בעוד רגע.', tool_calls: null, created_at: new Date().toISOString() }]);
      setChatStatus('ready');
    } finally {
      focusInput();
    }
  };

  const handleSubmit = (message: PromptInputMessage) => send(message.text || input);

  const askForHuman = async () => {
    try {
      const r = await requestHuman();
      setMessages((prev) => [...prev, ...r.messages]);
      setConvStatus(r.status);
      setWhatsappUrl(r.whatsappUrl);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'system', content: 'לא הצלחנו להעביר לנציג. אפשר להתקשר 033106020.', tool_calls: null, created_at: new Date().toISOString() }]);
    }
  };

  const launcherBottom = 'bottom-[calc(env(safe-area-inset-bottom)+1.25rem)]';

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת צ'אט תמיכה"
          className={cn('fixed left-4 z-40 flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-xl border border-primary/30 p-1.5 pl-1.5 shadow-[0_14px_36px_-14px_hsl(var(--primary)/0.7)] transition-transform hover:scale-105 active:scale-95', launcherBottom)}
        >
          <span className="relative">
            <img src={shiraAvatar} alt="" className="w-11 h-11 rounded-full object-cover" />
            <span className={cn('absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-card', unread ? 'bg-accent animate-pulse' : 'bg-success')} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold pl-3">שאלות על ההזמנה?</span>
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="צ'אט תמיכה Direct Fix"
          dir="rtl"
          className="fixed z-[60] inset-0 sm:inset-auto sm:left-4 sm:bottom-4 sm:w-[420px] sm:h-[640px] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-background sm:rounded-3xl sm:border sm:border-border shadow-2xl overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-3 border-b border-border bg-card/80 backdrop-blur-xl">
            <img src={shiraAvatar} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-primary/30" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base leading-tight">העוזרת של Direct Fix</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', convStatus === 'bot' ? 'bg-success' : 'bg-accent')} aria-hidden="true" />
                {statusLine[convStatus]}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={restart}
                disabled={busy}
                aria-label="התחלת שיחה מחדש"
                className="h-10 px-3 rounded-xl bg-muted/70 hover:bg-muted border border-border flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                התחל מחדש
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת הצ'אט"
              className="w-10 h-10 rounded-xl bg-muted/70 hover:bg-muted border border-border flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {(convStatus === 'waiting_human' || convStatus === 'human') && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-accent/10 border-b border-accent/20 text-sm">
              <span className="flex items-center gap-2 font-medium"><Headset className="w-4 h-4 text-accent" aria-hidden="true" />{convStatus === 'human' ? 'נציג מהצוות עונה לך כאן' : 'נציג יחזור אליך כאן בהקדם'}</span>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-success underline whitespace-nowrap">המשך בווטסאפ</a>
              )}
            </div>
          )}

          <Conversation className="min-h-0">
            <ConversationContent className="gap-5 text-base">
              {messages.length === 0 && !busy ? (
                <ConversationEmptyState className="gap-4">
                  <img src={shiraAvatar} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-primary/20" />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xl">{orderNumber ? `יש שאלה על הזמנה #${orderNumber}?` : 'יש שאלה על ההזמנה?'}</h3>
                    <p className="text-muted-foreground text-sm">הגעת הטכנאי, תשלום, הכנה לתיקון ואחריות. אם לא אדע, אעביר לנציג.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
                        {s}
                      </button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((m) => {
                  if (m.role === 'system') {
                    return <p key={m.id} className="mx-auto max-w-[90%] rounded-full bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground">{m.content}</p>;
                  }
                  const isUser = m.role === 'customer';
                  return (
                    <Message key={m.id} from={isUser ? 'user' : 'assistant'}>
                      {m.role === 'admin' && <span className="text-xs font-bold text-accent flex items-center gap-1"><UserRound className="w-3.5 h-3.5" aria-hidden="true" />נציג Direct Fix</span>}
                      {m.tool_calls?.map((t, i) => <ToolCard key={i} tool={t} />)}
                      <MessageContent className={cn('text-base', isUser && 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:rounded-2xl')}>
                        {isUser ? <p className="whitespace-pre-wrap">{m.content}</p> : <MessageResponse>{m.content}</MessageResponse>}
                      </MessageContent>
                    </Message>
                  );
                })
              )}
              {busy && (
                <Message from="assistant">
                  {streamTools.map((t, i) => <ToolCard key={i} tool={t} />)}
                  <MessageContent className="text-base">
                    {streamText ? <MessageResponse>{streamText}</MessageResponse> : <Shimmer>חושבת...</Shimmer>}
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="גלילה לסוף השיחה" />
          </Conversation>

          <div className="border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-3 bg-card/60">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="כתבו הודעה..."
                aria-label="הודעה לצ'אט"
                maxLength={1000}
                className="text-base"
              />
              <PromptInputFooter>
                <PromptInputTools>
                  {convStatus === 'bot' && (
                    <Button type="button" variant="ghost" size="sm" onClick={askForHuman} className="gap-1.5 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      לדבר עם נציג
                    </Button>
                  )}
                </PromptInputTools>
                <PromptInputSubmit status={chatStatus} disabled={!input.trim() || busy} aria-label="שליחה" />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
