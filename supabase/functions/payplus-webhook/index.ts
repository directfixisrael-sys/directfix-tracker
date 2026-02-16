import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json();
    console.log('PayPlus webhook received:', JSON.stringify(body));

    // PayPlus sends transaction data with more_info containing our orderId
    const orderId = body?.more_info;
    const transactionStatus = body?.transaction?.status_code;
    
    // status_code: "000" means approved/success
    const isPaid = transactionStatus === '000' || body?.transaction?.type === 'Approval';

    if (!orderId) {
      console.error('No orderId found in webhook payload');
      return new Response(
        JSON.stringify({ error: 'No orderId in more_info field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (isPaid) {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      console.log(`Order ${orderId} marked as paid`);
    } else {
      console.log(`Payment not approved for order ${orderId}, status: ${transactionStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
