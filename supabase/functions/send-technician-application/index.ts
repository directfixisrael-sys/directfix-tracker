import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationData {
  name: string;
  experience: string;
  phone: string;
  email: string;
  serviceAreas?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
}

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ApplicationData = await req.json();
    console.log("Received technician application:", data);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const areasHtml = data.serviceAreas && data.serviceAreas.length > 0
      ? data.serviceAreas.join(', ')
      : 'לא צוין';

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
    <div style="background: linear-gradient(135deg, #0d64f4 0%, #0a4dbf 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <div style="font-size: 50px; margin-bottom: 10px;">👨‍🔧</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">בקשת הצטרפות - טכנאי חדש</h1>
    </div>
    
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: right;">
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">פרטי המועמד</h2>
        <p style="margin: 8px 0; color: #555;"><strong>שם מלא:</strong> ${data.name}</p>
        <p style="margin: 8px 0; color: #555;"><strong>שנות ניסיון:</strong> ${data.experience}</p>
        <p style="margin: 8px 0; color: #555;"><strong>אזורי שירות:</strong> ${areasHtml}</p>
        <p style="margin: 8px 0; color: #555;"><strong>טלפון:</strong> <a href="tel:${data.phone}" style="color: #0d64f4;">${data.phone}</a></p>
        <p style="margin: 8px 0; color: #555;"><strong>אימייל:</strong> <a href="mailto:${data.email}" style="color: #0d64f4;">${data.email}</a></p>
      </div>
      
      ${data.resumeUrl ? `
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${data.resumeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0d64f4 0%, #0a4dbf 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: bold;">
          📄 הורד קורות חיים${data.resumeFileName ? ` (${data.resumeFileName})` : ''}
        </a>
      </div>
      ` : '<p style="color: #888; text-align: center;">לא צורפו קורות חיים</p>'}
    </div>
    
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      בקשה זו נשלחה אוטומטית מדף הגיוס באתר דיירקט פיקס
    </p>
  </div>
</body>
</html>
    `;

    const result = await sendEmail(
      resendApiKey,
      "דיירקט פיקס <orders@directfix.co.il>",
      ["directfixisrael@gmail.com"],
      `בקשת הצטרפות טכנאי - ${data.name}`,
      html
    );

    console.log("Email sent:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
