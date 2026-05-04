import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g. "whatsapp:+14155238886"
const TWILIO_SMS_FROM = Deno.env.get('TWILIO_SMS_FROM'); // optional, for SMS fallback
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Convert IL local phone (05XXXXXXXX) to E.164 (+9725XXXXXXXX)
function toE164IL(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (/^05\d{8}$/.test(digits)) return '+972' + digits.slice(1);
  if (/^9725\d{8}$/.test(digits)) return '+' + digits;
  if (/^\+9725\d{8}$/.test(phone)) return phone;
  return null;
}

async function hashCode(code: string, phone: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${code}:${phone}:directfix-otp`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendTwilio(to: string, body: string, channel: 'whatsapp' | 'sms'): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return { ok: false, error: 'twilio_not_configured' };

  const from = channel === 'whatsapp' ? TWILIO_WHATSAPP_NUMBER : TWILIO_SMS_FROM;
  if (!from) return { ok: false, error: `${channel}_from_not_configured` };

  const toFormatted = channel === 'whatsapp' ? `whatsapp:${to}` : to;
  const fromFormatted = channel === 'whatsapp' && !from.startsWith('whatsapp:') ? `whatsapp:${from}` : from;

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({ To: toFormatted, From: fromFormatted, Body: body });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Twilio ${channel} error:`, data);
      return { ok: false, error: data?.message || `twilio_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error(`Twilio ${channel} exception:`, e);
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return new Response(JSON.stringify({ error: 'invalid_phone' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const e164 = toE164IL(phone);
    if (!e164) {
      return new Response(JSON.stringify({ error: 'invalid_il_phone' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const normalizedPhone = e164.replace(/\D/g, '').replace(/^972/, '0'); // store as 05XXXXXXXX

    // Rate limit: max 3 sends per phone in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('otp_codes')
      .select('id', { count: 'exact', head: true })
      .eq('phone', normalizedPhone)
      .gte('created_at', tenMinAgo);

    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'יותר מדי ניסיונות, נסה שוב בעוד מספר דקות' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await hashCode(code, normalizedPhone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    const body = `קוד האימות שלך ב-DirectFix: ${code}\nתקף ל-5 דקות. אל תשתף קוד זה עם אף אחד.`;

    // Try WhatsApp first, fall back to SMS
    let channel: 'whatsapp' | 'sms' = 'whatsapp';
    let send = await sendTwilio(e164, body, 'whatsapp');
    if (!send.ok && TWILIO_SMS_FROM) {
      console.log('WhatsApp failed, trying SMS:', send.error);
      channel = 'sms';
      send = await sendTwilio(e164, body, 'sms');
    }

    if (!send.ok) {
      return new Response(JSON.stringify({ error: 'send_failed', message: send.error }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert hashed code
    const { error: insertErr } = await supabase.from('otp_codes').insert({
      phone: normalizedPhone,
      code_hash: codeHash,
      channel,
      expires_at: expiresAt,
    });
    if (insertErr) {
      console.error('insert otp error:', insertErr);
      return new Response(JSON.stringify({ error: 'db_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, channel }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('send-otp error:', e);
    return new Response(JSON.stringify({ error: 'unexpected', message: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
