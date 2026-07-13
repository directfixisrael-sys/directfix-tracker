import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const normalize = (p: string) => (p || "").replace(/\D/g, "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phoneRaw: string = body.phone || "";
    const orderId: string | undefined = body.orderId;
    const phone = normalize(phoneRaw);

    if (!phone || phone.length < 7 || phone.length > 15) {
      return new Response(JSON.stringify({ error: "invalid_phone" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch orders for this phone (compare normalized)
    const { data: allOrders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersErr) throw ordersErr;

    const orders = (allOrders || []).filter(
      (o: any) => normalize(o.customer_phone) === phone
    );

    if (orderId) {
      const single = orders.find((o: any) => o.id === orderId);
      if (!single) {
        return new Response(JSON.stringify({ orders: [], messages: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("timestamp", { ascending: true });
      return new Response(
        JSON.stringify({ orders: [single], messages: msgs || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch messages for all matching orders
    const orderIds = orders.map((o: any) => o.id);
    let messages: any[] = [];
    if (orderIds.length) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .in("order_id", orderIds)
        .order("timestamp", { ascending: true });
      messages = msgs || [];
    }

    return new Response(JSON.stringify({ orders, messages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
