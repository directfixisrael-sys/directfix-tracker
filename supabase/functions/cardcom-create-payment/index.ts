const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, orderId, customerName, customerPhone, productName, successUrl, errorUrl } = await req.json();

    const terminalNumber = Deno.env.get('CARDCOM_TERMINAL_NUMBER');
    const apiName = Deno.env.get('CARDCOM_API_NAME');
    const apiPassword = Deno.env.get('CARDCOM_API_PASSWORD');

    if (!terminalNumber || !apiName || !apiPassword) {
      console.error('Missing Cardcom credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating Cardcom payment: ₪${amount} for order ${orderId}`);

    const response = await fetch('https://secure.cardcom.solutions/api/v11/LowProfile/Create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TerminalNumber: parseInt(terminalNumber),
        ApiName: apiName,
        ApiPassword: apiPassword,
        Amount: amount,
        Currency: 1, // ILS
        Operation: "ChargeOnly",
        Language: "he",
        ProductName: productName || 'מקדמה - רכישת מכשיר',
        ReturnValue: orderId || '',
        SuccessRedirectUrl: successUrl || '',
        ErrorRedirectUrl: errorUrl || '',
        IndicatorUrl: '', // webhook - can be added later
        DocTypeToCreate: 3, // Invoice
        InvoiceHead: {
          CustName: customerName || '',
          Phone: customerPhone || '',
          Language: 'he',
        },
        MaxNumOfPayments: 3,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.Url || !data.LowProfileId || data.Url.includes('GeneralMassage')) {
      console.error('Cardcom API error:', JSON.stringify(data));
      const errorMsg = data.Description || (data.Url?.includes('No permission') ? 'LowProfile module not enabled on terminal' : 'Payment page creation failed');
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cardcom payment page created successfully, LowProfileId:', data.LowProfileId);

    return new Response(
      JSON.stringify({
        success: true,
        url: data.Url,
        lowProfileId: data.LowProfileId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
