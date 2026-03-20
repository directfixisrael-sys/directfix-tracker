import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(apiKey: string, from: string, to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return response.json();
}

// Map step names to URL params and labels
function getStepInfo(lastStep: string): { param: string; label: string } {
  const map: Record<string, { param: string; label: string }> = {
    'בחירת דגם': { param: 'model', label: 'בחירת דגם' },
    'בחירת תיקון': { param: 'repair', label: 'בחירת סוג תיקון' },
    'מחיר': { param: 'price', label: 'אישור מחיר' },
    'מועד': { param: 'schedule', label: 'בחירת מועד' },
    'פרטים': { param: 'details', label: 'מילוי פרטים' },
  };
  return map[lastStep] || { param: 'model', label: 'תחילת הזמנה' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, lastStep, couponCode, couponDiscount, preview } = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const stepInfo = getStepInfo(lastStep);
    
    const orderUrl = `https://directfix-tracker.lovable.app/order`;
    
    const couponSection = couponCode ? `
    <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:16px;padding:24px;margin-bottom:24px;border:2px solid #f59e0b;text-align:center;">
      <span style="font-size:40px;">&#127873;</span>
      <h3 style="color:#92400e;margin:10px 0 6px;font-size:22px;font-weight:800;">הנחה מיוחדת בשבילך!</h3>
      <p style="color:#a16207;margin:0 0 12px;font-size:17px;">קוד קופון: <strong style="background:#fff;padding:6px 16px;border-radius:8px;font-size:20px;letter-spacing:2px;color:#92400e;">${couponCode}</strong></p>
      <p style="color:#a16207;margin:0;font-size:16px;">₪${couponDiscount} הנחה על התיקון הבא שלך</p>
    </div>` : '';

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;direction:rtl;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

<div style="background:linear-gradient(135deg,#0d64f4 0%,#0a4dbf 100%);border-radius:16px 16px 0 0;padding:40px 30px;text-align:center;">
  <div style="font-size:50px;margin-bottom:12px;">&#128075;</div>
  <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">היי ${customerName}, שמנו לב שעצרת</h1>
  <p style="color:rgba(255,255,255,0.9);margin:12px 0 0;font-size:17px;">ההזמנה שלך מחכה - עצרת ב${stepInfo.label}</p>
</div>

<div style="background:#fff;border-radius:0 0 16px 16px;padding:30px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  
  <div style="text-align:center;margin-bottom:24px;">
    <p style="color:#555;font-size:17px;line-height:1.8;margin:0 0 20px;">
      הטכנאים שלנו מוכנים ומחכים! השלימו את ההזמנה בקלות ותקבלו שירות תיקון מקצועי עד הבית.
    </p>
  </div>

  ${couponSection}

  <!-- Benefits -->
  <div style="background:#f8fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
    <h3 style="margin:0 0 14px;color:#333;font-size:18px;text-align:right;">למה DirectFix?</h3>
    <div style="margin-bottom:10px;padding:10px;text-align:right;">
      <p style="margin:0;color:#333;font-size:16px;font-weight:600;">&#9989; תיקון עד הבית - הטכנאי מגיע אליך</p>
    </div>
    <div style="margin-bottom:10px;padding:10px;text-align:right;">
      <p style="margin:0;color:#333;font-size:16px;font-weight:600;">&#9989; אחריות מלאה על כל תיקון</p>
    </div>
    <div style="margin-bottom:10px;padding:10px;text-align:right;">
      <p style="margin:0;color:#333;font-size:16px;font-weight:600;">&#9989; חלקים מקוריים ומוסמכים</p>
    </div>
    <div style="padding:10px;text-align:right;">
      <p style="margin:0;color:#333;font-size:16px;font-weight:600;">&#9989; תשלום רק לאחר התיקון</p>
    </div>
  </div>

  <div style="text-align:center;margin-bottom:20px;">
    <a href="${orderUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0d64f4 0%,#0a4dbf 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:18px;font-weight:700;box-shadow:0 4px 15px rgba(13,100,244,0.3);">
      &#128296; המשך את ההזמנה שלי
    </a>
  </div>

  <div style="text-align:center;margin-bottom:16px;">
    <p style="color:#888;font-size:15px;">או התקשר: <a href="tel:033106020" style="color:#0d64f4;font-weight:600;">03-3106020</a></p>
  </div>
</div>

<div style="text-align:center;padding:20px;">
  <p style="color:#bbb;font-size:12px;margin:0;">DirectFix - תיקוני סלולר מקצועיים עד הבית</p>
</div>

</div>
</body>
</html>`;

    if (preview) {
      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!customerEmail || !resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing email or API key" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const subject = couponCode 
      ? `${customerName}, יש לך הנחה מיוחדת מחכה! | DirectFix`
      : `${customerName}, ההזמנה שלך מחכה | DirectFix`;

    const result = await sendEmail(
      resendApiKey,
      "דיירקט פיקס <orders@directfix.co.il>",
      [customerEmail],
      subject,
      html
    );

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
