import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerName, message, orderNumber } = await req.json();

    if (!orderId || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check throttle: query messages table for last email-notified customer message
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check last customer message timestamp for this order (excluding the current one)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("timestamp")
      .eq("order_id", orderId)
      .eq("sender", "customer")
      .gte("timestamp", threeHoursAgo)
      .order("timestamp", { ascending: false })
      .limit(2);

    // If there are 2+ customer messages in last 3 hours, skip (the current one + at least one older)
    if (recentMessages && recentMessages.length >= 2) {
      return new Response(JSON.stringify({ skipped: true, reason: "throttled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderNum = orderNumber ? `#${orderNumber}` : "";
    const subject = `💬 הודעה חדשה מלקוח ${customerName} ${orderNum}`;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">💬 הודעה חדשה מלקוח</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748b; width: 120px;">שם לקוח:</td>
              <td style="padding: 8px 12px; font-weight: bold; color: #1e293b;">${customerName}</td>
            </tr>
            ${orderNumber ? `
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #64748b;">מספר הזמנה:</td>
              <td style="padding: 8px 12px; color: #1e293b;">#${orderNumber}</td>
            </tr>` : ""}
          </table>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 8px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">תוכן ההודעה:</p>
            <p style="color: #1e293b; font-size: 16px; margin: 0; line-height: 1.6;">${message}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://directfix.co.il/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              פתח פאנל ניהול
            </a>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "דיירקט פיקס <orders@directfix.co.il>",
        to: ["directfixil@gmail.com"],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    return new Response(JSON.stringify({ success: true, emailResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
