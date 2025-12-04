import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  to: string;
  customerName: string;
  orderId: string;
  trackingUrl: string;
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 972 (Israel country code)
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, add 972
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }
  
  return `whatsapp:+${cleaned}`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, customerName, orderId, trackingUrl }: WhatsAppRequest = await req.json();

    console.log("Sending WhatsApp message to:", to);
    console.log("Customer name:", customerName);
    console.log("Order ID:", orderId);
    console.log("Tracking URL:", trackingUrl);

    const formattedTo = formatPhoneNumber(to);
    
    const message = `שלום ${customerName}! 👋

ההזמנה שלך התקבלה בהצלחה ✅

לחצו על הקישור למעקב אחרי ההזמנה:
${trackingUrl}

תודה שבחרתם בנו! 🙏`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("From", TWILIO_WHATSAPP_NUMBER);
    formData.append("To", formattedTo);
    formData.append("Body", message);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const responseData = await response.json();
    console.log("Twilio response:", responseData);

    if (!response.ok) {
      console.error("Twilio error:", responseData);
      return new Response(
        JSON.stringify({ error: responseData.message || "Failed to send WhatsApp message" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: responseData.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
