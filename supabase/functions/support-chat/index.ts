import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { streamResponse, GatewayError } from "npm:@lovable.dev/ai-gateway@0.1.11";
import { z } from "npm:zod@3.23.8";
import { HELP_DOCS } from "./knowledge.ts";

const MODEL = "openai/gpt-6-astra";
const WHATSAPP_NUMBER = "97233106020";
const ADMIN_EMAIL = "directfixil@gmail.com";
const MAX_CUSTOMER_MSGS_PER_10_MIN = 20;
const MAX_FAILED_LOOKUPS_PER_HOUR = 5;

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const STATUS_LABELS: Record<string, string> = {
  pending: "הזמנה התקבלה",
  confirmed: "הזמנה אושרה",
  technician_assigned: "טכנאי שובץ",
  on_the_way: "הטכנאי בדרך",
  arrived: "הטכנאי הגיע",
  in_progress: "התיקון בעבודה",
  completed: "התיקון הושלם",
  cancelled: "ההזמנה בוטלה",
};

const Auth = z.object({ conversationId: z.string().uuid(), token: z.string().min(20).max(200) });
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("faqs") }),
  z.object({ action: z.literal("start"), name: z.string().trim().max(80).optional(), phone: z.string().trim().max(20).optional(), orderNumber: z.number().int().positive().max(10000000).optional() }),
  Auth.extend({ action: z.literal("history") }),
  Auth.extend({ action: z.literal("send"), message: z.string().trim().min(1).max(1000), page: z.string().max(200).optional() }),
  Auth.extend({ action: z.literal("handoff") }),
]);

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const normalizePhone = (p: string) => {
  let d = (p || "").replace(/\D/g, "");
  if (d.startsWith("972")) d = "0" + d.slice(3);
  return d;
};

async function loadConversation(conversationId: string, token: string) {
  const { data } = await supabase.from("support_conversations").select("*").eq("id", conversationId).maybeSingle();
  if (!data) return null;
  if (data.token_hash !== (await sha256(token))) return null;
  return data;
}

const whatsappUrl = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`שלום, אני פונה מהצ'אט באתר. ${text}`.slice(0, 600))}`;

async function insertMessage(conversationId: string, role: string, content: string, toolCalls: unknown = null) {
  const { data, error } = await supabase
    .from("support_messages")
    .insert({ conversation_id: conversationId, role, content, tool_calls: toolCalls })
    .select("id, role, content, tool_calls, created_at")
    .single();
  if (error) throw error;
  await supabase.from("support_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  return data;
}

async function notifyAdmin(conv: { id: string; customer_name?: string | null; customer_phone?: string | null }, reason: string, lastMessage: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "דיירקט פיקס <orders@directfix.co.il>",
        to: [ADMIN_EMAIL],
        subject: `לקוח מבקש נציג בצ'אט${conv.customer_name ? ` - ${conv.customer_name}` : ""}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6">
          <h2 style="margin:0 0 12px">לקוח בצ'אט התמיכה מחכה לנציג</h2>
          <p><b>סיבה:</b> ${esc(reason)}</p>
          ${conv.customer_name ? `<p><b>שם:</b> ${esc(conv.customer_name)}</p>` : ""}
          ${conv.customer_phone ? `<p><b>טלפון:</b> ${esc(conv.customer_phone)}</p>` : ""}
          <p><b>הודעה אחרונה:</b> ${esc(lastMessage)}</p>
          <p><a href="https://track.directfix.co.il/admin">לפתיחת הצ'אט בפאנל הניהול</a></p>
        </div>`,
      }),
    });
  } catch (e) {
    console.error("handoff email failed", e);
  }
}

async function startHandoff(conv: any, reason: string, lastMessage: string) {
  if (conv.status === "waiting_human" || conv.status === "human") return null;
  await supabase.from("support_conversations").update({ status: "waiting_human", handoff_reason: reason, admin_unread: true }).eq("id", conv.id);
  const sys = await insertMessage(conv.id, "system", "השיחה הועברה לנציג. נחזור אליכם כאן בצ'אט בהקדם, או שאפשר להמשיך בווטסאפ.");
  notifyAdmin(conv, reason, lastMessage);
  return sys;
}

// ---------- Tools ----------
const TOOLS = [
  {
    type: "function" as const,
    name: "lookup_order",
    description: "בדיקת סטטוס ופרטי הזמנה. חובה לקבל מהלקוח גם מספר טלפון וגם מספר הזמנה, ושניהם חייבים להתאים.",
    parameters: {
      type: "object",
      properties: {
        phone: { type: "string", description: "מספר הטלפון של הלקוח כפי שנמסר בהזמנה" },
        order_number: { type: "integer", description: "מספר ההזמנה (מופיע באישור ההזמנה, למשל 183)" },
      },
      required: ["phone", "order_number"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "get_repair_prices",
    description: "מחירון עדכני לתיקון לפי דגם. מחזיר את התיקונים הזמינים לדגם ומחיריהם.",
    parameters: {
      type: "object",
      properties: {
        model: { type: "string", description: "שם הדגם, למשל iPhone 15 Pro" },
      },
      required: ["model"],
      additionalProperties: false,
    },
    strict: true,
  },

];

async function failedLookupsLastHour(conversationId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("support_messages")
    .select("tool_calls")
    .eq("conversation_id", conversationId)
    .not("tool_calls", "is", null)
    .gte("created_at", since);
  let n = 0;
  for (const row of data || []) {
    for (const t of (row.tool_calls as any[]) || []) if (t?.name === "lookup_order" && t?.output?.found === false) n++;
  }
  return n;
}

function orderSummary(o: any) {
  return {
    found: true,
    order_number: o.order_number,
    status: STATUS_LABELS[o.status] || o.status,
    device: o.device_type,
    repair: o.issue_description,
    price: Number(o.repair_price) - Number(o.coupon_discount || 0),
    estimated_arrival: o.estimated_arrival || null,
    technician: o.technician_name || null,
    ordered_at: o.created_at,
    completed_at: o.completed_at || null,
    warranty_until: o.warranty_expiry || null,
    warranty_months: o.warranty_months || null,
    payment_status: o.payment_status || null,
  };
}

async function runTool(conv: any, name: string, args: any, failedSoFar: { n: number }, state: { handoffReason: string | null }) {
  if (name === "lookup_order") {
    if (failedSoFar.n >= MAX_FAILED_LOOKUPS_PER_HOUR) {
      return { found: false, error: "יותר מדי ניסיונות. יש להעביר לנציג." };
    }
    const phone = normalizePhone(String(args.phone || ""));
    const num = Number(args.order_number);
    if (!phone || !Number.isInteger(num)) return { found: false, error: "חסר טלפון או מספר הזמנה" };
    const { data } = await supabase.from("orders").select("*").eq("order_number", num).maybeSingle();
    if (!data || normalizePhone(data.customer_phone) !== phone) {
      failedSoFar.n++;
      return { found: false, error: "לא נמצאה הזמנה עם הטלפון ומספר ההזמנה האלה" };
    }
    await supabase.from("support_conversations").update({
      verified_order_id: data.id,
      customer_phone: conv.customer_phone || phone,
      customer_name: conv.customer_name || data.customer_name,
    }).eq("id", conv.id);
    conv.verified_order_id = data.id;
    return orderSummary(data);
  }
  if (name === "get_repair_prices") {
    const q = String(args.model || "").trim().slice(0, 60);
    if (!q) return { models: [] };
    const { data: models } = await supabase.from("iphone_models").select("id, name").eq("is_active", true).ilike("name", `%${q}%`).limit(4);
    if (!models?.length) {
      // Tablets and other brands (iPad, Samsung) only have a screen price
      const { data: tablets } = await supabase.from("ipad_models").select("name, screen_price").eq("is_active", true).ilike("name", `%${q}%`).gt("screen_price", 0).limit(4);
      if (tablets?.length) {
        return {
          models: tablets.map((t) => ({ model: t.name, repairs: [{ repair: "החלפת מסך", price: Number(t.screen_price) }] })),
          note: "מחירים לפני מבצעים. המחיר הסופי מוצג בעמוד ההזמנה.",
        };
      }
      return { models: [], note: "הדגם לא נמצא במחירון. אפשר לבדוק בעמוד ההזמנה או להעביר לנציג." };
    }
    const { data: prices } = await supabase
      .from("model_repair_prices")
      .select("model_id, price, repair_types(name, is_active)")
      .in("model_id", models.map((m) => m.id))
      .gt("price", 0);
    return {
      models: models.map((m) => ({
        model: m.name,
        repairs: (prices || [])
          .filter((p: any) => p.model_id === m.id && p.repair_types?.is_active && Number(p.price) > 0)
          .map((p: any) => ({ repair: p.repair_types.name, price: Number(p.price) })),
      })),
      note: "מחירים לפני מבצעים. המחיר הסופי מוצג בעמוד ההזמנה.",
    };
  }
  if (name === "handoff_to_human") {
    state.handoffReason = String(args.reason || "הלקוח צריך נציג").slice(0, 300);
    return { ok: true, message: "השיחה הועברה לנציג. ספר ללקוח שנציג יחזור אליו כאן בצ'אט, ושאפשר גם לפנות בווטסאפ." };
  }
  return { error: "unknown tool" };
}

async function loadFaqs() {
  const { data } = await supabase
    .from("support_faqs")
    .select("question, answer")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(50);
  return data || [];
}

async function buildInstructions(conv: any) {
  const faqs = await loadFaqs();
  const faqText = faqs.length
    ? `\n\n## שאלות ותשובות שהעסק הגדיר (עדיפות ראשונה - עני לפיהן כשהלקוח שואל שאלה דומה)\n${faqs.map((f) => `ש: ${f.question}\nת: ${f.answer}`).join("\n\n")}`
    : "";
  let verified = "";
  if (conv.verified_order_id) {
    const { data } = await supabase.from("orders").select("*").eq("id", conv.verified_order_id).maybeSingle();
    if (data) verified = `\n\nהזמנה מאומתת של הלקוח בשיחה הזו (כבר אומתה בטלפון ומספר הזמנה, אין צורך לבקש שוב):\n${JSON.stringify(orderSummary(data))}\nקישור המעקב האישי של הלקוח: https://track.directfix.co.il/track?phone=${encodeURIComponent(normalizePhone(data.customer_phone))}`;
  }
  return `את העוזרת החכמה של Direct Fix (דיירקט פיקס), שירות תיקון סלולר עד הבית. עונה בעברית, בגוף שני, קצר וחם (2-4 משפטים), בלי אימוג'ים.

כללים:
- עני רק לפי המידע למטה, תוצאות הכלים, או ההזמנה המאומתת. אל תמציאי מחירים, מועדים, סטטוסים או מדיניות.
- מחיר לדגם: השתמשי ב-get_repair_prices.
- שאלה על הזמנה קיימת: בקשי טלפון ומספר הזמנה, ואז lookup_order. אל תמסרי פרטי הזמנה בלי התאמה של שניהם. אל תמסרי כתובת.
- אין שיחה עם נציג בצ'אט. אם את לא בטוחה, אין מידע, או מדובר בתלונה/החזר/אחריות/ביטול/שינוי מועד - כתבי בנימוס שאפשר להתקשר אלינו 033106020.
- להזמנת תיקון הפני לעמוד ההזמנה /order. למעקב - /track.
- אל תבטיחי הגעה תוך שעה.
- כתבי את שם העסק בעברית: דיירקט פיקס.
- הצ'אט נפתח ללקוח אחרי שביצע הזמנה. שאלות נפוצות: איך משלמים (בסוף התיקון, אחרי שהמכשיר עובד, כל אמצעי התשלום כולל העברה בנקאית ישירה), מה להכין (לגבות את המכשיר, לזכור את קוד הנעילה, להיות זמינים בטלפון), משך התיקון, האם הטכנאי יכול לתקן ברכב שלו (כן, ומומלץ - חוסך ללקוח זמן), ואיך עוקבים אחרי ההזמנה (תמיד לצרף את קישור המעקב כקישור markdown). שינוי מועד, ביטול או עדכון כתובת - להתקשר 033106020.

${HELP_DOCS}${faqText}${verified}`;
}

function historyToInput(rows: any[]) {
  const input: any[] = [];
  for (const r of rows) {
    if (r.role === "customer") input.push({ role: "user", content: r.content });
    else if (r.role === "bot") input.push({ role: "assistant", content: r.content || "(בדיקה)" });
    else if (r.role === "admin") input.push({ role: "assistant", content: `[נציג אנושי מהצוות]: ${r.content}` });
  }
  return input;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: z.infer<typeof Body>;
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_request", details: parsed.error.flatten().fieldErrors }, 400);
    body = parsed.data;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  try {
    if (body.action === "faqs") {
      const faqs = await loadFaqs();
      return json({ questions: faqs.map((f) => f.question) });
    }

    if (body.action === "start") {
      const token = crypto.randomUUID() + crypto.randomUUID();
      const phone = body.phone ? normalizePhone(body.phone) : null;
      // Link the order just placed, only when its phone matches too
      let verifiedOrderId: string | null = null;
      if (phone && body.orderNumber) {
        const { data: o } = await supabase.from("orders").select("id, customer_phone").eq("order_number", body.orderNumber).maybeSingle();
        if (o && normalizePhone(o.customer_phone) === phone) verifiedOrderId = o.id;
      }
      const { data, error } = await supabase
        .from("support_conversations")
        .insert({ token_hash: await sha256(token), customer_name: body.name || null, customer_phone: phone && phone.length >= 9 ? phone : null, verified_order_id: verifiedOrderId })
        .select("id")
        .single();
      if (error) throw error;
      return json({ conversationId: data.id, token, status: "bot", messages: [] });
    }

    const conv = await loadConversation(body.conversationId, body.token);
    if (!conv) return json({ error: "not_found" }, 404);

    if (body.action === "history") {
      const { data } = await supabase
        .from("support_messages")
        .select("id, role, content, tool_calls, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true })
        .limit(200);
      return json({ status: conv.status, messages: data || [] });
    }

    if (body.action === "handoff") {
      const { data: last } = await supabase.from("support_messages").select("content").eq("conversation_id", conv.id).eq("role", "customer").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const sys = await startHandoff(conv, "הלקוח ביקש לדבר עם נציג", last?.content || "");
      return json({ status: "waiting_human", messages: sys ? [sys] : [], whatsappUrl: whatsappUrl(last?.content || "") });
    }

    // send
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase.from("support_messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("role", "customer").gte("created_at", since);
    if ((count || 0) >= MAX_CUSTOMER_MSGS_PER_10_MIN) return json({ error: "rate_limited" }, 429);

    const customerMsg = await insertMessage(conv.id, "customer", body.message);

    if (conv.status !== "bot") {
      await supabase.from("support_conversations").update({ admin_unread: true, status: conv.status === "closed" ? "waiting_human" : conv.status }).eq("id", conv.id);
      return json({ status: conv.status === "closed" ? "waiting_human" : conv.status, messages: [customerMsg], whatsappUrl: whatsappUrl(body.message) });
    }

    const { data: history } = await supabase
      .from("support_messages")
      .select("role, content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(30);
    const instructions = await buildInstructions(conv);
    const failed = { n: await failedLookupsLastHour(conv.id) };
    const state = { handoffReason: null as string | null };

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (ev: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`));
        send({ type: "customer", message: customerMsg });
        let text = "";
        const toolLog: any[] = [];
        try {
          let input: any[] = historyToInput((history || []).reverse());
          for (let round = 0; round < 4; round++) {
            const s = await streamResponse({
              model: MODEL,
              instructions,
              input,
              tools: TOOLS,
              include: ["reasoning.encrypted_content"],
              reasoning: { effort: "low" },
            });
            let completed: any = null;
            let roundStarted = false;
            for await (const ev of s as AsyncIterable<any>) {
              if (ev.type === "response.output_text.delta" && ev.delta) {
                if (!roundStarted && text) { text += "\n\n"; send({ type: "delta", delta: "\n\n" }); }
                roundStarted = true;
                text += ev.delta;
                send({ type: "delta", delta: ev.delta });
              } else if (ev.type === "response.completed") {
                completed = ev.response;
              }
            }
            const output: any[] = completed?.output || [];
            const calls = output.filter((o) => o.type === "function_call");
            if (!calls.length) break;
            input = [...input, ...output];
            for (const c of calls) {
              let args: any = {};
              try { args = JSON.parse(c.arguments || "{}"); } catch { /* ignore */ }
              const result = await runTool(conv, c.name, args, failed, state);
              const entry = { name: c.name, input: args, output: result, state: (result as any)?.error ? "output-error" : "output-available" };
              toolLog.push(entry);
              send({ type: "tool", tool: entry });
              input.push({ type: "function_call_output", call_id: c.call_id, output: JSON.stringify(result) });
            }
          }
          if (!text.trim()) text = "לא הצלחתי לענות על זה. אפשר להתקשר אלינו 033106020.";
          const botMsg = await insertMessage(conv.id, "bot", text, toolLog.length ? toolLog : null);
          let status = "bot";
          let sys = null;
          if (state.handoffReason) {
            sys = await startHandoff(conv, state.handoffReason, body.message);
            status = "waiting_human";
          }
          send({ type: "done", message: botMsg, system: sys, status, whatsappUrl: status === "waiting_human" ? whatsappUrl(body.message) : null });
        } catch (e) {
          if (e instanceof GatewayError) console.error("gateway error", e.code, e.httpStatus, e.outcome, e.ids);
          else console.error("support chat error", e);
          send({ type: "error", message: "משהו השתבש. אפשר לנסות שוב או לדבר עם נציג.", whatsappUrl: whatsappUrl(body.message) });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (e) {
    console.error("support-chat failure", e);
    return json({ error: "server_error" }, 500);
  }
});
