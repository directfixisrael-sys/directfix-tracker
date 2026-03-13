import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  const token = url.searchParams.get("token");

  if (!phone || !token) {
    return new Response(buildHtml("שגיאה", "קישור לא תקין"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Simple token validation: base64 of phone
  const expectedToken = btoa(phone + "_directfix_unsub");
  if (token !== expectedToken) {
    return new Response(buildHtml("שגיאה", "קישור לא תקין"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("club_members")
    .update({ wants_promotions: false })
    .eq("phone", phone);

  if (error) {
    console.error("Unsubscribe error:", error);
    return new Response(buildHtml("שגיאה", "אירעה שגיאה, נסו שוב מאוחר יותר"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  return new Response(
    buildHtml("הוסרת בהצלחה", "לא תקבל/י יותר הודעות פרסומיות מדיירקט פיקס.<br/>תמיד ניתן לחזור ולהירשם דרך האתר שלנו."),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
});

function buildHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - DirectFix</title>
<style>
body{margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#fff;}
.card{background:#1a1a2e;border-radius:20px;padding:48px 32px;max-width:420px;text-align:center;border:1px solid #2a2a3e;box-shadow:0 8px 40px rgba(0,0,0,0.4);}
h1{color:#d4af37;font-size:28px;margin:0 0 16px;}
p{color:#e0e0e0;font-size:18px;line-height:1.8;margin:0;}
a{color:#d4af37;text-decoration:none;display:inline-block;margin-top:24px;font-weight:600;}
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p><a href="https://directfix.co.il">חזרה לאתר</a></div></body></html>`;
}
