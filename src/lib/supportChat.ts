// Client for the support-chat server function. The browser keeps one ongoing conversation (id + secret token).
const STORAGE_KEY = 'df_support_chat';
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type SupportRole = 'customer' | 'bot' | 'admin' | 'system';
export type SupportStatus = 'bot' | 'waiting_human' | 'human' | 'closed';

export interface SupportTool {
  name: 'lookup_order' | 'get_repair_prices' | 'handoff_to_human' | string;
  input: Record<string, unknown>;
  output: any;
  state: 'output-available' | 'output-error';
}

export interface SupportMessage {
  id: string;
  role: SupportRole;
  content: string;
  tool_calls: SupportTool[] | null;
  created_at: string;
}

interface Session { conversationId: string; token: string; orderNumber?: number | null }

export interface ChatContext { name?: string; phone?: string; orderNumber?: number | null }
let chatContext: ChatContext = {};
/** Order details the chat starts with, so the assistant already knows the order the customer just placed. */
export const setChatContext = (ctx: ChatContext) => {
  chatContext = ctx;
  const s = getSession();
  // A different order gets a fresh conversation
  if (s && ctx.orderNumber && s.orderNumber !== ctx.orderNumber) clearSession();
};

export const getSession = (): Session | null => {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return s?.conversationId && s?.token ? s : null;
  } catch { return null; }
};
const saveSession = (s: Session) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ } };
export const clearSession = () => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ } };

const post = (body: unknown, signal?: AbortSignal) =>
  fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
    signal,
  });

export async function ensureSession(): Promise<Session> {
  const existing = getSession();
  if (existing) return existing;
  let name = chatContext.name || undefined; let phone = chatContext.phone || undefined;
  if (!name || !phone) {
    try {
      const intro = JSON.parse(localStorage.getItem('df_intro_lead') || 'null');
      name = name || intro?.name || undefined; phone = phone || intro?.phone || undefined;
    } catch { /* ignore */ }
  }
  const orderNumber = chatContext.orderNumber || undefined;
  const res = await post({ action: 'start', name, phone, orderNumber });
  if (!res.ok) throw new Error('start_failed');
  const data = await res.json();
  const s = { conversationId: data.conversationId, token: data.token, orderNumber: orderNumber ?? null };
  saveSession(s);
  return s;
}

export async function fetchHistory(): Promise<{ status: SupportStatus; messages: SupportMessage[] } | null> {
  const s = getSession();
  if (!s) return null;
  const res = await post({ action: 'history', ...s });
  if (res.status === 404) { clearSession(); return null; }
  if (!res.ok) throw new Error('history_failed');
  return res.json();
}

export async function requestHuman(): Promise<{ status: SupportStatus; messages: SupportMessage[]; whatsappUrl: string }> {
  const s = await ensureSession();
  const res = await post({ action: 'handoff', ...s });
  if (!res.ok) throw new Error('handoff_failed');
  return res.json();
}

export type SendEvent =
  | { type: 'customer'; message: SupportMessage }
  | { type: 'delta'; delta: string }
  | { type: 'tool'; tool: SupportTool }
  | { type: 'done'; message: SupportMessage; system: SupportMessage | null; status: SupportStatus; whatsappUrl: string | null }
  | { type: 'error'; message: string; whatsappUrl?: string }
  | { type: 'queued'; status: SupportStatus; messages: SupportMessage[]; whatsappUrl?: string };

/** Sends a customer message. Bot replies stream as events; when a person handles the chat the message is just queued. */
export async function sendMessage(text: string, onEvent: (e: SendEvent) => void, signal?: AbortSignal) {
  const s = await ensureSession();
  const res = await post({ action: 'send', ...s, message: text, page: window.location.pathname }, signal);
  if (res.status === 429) { onEvent({ type: 'error', message: 'נשלחו הרבה הודעות ברצף. נסו שוב בעוד כמה דקות.' }); return; }
  if (res.status === 404) { clearSession(); onEvent({ type: 'error', message: 'השיחה פגה. נסו לשלוח שוב.' }); return; }
  if (!res.ok || !res.body) { onEvent({ type: 'error', message: 'משהו השתבש. נסו שוב.' }); return; }
  if (!(res.headers.get('content-type') || '').includes('text/event-stream')) {
    const data = await res.json();
    onEvent({ type: 'queued', status: data.status, messages: data.messages || [], whatsappUrl: data.whatsappUrl });
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let finished = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const chunk = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 2);
      if (!chunk.startsWith('data:')) continue;
      try {
        const ev = JSON.parse(chunk.slice(5)) as SendEvent;
        if (ev.type === 'done' || ev.type === 'error') finished = true;
        onEvent(ev);
      } catch { /* ignore malformed */ }
    }
  }
  if (!finished) onEvent({ type: 'error', message: 'החיבור נקטע. נסו שוב.' });
}
