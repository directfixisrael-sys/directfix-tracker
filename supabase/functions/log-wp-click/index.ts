import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getDevice = (ua: string): string => {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ua = req.headers.get("user-agent") || "";
    const referrer = body.referrer || req.headers.get("referer") || null;
    const pageUrl = body.page_url || null;
    const pageTitle = typeof body.page_title === "string" ? body.page_title.slice(0, 250) : null;
    const allowed = ["main", "whatsapp", "call"];
    const buttonType = allowed.includes(body.button_type) ? body.button_type : "main";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("wp_button_clicks").insert({
      referrer,
      page_url: pageUrl,
      page_title: pageTitle,
      user_agent: ua,
      device_type: getDevice(ua),
      button_type: buttonType,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
