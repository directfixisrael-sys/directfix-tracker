import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function getWarrantyInfo(issueDescription: string): { duration: string; details: string; months: number } {
  const lower = issueDescription.toLowerCase();
  if (lower.includes('סוללה') || lower.includes('battery')) {
    return { 
      duration: 'שנה (12 חודשים)', 
      details: 'אחריות מלאה על סוללות מקוריות למשך שנה מיום התיקון. האחריות מכסה תקלות בטעינה, ירידת ביצועים חריגה וכל פגם ייצור.',
      months: 12
    };
  }
  if (lower.includes('מסך') || lower.includes('screen')) {
    return { 
      duration: '3 חודשים (90 ימים)', 
      details: 'אחריות על תקלות מסך למשך 90 ימים מיום התיקון. האחריות אינה כוללת שבר, נזק פיזי, נפילה או נזק ממים. האחריות מכסה פיקסלים מתים, בעיות תצוגה ותקלות מגע.',
      months: 3
    };
  }
  if (lower.includes('טעינה') || lower.includes('שקע') || lower.includes('charging')) {
    return { duration: '6 חודשים', details: 'אחריות על שקע טעינה למשך 6 חודשים מיום התיקון.', months: 6 };
  }
  return { duration: '3 חודשים', details: 'אחריות כללית למשך 3 חודשים מיום התיקון.', months: 3 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, preview } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get loyalty points earned
    const { data: pointsData } = await supabase
      .from("loyalty_points")
      .select("points")
      .eq("order_id", orderId)
      .eq("type", "earned");
    
    const pointsEarned = pointsData?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;

    // Get total points
    const { data: allPoints } = await supabase
      .from("loyalty_points")
      .select("points, type")
      .eq("customer_phone", order.customer_phone);
    
    const totalPoints = allPoints?.reduce((sum: number, p: any) => {
      return sum + (p.type === 'earned' ? p.points : -p.points);
    }, 0) || 0;

    const warranty = getWarrantyInfo(order.issue_description);
    const completedDate = order.completed_at ? new Date(order.completed_at) : new Date();
    const expiryDate = new Date(completedDate);
    expiryDate.setMonth(expiryDate.getMonth() + warranty.months);
    
    const formatDate = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

    const unsubPhone = order.customer_phone.replace(/\D/g, '');
    const unsubToken = btoa(unsubPhone + "_directfix_unsub");
    const unsubUrl = `${supabaseUrl}/functions/v1/handle-club-unsubscribe?phone=${encodeURIComponent(unsubPhone)}&token=${encodeURIComponent(unsubToken)}`;

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;direction:rtl;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

<!-- Header -->
<div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);border-radius:16px 16px 0 0;padding:40px 30px;text-align:center;">
  <div style="font-size:56px;margin-bottom:12px;">&#9989;</div>
  <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">התיקון הושלם בהצלחה!</h1>
  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">${order.customer_name}, המכשיר שלך מוכן</p>
  ${order.order_number ? `<p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">הזמנה #${order.order_number}</p>` : ''}
</div>

<div style="background:#fff;border-radius:0 0 16px 16px;padding:30px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

  <!-- Order Details -->
  <div style="background:#f8fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
    <h2 style="margin:0 0 16px;color:#333;font-size:18px;text-align:right;">סיכום התיקון</h2>
    <table style="width:100%;border-collapse:collapse;" dir="rtl">
      <tr><td style="padding:10px 0;color:#888;font-size:16px;text-align:right;">מכשיר</td><td style="padding:10px 0;color:#333;font-weight:600;font-size:16px;text-align:left;">${order.device_type}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:16px;text-align:right;">תיקון</td><td style="padding:10px 0;color:#333;font-weight:600;font-size:16px;text-align:left;">${order.issue_description}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:16px;text-align:right;">תאריך השלמה</td><td style="padding:10px 0;color:#333;font-weight:600;font-size:16px;text-align:left;">${formatDate(completedDate)}</td></tr>
      <tr style="border-top:2px solid #e5e7eb;"><td style="padding:15px 0 8px;color:#333;font-weight:bold;font-size:18px;text-align:right;">סה"כ שולם</td><td style="padding:15px 0 8px;color:#16a34a;font-weight:bold;font-size:24px;text-align:left;">₪${order.repair_price}</td></tr>
    </table>
  </div>

  <!-- Invoice Button -->
  ${order.invoice_link ? `
  <div style="text-align:center;margin-bottom:20px;">
    <a href="${order.invoice_link}" target="_blank" style="display:inline-block;background:#f8fafb;color:#333;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;border:2px solid #e5e7eb;">
      &#128196; הורד חשבונית
    </a>
  </div>` : ''}

  <!-- Warranty Section -->
  <div style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid #93c5fd;">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-size:36px;">&#128737;</span>
      <h2 style="color:#1e40af;margin:8px 0 4px;font-size:20px;font-weight:800;">תעודת אחריות</h2>
      <p style="color:#3b82f6;margin:0;font-size:16px;font-weight:600;">${warranty.duration}</p>
    </div>
    <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:16px;text-align:right;">
      <p style="margin:0 0 10px;color:#555;font-size:15px;line-height:1.8;">${warranty.details}</p>
      <div style="border-top:1px solid #93c5fd;padding-top:12px;margin-top:12px;">
        <table style="width:100%;border-collapse:collapse;" dir="rtl">
          <tr><td style="padding:6px 0;color:#888;font-size:15px;">תאריך תיקון:</td><td style="padding:6px 0;color:#1e40af;font-weight:600;font-size:15px;text-align:left;">${formatDate(completedDate)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:15px;">תוקף אחריות עד:</td><td style="padding:6px 0;color:#1e40af;font-weight:700;font-size:15px;text-align:left;">${formatDate(expiryDate)}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <!-- Warranty Coverage Button -->
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://directfix-tracker.lovable.app/track?phone=${encodeURIComponent(order.customer_phone)}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(37,99,235,0.3);">
      &#128737; מה כוללת האחריות שלי?
    </a>
  </div>

  <!-- Points Section -->
  ${pointsEarned > 0 ? `
  <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid #f59e0b;text-align:center;">
    <span style="font-size:36px;">&#127942;</span>
    <h3 style="color:#92400e;margin:8px 0 4px;font-size:20px;font-weight:800;">הרווחת ${pointsEarned} נקודות!</h3>
    <p style="color:#a16207;margin:0;font-size:16px;">סה"כ ${totalPoints} נקודות ברשותך (שוות ₪${(totalPoints * 0.5).toFixed(0)} הנחה)</p>
  </div>` : ''}

  <!-- Track Order -->
  <div style="text-align:center;margin-bottom:20px;">
    <a href="https://directfix-tracker.lovable.app/track?phone=${encodeURIComponent(order.customer_phone)}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0d64f4 0%,#0a4dbf 100%);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(13,100,244,0.3);">
      &#128100; כניסה לאיזור האישי
    </a>
  </div>

  <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;">
    <p style="margin:0;color:#166534;font-size:15px;font-weight:600;">תודה שבחרתם ב-DirectFix!</p>
    <p style="margin:6px 0 0;color:#22c55e;font-size:14px;">מקווים לראותכם שוב</p>
  </div>
</div>

<!-- Footer -->
<div style="text-align:center;padding:20px;">
  <p style="color:#999;font-size:13px;margin:0 0 8px;">
    לשאלות ובירורים: <a href="tel:033106020" style="color:#0d64f4;">03-3106020</a>
  </p>
  <p style="color:#bbb;font-size:12px;margin:0 0 16px;">DirectFix - תיקוני סלולר מקצועיים עד הבית</p>
  <div style="border-top:1px solid #e5e7eb;padding-top:16px;">
    <a href="${unsubUrl}" style="color:#999;font-size:12px;text-decoration:underline;">הסרה מרשימת התפוצה</a>
  </div>
</div>

</div>
</body>
</html>`;

    if (preview) {
      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!order.customer_email || !resendApiKey) {
      return new Response(JSON.stringify({ error: "No customer email or API key" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const result = await sendEmail(
      resendApiKey,
      "דיירקט פיקס <orders@directfix.co.il>",
      [order.customer_email],
      `התיקון הושלם - ${order.device_type} | DirectFix`,
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
