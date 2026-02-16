import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPLUS_API_URL = 'https://restapi.payplus.co.il/api/v1.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYPLUS_API_KEY = Deno.env.get('PAYPLUS_API_KEY');
    const PAYPLUS_SECRET_KEY = Deno.env.get('PAYPLUS_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!PAYPLUS_API_KEY) {
      throw new Error('PAYPLUS_API_KEY is not configured');
    }
    if (!PAYPLUS_SECRET_KEY) {
      throw new Error('PAYPLUS_SECRET_KEY is not configured');
    }

    const { orderId, amount, customerName, customerPhone, description } = await req.json();

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: 'orderId and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the webhook URL for callbacks
    const functionUrl = `${SUPABASE_URL}/functions/v1/payplus-webhook`;

    // Generate payment link via PayPlus API
    const paymentResponse = await fetch(`${PAYPLUS_API_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PAYPLUS_API_KEY,
        'secret-key': PAYPLUS_SECRET_KEY,
      },
      body: JSON.stringify({
        payment_page_uid: '',
        charge_method: 1, // Regular charge
        amount,
        currency_code: 'ILS',
        description: description || `תשלום עבור תיקון - ${customerName || ''}`,
        more_info: orderId,
        customer: {
          customer_name: customerName || '',
          phone: customerPhone || '',
        },
        status_approve_url: functionUrl,
        status_failure_url: functionUrl,
        sendEmailApproval: false,
        sendEmailFailure: false,
        hide_other_charge_methods: false,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || paymentData?.results?.status !== 'success') {
      console.error('PayPlus API error:', JSON.stringify(paymentData));
      throw new Error(`PayPlus API error [${paymentResponse.status}]: ${JSON.stringify(paymentData?.results || paymentData)}`);
    }

    const paymentPageLink = paymentData?.data?.payment_page_link;

    if (!paymentPageLink) {
      throw new Error('No payment link returned from PayPlus');
    }

    // Save the payment link to the order
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_link: paymentPageLink,
        payment_status: 'pending',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order with payment link:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentLink: paymentPageLink,
        pageRequestUid: paymentData?.data?.page_request_uid,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error creating payment link:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
