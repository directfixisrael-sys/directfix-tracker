import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PAYPLUS_API_URL = 'https://restapi.payplus.co.il/api/v1.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PAYPLUS_API_KEY');
    const secretKey = Deno.env.get('PAYPLUS_SECRET_KEY');
    const paymentPageUid = Deno.env.get('PAYPLUS_PAYMENT_PAGE_UID');

    if (!apiKey || !secretKey) {
      throw new Error('PayPlus API credentials not configured');
    }

    if (!paymentPageUid) {
      throw new Error('PayPlus payment page UID not configured');
    }

    const { amount, description, customerName, customerPhone, customerEmail, orderId, moreInfo, successUrl, failureUrl } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: Record<string, any> = {
      payment_page_uid: paymentPageUid,
      charge_method: 1,
      amount,
      currency_code: 'ILS',
      description: description || 'תשלום DirectFix',
      more_info: moreInfo || orderId || '',
      more_info_1: customerName || '',
      more_info_2: customerPhone || '',
      more_info_3: customerEmail || '',
      refURL_success: successUrl || '',
      refURL_failure: failureUrl || '',
      sendEmailApproval: !!customerEmail,
      customer: {} as Record<string, any>,
    };

    if (customerName) payload.customer.customer_name = customerName;
    if (customerPhone) payload.customer.phone = customerPhone;
    if (customerEmail) payload.customer.email = customerEmail;

    console.log('Creating PayPlus payment link:', { amount, description, customerName });

    const response = await fetch(`${PAYPLUS_API_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': JSON.stringify({ api_key: apiKey, secret_key: secretKey }),
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('PayPlus raw response:', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('PayPlus returned non-JSON:', responseText);
      throw new Error(`PayPlus authentication failed: ${responseText}`);
    }

    if (!response.ok || data.results?.status === 'error') {
      console.error('PayPlus API error:', JSON.stringify(data));
      throw new Error(`PayPlus API error [${response.status}]: ${data.results?.description || JSON.stringify(data)}`);
    }

    console.log('PayPlus link created successfully:', data.data?.payment_page_link);

    return new Response(
      JSON.stringify({
        success: true,
        paymentLink: data.data?.payment_page_link,
        pageRequestUid: data.data?.page_request_uid,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PayPlus error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
