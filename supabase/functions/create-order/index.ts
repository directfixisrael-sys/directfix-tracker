import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
import { z } from "npm:zod@3.23.8";

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "technician_assigned",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
  "cancelled",
]).default("pending");

const nullableText = (max = 500) => z.string().trim().max(max).optional().nullable();

const bodySchema = z.object({
  customerPhone: z.string().trim().min(7).max(20),
  customerName: z.string().trim().min(1).max(100),
  customerAddress: z.string().trim().max(500).optional().default(""),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  deviceType: z.string().trim().max(200).optional().default(""),
  issueDescription: z.string().trim().max(800).optional().default(""),
  status: statusSchema,
  estimatedArrival: nullableText(200),
  technicianName: nullableText(100),
  repairPrice: z.coerce.number().min(0).max(100000).optional().default(0),
  accessories: z.array(z.unknown()).optional().default([]),
  notes: z.array(z.string().max(1000)).max(50).optional().default([]),
  wantsPromotions: z.boolean().optional().default(false),
  leadSource: nullableText(250),
  deviceImages: z.array(z.string().url()).max(5).optional().default([]),
  isClubMember: z.boolean().optional().default(false),
  warrantyMonths: z.coerce.number().int().min(0).max(120).optional().nullable(),
  paymentStatus: z.string().trim().max(50).optional().nullable(),
  utmSource: nullableText(200),
  utmMedium: nullableText(200),
  utmCampaign: nullableText(200),
  utmContent: nullableText(200),
  utmTerm: nullableText(200),
  placement: nullableText(200),
  fbclid: nullableText(400),
  fbp: nullableText(200),
  fbc: nullableText(400),
  firstLandingUrl: nullableText(1000),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "invalid_body", details: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = parsed.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const insertData: Record<string, unknown> = {
      customer_phone: order.customerPhone,
      customer_name: order.customerName,
      customer_address: order.customerAddress || "",
      customer_email: order.customerEmail || null,
      device_type: order.deviceType || "",
      issue_description: order.issueDescription || "",
      status: order.status,
      estimated_arrival: order.estimatedArrival || null,
      technician_name: order.technicianName || null,
      repair_price: order.repairPrice,
      accessories: order.accessories,
      notes: order.notes,
      wants_promotions: order.wantsPromotions,
      lead_source: order.leadSource || null,
      device_images: order.deviceImages,
      is_club_member: order.isClubMember,
      utm_source: order.utmSource || null,
      utm_medium: order.utmMedium || null,
      utm_campaign: order.utmCampaign || null,
      utm_content: order.utmContent || null,
      utm_term: order.utmTerm || null,
      placement: order.placement || null,
      fbclid: order.fbclid || null,
      fbp: order.fbp || null,
      fbc: order.fbc || null,
      first_landing_url: order.firstLandingUrl || null,
    };

    if (order.warrantyMonths != null) insertData.warranty_months = order.warrantyMonths;
    if (order.paymentStatus) insertData.payment_status = order.paymentStatus;

    const { data, error } = await supabase
      .from("orders")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("create-order insert error", error);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-order error", error);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});