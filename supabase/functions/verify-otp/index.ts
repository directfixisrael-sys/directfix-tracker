import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (/^05\d{8}$/.test(digits)) return digits;
  if (/^9725\d{8}$/.test(digits)) return '0' + digits.slice(3);
  return null;
}

async function hashCode(code: string, phone: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${code}:${phone}:directfix-otp`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, code } = await req.json();
    if (!phone || !code || typeof phone !== 'string' || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'invalid_input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return new Response(JSON.stringify({ error: 'invalid_phone' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      return new Response(JSON.stringify({ error: 'invalid_code_format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get latest non-verified code for this phone
    const { data: rows, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('select otp error:', error);
      return new Response(JSON.stringify({ error: 'db_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const otp = rows?.[0];
    if (!otp) {
      return new Response(JSON.stringify({ error: 'no_code', message: 'לא נמצא קוד פעיל. שלח קוד חדש.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (new Date(otp.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'expired', message: 'הקוד פג תוקף. שלח קוד חדש.' }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if ((otp.attempts ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'too_many_attempts', message: 'יותר מדי ניסיונות. שלח קוד חדש.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const submittedHash = await hashCode(cleanCode, normalizedPhone);
    const match = submittedHash === otp.code_hash;

    if (!match) {
      await supabase.from('otp_codes').update({ attempts: (otp.attempts ?? 0) + 1 }).eq('id', otp.id);
      return new Response(JSON.stringify({ error: 'invalid_code', message: 'קוד שגוי. נסה שוב.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('otp_codes').update({ verified: true }).eq('id', otp.id);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('verify-otp error:', e);
    return new Response(JSON.stringify({ error: 'unexpected', message: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
