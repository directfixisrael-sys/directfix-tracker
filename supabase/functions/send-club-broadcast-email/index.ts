import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, message, image, recipients } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    if (!recipients?.length) throw new Error("No recipients provided");

    // Build HTML email
    const messageHtml = message.replace(/\n/g, '<br/>');
    const imageHtml = image
      ? `<img src="${image}" alt="מבצע" style="width:100%;max-width:600px;border-radius:12px;margin-bottom:20px;" />`
      : '';

    const htmlTemplate = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:30px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">דיירקט פיקס</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">מועדון הלקוחות</p>
  </td></tr>
  <tr><td style="padding:30px;">
    ${imageHtml}
    <div style="font-size:16px;line-height:1.8;color:#1f2937;text-align:right;">
      ${messageHtml}
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#6b7280;font-size:12px;margin:0;">
      דיירקט פיקס - שירות תיקון אייפונים עד הבית
      <br/>
      <a href="https://directfix.co.il" style="color:#2563eb;text-decoration:none;">directfix.co.il</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    let sent = 0;
    let failed = 0;

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const promises = batch.map(async (r: { email: string; name: string }) => {
        try {
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
              html: htmlTemplate.replace('מועדון הלקוחות', `היי ${r.name}!`),
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

      // Small delay between batches
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
