import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  const token = url.searchParams.get("token");
  const confirmed = url.searchParams.get("confirm");

  if (!phone || !token) {
    return new Response(buildHtml("שגיאה", "קישור לא תקין", false), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const expectedToken = btoa(phone + "_directfix_unsub");
  if (token !== expectedToken) {
    return new Response(buildHtml("שגיאה", "קישור לא תקין", false), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // If not confirmed yet, show the "what you'll miss" page
  if (confirmed !== "yes") {
    const confirmUrl = `${url.origin}${url.pathname}?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}&confirm=yes`;
    return new Response(buildConfirmPage(confirmUrl), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Confirmed — do the unsubscribe
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("club_members")
    .update({ wants_promotions: false })
    .eq("phone", phone);

  if (error) {
    console.error("Unsubscribe error:", error);
    return new Response(buildHtml("שגיאה", "אירעה שגיאה, נסו שוב מאוחר יותר", false), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  return new Response(
    buildHtml("הוסרת בהצלחה", "לא תקבל/י יותר הודעות פרסומיות מדיירקט פיקס.<br/>תמיד ניתן לחזור ולהירשם דרך האתר שלנו.", false),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
});

function buildConfirmPage(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>הסרה מרשימת התפוצה - DirectFix</title>
<style>
body{margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#fff;}
.card{background:#1a1a2e;border-radius:20px;padding:40px 28px;max-width:460px;width:calc(100% - 40px);border:1px solid #2a2a3e;box-shadow:0 8px 40px rgba(0,0,0,0.4);}
h1{color:#d4af37;font-size:24px;margin:0 0 8px;text-align:center;}
.subtitle{color:#ccc;font-size:16px;text-align:center;margin:0 0 28px;line-height:1.6;}
.warning{background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:14px;padding:20px;margin-bottom:24px;}
.warning h3{color:#d4af37;margin:0 0 14px;font-size:18px;}
.benefit{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;}
.benefit .icon{font-size:22px;flex-shrink:0;margin-top:2px;}
.benefit .text{color:#e0e0e0;font-size:15px;line-height:1.6;}
.benefit .text strong{color:#d4af37;}
.actions{display:flex;flex-direction:column;gap:12px;margin-top:24px;}
.btn-stay{display:block;text-align:center;background:linear-gradient(135deg,#d4af37 0%,#b8962e 100%);color:#1a1a2e;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;}
.btn-unsub{display:block;text-align:center;background:transparent;color:#888;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;border:1px solid #333;}
</style></head>
<body>
<div class="card">
  <h1>בטוח שאתה רוצה לעזוב?</h1>
  <p class="subtitle">לפני שמסירים אותך, הנה מה שתפספס:</p>
  
  <div class="warning">
    <h3>הטבות שלא יהיו זמינות:</h3>
    
    <div class="benefit">
      <span class="icon">&#127873;</span>
      <div class="text"><strong>מתנות ביום ההולדת</strong> — הפתעות מיוחדות שמחכות רק לחברי המועדון</div>
    </div>
    
    <div class="benefit">
      <span class="icon">&#128176;</span>
      <div class="text"><strong>מבצעים והנחות בלעדיות</strong> — הנחות שלא זמינות לכלל הלקוחות</div>
    </div>
    
    <div class="benefit">
      <span class="icon">&#127942;</span>
      <div class="text"><strong>עדכוני נקודות ומבצעים</strong> — דיווח על נקודות שצברת ומבצעים חדשים</div>
    </div>
    
    <div class="benefit">
      <span class="icon">&#128222;</span>
      <div class="text"><strong>שיחות ייעוץ חינם</strong> — ייעוץ עם טכנאים מנוסים ללא עלות</div>
    </div>
  </div>
  
  <div class="actions">
    <a href="https://directfix.co.il" class="btn-stay">&#128155; רגע, אני נשאר!</a>
    <a href="${confirmUrl}" class="btn-unsub">הסר אותי בכל זאת</a>
  </div>
</div>
</body></html>`;
}

function buildHtml(title: string, message: string, _unused: boolean): string {
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
