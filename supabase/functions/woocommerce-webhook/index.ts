import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // API Key validation (simple approach - in production use more secure method)
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('WORDPRESS_API_KEY');
    
    if (apiKey !== expectedApiKey) {
      console.log('Invalid API key');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET - Fetch all orders
    if (req.method === 'GET' && action === 'get_orders') {
      console.log('Fetching all orders');
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create order from WooCommerce
    if (req.method === 'POST' && action === 'create_order') {
      const body = await req.json();
      console.log('Creating order from WooCommerce:', body);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          customer_address: body.customer_address || '',
          device_type: body.device_type || body.product_name || '',
          issue_description: body.issue_description || body.order_notes || '',
          repair_price: body.repair_price || body.order_total || 0,
          status: 'pending',
          notes: body.woo_order_id ? [`WooCommerce Order #${body.woo_order_id}`] : [],
        })
        .select()
        .single();

      if (error) throw error;

      // Generate tracking URL
      const trackingUrl = `${req.headers.get('origin') || 'https://your-app.lovable.app'}/?phone=${encodeURIComponent(body.customer_phone)}`;

      return new Response(JSON.stringify({ 
        success: true, 
        order,
        tracking_url: trackingUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Update order status
    if (req.method === 'POST' && action === 'update_status') {
      const body = await req.json();
      console.log('Updating order status:', body);

      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: body.status })
        .eq('id', body.order_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Send WhatsApp tracking link
    if (req.method === 'POST' && action === 'send_tracking') {
      const body = await req.json();
      console.log('Generating WhatsApp link for:', body);

      const trackingUrl = `${body.app_url || 'https://your-app.lovable.app'}/?phone=${encodeURIComponent(body.customer_phone)}`;
      const message = `שלום ${body.customer_name}! 🔧\nעקבו אחר התיקון שלכם בזמן אמת:\n${trackingUrl}`;
      
      // Format phone for WhatsApp
      let phone = body.customer_phone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '972' + phone.substring(1);
      }
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      return new Response(JSON.stringify({ 
        success: true, 
        whatsapp_url: whatsappUrl,
        tracking_url: trackingUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
