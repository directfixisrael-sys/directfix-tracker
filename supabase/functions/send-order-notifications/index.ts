import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deviceType: string;
  repairType: string;
  repairPrice: number;
  scheduledTime: string;
  notes: string;
  customerEmail?: string;
  promotionTitle?: string;
}

// Simple Resend API call
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();
    console.log("Received order data:", orderData);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    const results: { email?: unknown; whatsapp?: unknown; customerEmail?: unknown; businessWhatsapp?: unknown } = {};

    // Business owner phone number
    const businessPhone = "972528692886";

    // 1. Send email to business owner
    const businessEmailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 הזמנה חדשה!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">התקבלה הזמנת תיקון חדשה</p>
    </div>
    
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">👤 פרטי לקוח</h2>
        <p style="margin: 8px 0; color: #555;"><strong>שם:</strong> ${orderData.customerName}</p>
        <p style="margin: 8px 0; color: #555;"><strong>טלפון:</strong> <a href="tel:${orderData.customerPhone}" style="color: #667eea;">${orderData.customerPhone}</a></p>
        <p style="margin: 8px 0; color: #555;"><strong>כתובת:</strong> ${orderData.customerAddress}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #667eea30;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📱 פרטי התיקון</h2>
        <p style="margin: 8px 0; color: #555;"><strong>דגם:</strong> ${orderData.deviceType}</p>
        <p style="margin: 8px 0; color: #555;"><strong>סוג תיקון:</strong> ${orderData.repairType}</p>
        <p style="margin: 8px 0; color: #555;"><strong>מחיר:</strong> <span style="color: #667eea; font-weight: bold; font-size: 20px;">₪${orderData.repairPrice}</span></p>
      </div>
      
      <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffc107;">
        <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">📅 מועד מבוקש</h2>
        <p style="margin: 0; color: #856404; font-size: 16px; font-weight: 500;">${orderData.scheduledTime}</p>
      </div>
      
      ${orderData.notes ? `
      <div style="background: #e8f4f8; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📝 הערות</h2>
        <p style="margin: 0; color: #555;">${orderData.notes}</p>
      </div>
      ` : ''}
      
      ${orderData.promotionTitle ? `
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: white; font-weight: bold;">🎁 ${orderData.promotionTitle}</p>
      </div>
      ` : ''}
    </div>
    
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      הזמנה זו נשלחה אוטומטית ממערכת הזמנות התיקון
    </p>
  </div>
</body>
</html>
    `;

    if (resendApiKey) {
      try {
        const businessEmail = await sendEmail(
          resendApiKey,
          "iPhix <onboarding@resend.dev>",
          ["eliran.nissim@me.com"],
          `🎉 הזמנה חדשה - ${orderData.customerName} - ${orderData.deviceType}`,
          businessEmailHtml
        );
        results.email = businessEmail;
        console.log("Business email sent:", businessEmail);
      } catch (emailError: unknown) {
        console.error("Error sending business email:", emailError);
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        results.email = { error: errorMessage };
      }
    }

    // 2. Send WhatsApp to customer and business owner
    console.log("Twilio config check:", {
      hasSid: !!twilioAccountSid,
      hasToken: !!twilioAuthToken,
      hasWhatsAppNumber: !!twilioWhatsAppNumber,
      whatsAppNumber: twilioWhatsAppNumber
    });

    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const authString = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

      // Format the From number - ensure it has + prefix
      const fromNumber = twilioWhatsAppNumber.startsWith('+') 
        ? twilioWhatsAppNumber 
        : `+${twilioWhatsAppNumber}`;

      // 2a. Send WhatsApp to customer
      try {
        // Format phone number for WhatsApp (Israel format)
        let formattedPhone = orderData.customerPhone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '972' + formattedPhone.slice(1);
        }
        if (!formattedPhone.startsWith('972')) {
          formattedPhone = '972' + formattedPhone;
        }

        console.log("Sending WhatsApp to customer:", {
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:+${formattedPhone}`
        });

        const customerWhatsappMessage = `🎉 *ההזמנה התקבלה!*

היי ${orderData.customerName}! 👋

תודה שבחרת בנו! 💜

*פרטי ההזמנה:*
📱 ${orderData.deviceType}
🔧 ${orderData.repairType}
💰 מחיר: ₪${orderData.repairPrice}
📅 ${orderData.scheduledTime}

${orderData.promotionTitle ? `🎁 *${orderData.promotionTitle}*\n` : ''}
ניצור איתך קשר לאישור המועד.

לכל שאלה - אנחנו כאן! 📞`;

        const customerWhatsappResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:+${formattedPhone}`,
            Body: customerWhatsappMessage,
          }),
        });

        const customerWhatsappResult = await customerWhatsappResponse.json();
        results.whatsapp = customerWhatsappResult;
        console.log("Customer WhatsApp response:", JSON.stringify(customerWhatsappResult));
      } catch (whatsappError: unknown) {
        console.error("Error sending customer WhatsApp:", whatsappError);
        const errorMessage = whatsappError instanceof Error ? whatsappError.message : 'Unknown error';
        results.whatsapp = { error: errorMessage };
      }

      // 2b. Send WhatsApp to business owner
      try {
        console.log("Sending WhatsApp to business:", {
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:+${businessPhone}`
        });

        const businessWhatsappMessage = `🔔 *הזמנה חדשה!*

👤 *לקוח:* ${orderData.customerName}
📞 *טלפון:* ${orderData.customerPhone}
📍 *כתובת:* ${orderData.customerAddress}

📱 *דגם:* ${orderData.deviceType}
🔧 *תיקון:* ${orderData.repairType}
💰 *מחיר:* ₪${orderData.repairPrice}
📅 *מועד:* ${orderData.scheduledTime}

${orderData.notes ? `📝 *הערות:* ${orderData.notes}\n` : ''}${orderData.promotionTitle ? `🎁 *מבצע:* ${orderData.promotionTitle}` : ''}`;

        const businessWhatsappResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:+${businessPhone}`,
            Body: businessWhatsappMessage,
          }),
        });

        const businessWhatsappResult = await businessWhatsappResponse.json();
        results.businessWhatsapp = businessWhatsappResult;
        console.log("Business WhatsApp response:", JSON.stringify(businessWhatsappResult));
      } catch (businessWhatsappError: unknown) {
        console.error("Error sending business WhatsApp:", businessWhatsappError);
        const errorMessage = businessWhatsappError instanceof Error ? businessWhatsappError.message : 'Unknown error';
        results.businessWhatsapp = { error: errorMessage };
      }
    } else {
      console.log("Twilio WhatsApp not configured - missing credentials");
      results.whatsapp = { error: "Twilio not configured" };
    }

    // 3. Send confirmation email to customer (if email provided)
    if (orderData.customerEmail && resendApiKey) {
      const customerEmailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">ההזמנה התקבלה!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">תודה שבחרת בנו, ${orderData.customerName}!</p>
    </div>
    
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 20px 0; color: #333; font-size: 18px; text-align: center;">📋 סיכום ההזמנה</h2>
      
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888;">דגם</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500; text-align: left;">${orderData.deviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">סוג תיקון</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500; text-align: left;">${orderData.repairType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">מועד</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500; text-align: left;">${orderData.scheduledTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">כתובת</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500; text-align: left;">${orderData.customerAddress}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 15px 0 8px 0; color: #333; font-weight: bold; font-size: 16px;">סה"כ לתשלום</td>
            <td style="padding: 15px 0 8px 0; color: #10b981; font-weight: bold; font-size: 20px; text-align: left;">₪${orderData.repairPrice}</td>
          </tr>
        </table>
      </div>
      
      ${orderData.promotionTitle ? `
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; color: white; font-weight: bold;">🎁 ${orderData.promotionTitle}</p>
      </div>
      ` : ''}
      
      <div style="background: #e8f5e9; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #2e7d32; font-weight: 500;">💳 תשלום בסיום התיקון בלבד</p>
        <p style="margin: 0; color: #4caf50; font-size: 14px;">ניצור איתך קשר לאישור המועד</p>
      </div>
    </div>
    
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      לשאלות ובירורים: 052-8692886
    </p>
  </div>
</body>
</html>
      `;

      try {
        const customerEmail = await sendEmail(
          resendApiKey,
          "iPhix <onboarding@resend.dev>",
          [orderData.customerEmail],
          `✅ ההזמנה התקבלה - ${orderData.deviceType} ${orderData.repairType}`,
          customerEmailHtml
        );
        results.customerEmail = customerEmail;
        console.log("Customer email sent:", customerEmail);
      } catch (customerEmailError: unknown) {
        console.error("Error sending customer email:", customerEmailError);
        const errorMessage = customerEmailError instanceof Error ? customerEmailError.message : 'Unknown error';
        results.customerEmail = { error: errorMessage };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-order-notifications:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
