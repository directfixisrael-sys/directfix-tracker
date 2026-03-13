import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildUnsubscribeUrl(phone: string): string {
  const token = btoa(phone + "_directfix_unsub");
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  return `${baseUrl}/functions/v1/handle-club-unsubscribe?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`;
}

function buildEmailHtml(subject: string, message: string, image: string | null, recipientName: string, phone?: string): string {
  const messageHtml = message.replace(/\n/g, '<br/>');
  const imageHtml = image
    ? `<img src="${image}" alt="מבצע" style="width:100%;max-width:560px;border-radius:16px;margin-bottom:24px;display:block;" />`
    : '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);border:1px solid #2a2a3e;">

  <!-- Header with gold accent -->
  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#1a1a2e 100%);padding:36px 30px 28px;text-align:center;border-bottom:2px solid #d4af37;">
    <div style="margin-bottom:12px;">
      <span style="font-size:32px;color:#d4af37;">&#9733;</span>
    </div>
    <h1 style="color:#ffffff;margin:0 0 4px;font-size:28px;font-weight:800;letter-spacing:-0.5px;">DirectFix</h1>
    <p style="color:#d4af37;margin:0;font-size:16px;font-weight:600;">מועדון הלקוחות</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:28px 30px 8px;text-align:right;">
    <p style="color:#d4af37;font-size:20px;font-weight:700;margin:0;">היי ${recipientName}!</p>
  </td></tr>

  <!-- Subject as title -->
  <tr><td style="padding:8px 30px 20px;text-align:right;">
    <h2 style="color:#ffffff;font-size:24px;font-weight:800;margin:0;line-height:1.4;">${subject}</h2>
  </td></tr>

  <!-- Image -->
  ${imageHtml ? `<tr><td style="padding:0 30px 24px;text-align:center;">${imageHtml}</td></tr>` : ''}

  <!-- Message body -->
  <tr><td style="padding:0 30px 32px;">
    <div style="font-size:18px;line-height:1.9;color:#e0e0e0;text-align:right;">
      ${messageHtml}
    </div>
  </td></tr>

  <!-- CTA Button -->
  <tr><td style="padding:0 30px 32px;text-align:center;">
    <a href="https://directfix-tracker.lovable.app" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#d4af37 0%,#b8962e 100%);color:#1a1a2e;text-decoration:none;padding:16px 40px;border-radius:14px;font-size:18px;font-weight:800;box-shadow:0 4px 20px rgba(212,175,55,0.3);letter-spacing:-0.3px;">
      בקרו באתר שלנו
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#12121a;padding:24px 30px;text-align:center;border-top:1px solid #2a2a3e;">
    <p style="color:#d4af37;font-size:14px;font-weight:600;margin:0 0 8px;">
      DirectFix - תיקוני סלולר מקצועיים עד הבית
    </p>
    <p style="color:#666;font-size:13px;margin:0 0 4px;">
      <a href="https://directfix.co.il" style="color:#d4af37;text-decoration:none;">directfix.co.il</a>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <a href="tel:033106020" style="color:#888;text-decoration:none;">03-3106020</a>
    </p>
    <p style="color:#555;font-size:11px;margin:8px 0 0;">
      קיבלת את המייל הזה כחבר/ת מועדון DirectFix
    </p>
    ${phone ? `<p style="color:#555;font-size:11px;margin:8px 0 0;">
      <a href="${buildUnsubscribeUrl(phone)}" style="color:#888;text-decoration:underline;">לא רוצה לקבל הודעות פרסומיות? לחצו כאן להסרה</a>
    </p>` : ''}
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, message, image, recipients, preview } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    // Preview mode - return HTML without sending
    if (preview) {
      const previewHtml = buildEmailHtml(
        subject || "נושא לדוגמה",
        message || "תוכן ההודעה יופיע כאן...",
        image || null,
        "לקוח לדוגמה"
      );
      return new Response(JSON.stringify({ html: previewHtml }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!recipients?.length) throw new Error("No recipients provided");

    let sent = 0;
    let failed = 0;

    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const promises = batch.map(async (r: { email: string; name: string; phone?: string }) => {
        try {
          const html = buildEmailHtml(subject, message, image || null, r.name || "חבר/ת מועדון", r.phone);
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "דיירקט פיקס <orders@directfix.co.il>",
              to: [r.email],
              subject: subject || "מבצע מיוחד מדיירקט פיקס!",
              html,
            }),
          });
          if (res.ok) sent++;
          else {
            const err = await res.text();
            console.error(`Failed to send to ${r.email}:`, err);
            failed++;
          }
        } catch (e) {
          console.error(`Error sending to ${r.email}:`, e);
          failed++;
        }
      });

      await Promise.all(promises);

      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: recipients.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("send-club-broadcast-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
