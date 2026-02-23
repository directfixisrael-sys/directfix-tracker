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
  orderNumber?: number;
  promotionTitle?: string;
  leadSource?: string;
  serviceType?: 'repair' | 'consultation';
  leadSourceDetails?: {
    gclid?: string;
    fbclid?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  };
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

// Build a Google Calendar link from the scheduled time string
function buildCalendarLink(orderData: OrderData): string {
  // Parse Hebrew scheduled time like "יום שני 10/2 בשעות 13:00-17:00"
  // or simpler formats like "10/2 13:00-17:00"
  const now = new Date();
  const year = now.getFullYear();
  
  // Extract date part (DD/MM)
  const dateMatch = orderData.scheduledTime.match(/(\d{1,2})\/(\d{1,2})/);
  // Extract time range (HH:MM-HH:MM)
  const timeMatch = orderData.scheduledTime.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  
  let startDate: string;
  let endDate: string;
  
  if (dateMatch && timeMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const startTime = timeMatch[1].replace(':', '');
    const endTime = timeMatch[2].replace(':', '');
    
    // Format: YYYYMMDDTHHMMSS (in local Israel time)
    startDate = `${year}${month}${day}T${startTime}00`;
    endDate = `${year}${month}${day}T${endTime}00`;
  } else {
    // Fallback - create an all-day event for today
    const todayStr = `${year}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    startDate = todayStr;
    endDate = todayStr;
  }
  
  const title = encodeURIComponent(`🔧 תיקון ${orderData.deviceType} - ${orderData.repairType}`);
  const location = encodeURIComponent(orderData.customerAddress);
  const details = encodeURIComponent(
    `👤 לקוח: ${orderData.customerName}\n` +
    `📞 טלפון: ${orderData.customerPhone}\n` +
    `📱 דגם: ${orderData.deviceType}\n` +
    `🔧 תיקון: ${orderData.repairType}\n` +
    `💰 מחיר: ₪${orderData.repairPrice}\n` +
    (orderData.notes ? `📝 הערות: ${orderData.notes}\n` : '') +
    (orderData.promotionTitle ? `🎁 מבצע: ${orderData.promotionTitle}` : '')
  );
  
  // Use Israel timezone
  const timezone = encodeURIComponent('Asia/Jerusalem');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&ctz=${timezone}`;
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

    // Build Google Calendar link
    const calendarLink = buildCalendarLink(orderData);
    console.log("Calendar link generated:", calendarLink);

    const isConsultation = orderData.serviceType === 'consultation';
    const serviceLabel = isConsultation ? 'שיחת ייעוץ' : 'תיקון';
    const serviceEmoji = isConsultation ? '📞' : '🔧';

    // 1. Send email to business owner
    const businessEmailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
    <div style="background: linear-gradient(135deg, ${isConsultation ? '#f59e0b 0%, #d97706 100%' : '#667eea 0%, #764ba2 100%'}); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${serviceEmoji} ${isConsultation ? 'שיחת ייעוץ חדשה!' : '🎉 הזמנה חדשה!'}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">התקבלה הזמנת ${serviceLabel} חדשה${orderData.orderNumber ? ` (#${orderData.orderNumber})` : ''}</p>
    </div>
    
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: right;">
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: right;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: right;">👤 פרטי לקוח</h2>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>שם:</strong> ${orderData.customerName}</p>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>טלפון:</strong> <a href="tel:${orderData.customerPhone}" style="color: #667eea;">${orderData.customerPhone}</a></p>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>כתובת:</strong> ${orderData.customerAddress}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, ${isConsultation ? '#f59e0b10 0%, #d9770610 100%' : '#667eea10 0%, #764ba210 100%'}); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid ${isConsultation ? '#f59e0b30' : '#667eea30'}; text-align: right;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: right;">${serviceEmoji} ${isConsultation ? 'פרטי הייעוץ' : 'פרטי התיקון'}</h2>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>${isConsultation ? 'נושא:' : 'דגם:'}</strong> ${orderData.deviceType}</p>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>${isConsultation ? 'תיאור:' : 'סוג תיקון:'}</strong> ${orderData.repairType}</p>
        <p style="margin: 8px 0; color: #555; text-align: right;"><strong>מחיר:</strong> <span style="color: ${isConsultation ? '#d97706' : '#667eea'}; font-weight: bold; font-size: 20px;">₪${orderData.repairPrice}</span></p>
      </div>
      
      <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffc107; text-align: right;">
        <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; text-align: right;">📅 מועד מבוקש</h2>
        <p style="margin: 0; color: #856404; font-size: 16px; font-weight: 500; text-align: right;">${orderData.scheduledTime}</p>
      </div>

      <!-- Add to Calendar Button -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${calendarLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3);">
          📅 הוסף ליומן Google
        </a>
      </div>
      
      ${orderData.notes ? `
      <div style="background: #e8f4f8; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: right;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: right;">📝 הערות</h2>
        <p style="margin: 0; color: #555; text-align: right;">${orderData.notes}</p>
      </div>
      ` : ''}
      
      ${orderData.promotionTitle ? `
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; color: white; font-weight: bold;">🎁 ${orderData.promotionTitle}</p>
      </div>
      ` : ''}

      ${orderData.leadSource ? `
      <div style="background: #e0f2fe; border-radius: 12px; padding: 20px; border: 1px solid #38bdf8; text-align: right;">
        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 18px; text-align: right;">📊 מקור הליד</h2>
        <p style="margin: 8px 0; color: #0c4a6e; font-size: 16px; font-weight: 600; text-align: right;">${orderData.leadSource}</p>
        ${orderData.leadSourceDetails?.utm_campaign ? `<p style="margin: 4px 0; color: #555; font-size: 14px; text-align: right;">קמפיין: ${orderData.leadSourceDetails.utm_campaign}</p>` : ''}
        ${orderData.leadSourceDetails?.gclid ? `<p style="margin: 4px 0; color: #888; font-size: 12px; text-align: right;">gclid: ${orderData.leadSourceDetails.gclid.substring(0, 20)}...</p>` : ''}
        ${orderData.leadSourceDetails?.fbclid ? `<p style="margin: 4px 0; color: #888; font-size: 12px; text-align: right;">fbclid: ${orderData.leadSourceDetails.fbclid.substring(0, 20)}...</p>` : ''}
        ${orderData.leadSourceDetails?.referrer ? `<p style="margin: 4px 0; color: #888; font-size: 12px; text-align: right;">referrer: ${orderData.leadSourceDetails.referrer}</p>` : ''}
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
          "דיירקט פיקס <orders@directfix.co.il>",
          ["directfixisrael@gmail.com"],
          `התקבלה הזמנה לתיקון חדש 🎉${orderData.orderNumber ? ` #${orderData.orderNumber}` : ''} - ${orderData.customerName} - ${orderData.deviceType}`,
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

${orderData.leadSource ? `📊 *מקור ליד:* ${orderData.leadSource}\n` : ''}${orderData.notes ? `📝 *הערות:* ${orderData.notes}\n` : ''}${orderData.promotionTitle ? `🎁 *מבצע:* ${orderData.promotionTitle}` : ''}`;

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
      const customerCalendarLink = buildCalendarLink(orderData);
      const trackingUrl = `https://directfix-tracker.lovable.app/track?phone=${encodeURIComponent(orderData.customerPhone)}`;
      
      const customerEmailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
    <div style="background: linear-gradient(135deg, #0d64f4 0%, #0a4dbf 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">ההזמנה התקבלה בהצלחה!</h1>
      ${orderData.orderNumber ? `<p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">הזמנה #${orderData.orderNumber}</p>` : ''}
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">תודה שבחרת ב-DirectFix, ${orderData.customerName}!</p>
    </div>
    
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: right;">
      <h2 style="margin: 0 0 20px 0; color: #333; font-size: 18px; text-align: center;">📋 סיכום ההזמנה</h2>
      
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;" dir="rtl">
          <tr>
            <td style="padding: 10px 0; color: #888; text-align: right;">📱 דגם</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: left;">${orderData.deviceType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; text-align: right;">🔧 סוג תיקון</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: left;">${orderData.repairType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; text-align: right;">📅 מועד</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: left;">${orderData.scheduledTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; text-align: right;">📍 כתובת</td>
            <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: left;">${orderData.customerAddress}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 15px 0 8px 0; color: #333; font-weight: bold; font-size: 16px; text-align: right;">💰 סה"כ לתשלום</td>
            <td style="padding: 15px 0 8px 0; color: #0d64f4; font-weight: bold; font-size: 22px; text-align: left;">₪${orderData.repairPrice}</td>
          </tr>
        </table>
      </div>
      
      ${orderData.promotionTitle ? `
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; color: white; font-weight: bold;">🎁 ${orderData.promotionTitle}</p>
      </div>
      ` : ''}

      <!-- Action Buttons -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0d64f4 0%, #0a4dbf 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(13, 100, 244, 0.3); margin-bottom: 10px;">
          📍 עקוב אחר התיקון שלך
        </a>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${customerCalendarLink}" target="_blank" style="display: inline-block; background: white; color: #333; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; border: 2px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          📅 הוסף ליומן שלי
        </a>
      </div>
      
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 15px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">💳 תשלום בסיום התיקון בלבד</p>
        <p style="margin: 0; color: #3b82f6; font-size: 14px;">ניצור איתך קשר לאישור המועד</p>
      </div>

      <div style="background: #f0fdf4; border-radius: 12px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: #166534; font-size: 14px;">🛡️ כל התיקונים שלנו כוללים אחריות מלאה</p>
      </div>
    </div>
    
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      לשאלות ובירורים: <a href="tel:033106020" style="color: #0d64f4;">03-3106020</a>
    </p>
    <p style="text-align: center; color: #bbb; font-size: 11px;">
      DirectFix - תיקוני סלולר מקצועיים עד הבית
    </p>
  </div>
</body>
</html>
      `;

      try {
        const customerEmail = await sendEmail(
          resendApiKey,
          "דיירקט פיקס <orders@directfix.co.il>",
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
