import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const nullableStr = (max = 500) => z.string().trim().max(max).optional().nullable();

const trackSchema = z.object({
  action: z.literal("track"),
  eventName: z.enum(["PageView", "ViewContent", "InitiateCheckout", "Lead", "Purchase"]),
  eventId: z.string().trim().min(4).max(100),
  eventSourceUrl: nullableStr(1000),
  visitorId: nullableStr(120),
  page: nullableStr(300),
  value: z.coerce.number().min(0).max(1000000).optional().nullable(),
  currency: z.string().trim().max(10).optional().default("ILS"),
  contentName: nullableStr(200),
  orderId: z.string().uuid().optional().nullable(),
  user: z
    .object({
      email: nullableStr(200),
      phone: nullableStr(40),
      firstName: nullableStr(100),
    })
    .optional()
    .default({}),
  attribution: z
    .object({
      utm_source: nullableStr(200),
      utm_medium: nullableStr(200),
      utm_campaign: nullableStr(200),
      utm_content: nullableStr(200),
      utm_term: nullableStr(200),
      placement: nullableStr(200),
      fbclid: nullableStr(400),
      fbp: nullableStr(200),
      fbc: nullableStr(400),
      first_landing_url: nullableStr(1000),
      referrer: nullableStr(1000),
    })
    .optional()
    .default({}),
});

const bodySchema = z.union([z.object({ action: z.literal("config") }), trackSchema]);

const sha256 = async (value: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "700713421501028";
  const ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN");

  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json({ error: "invalid_body", details: parsed.error.flatten() }, 400);
    }

    if (parsed.data.action === "config") {
      return json({ pixelId: PIXEL_ID ?? null });
    }

    const body = parsed.data;
    const attr = body.attribution ?? {};

    // 1. Persist for the admin funnel (never blocks the CAPI call)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: logError } = await supabase.from("marketing_events").insert({
      event_name: body.eventName,
      event_id: body.eventId,
      visitor_id: body.visitorId ?? null,
      page: body.page ?? null,
      value: body.value ?? null,
      currency: body.currency || "ILS",
      utm_source: attr.utm_source ?? null,
      utm_medium: attr.utm_medium ?? null,
      utm_campaign: attr.utm_campaign ?? null,
      utm_content: attr.utm_content ?? null,
      utm_term: attr.utm_term ?? null,
      placement: attr.placement ?? null,
      fbclid: attr.fbclid ?? null,
      fbp: attr.fbp ?? null,
      fbc: attr.fbc ?? null,
      first_landing_url: attr.first_landing_url ?? null,
      referrer: attr.referrer ?? null,
      order_id: body.orderId ?? null,
    });
    if (logError) console.error("marketing_events insert error", logError);

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return json({ logged: true, capi: "skipped_missing_credentials" });
    }

    // 2. Conversions API (server side)
    const userData: Record<string, unknown> = {};
    if (body.user?.email) userData.em = [await sha256(body.user.email.trim().toLowerCase())];
    if (body.user?.phone) userData.ph = [await sha256(normalizePhone(body.user.phone))];
    if (body.user?.firstName) userData.fn = [await sha256(body.user.firstName.trim().toLowerCase())];
    if (attr.fbp) userData.fbp = attr.fbp;
    if (attr.fbc) userData.fbc = attr.fbc;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) userData.client_ip_address = ip;
    const ua = req.headers.get("user-agent");
    if (ua) userData.client_user_agent = ua;

    const customData: Record<string, unknown> = {};
    if (body.value != null) {
      customData.value = body.value;
      customData.currency = body.currency || "ILS";
    }
    if (body.contentName) customData.content_name = body.contentName;
    if (attr.utm_campaign) customData.campaign = attr.utm_campaign;
    if (attr.placement) customData.placement = attr.placement;

    const payload = {
      data: [
        {
          event_name: body.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.eventId,
          event_source_url: body.eventSourceUrl ?? undefined,
          action_source: "website",
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Meta CAPI error", result);
      return json({ logged: true, capi: "failed" }, 200);
    }

    return json({ logged: true, capi: "sent", eventsReceived: result?.events_received ?? null });
  } catch (error) {
    console.error("meta-capi error", error);
    return json({ error: "server_error" }, 500);
  }
});
