import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

// Simple password hashing using Web Crypto API (PBKDF2)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const hashBytes = new Uint8Array(derivedBits);
  const saltHex = new TextDecoder().decode(hexEncode(salt));
  const hashHex = new TextDecoder().decode(hexEncode(hashBytes));
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const encoder = new TextEncoder();
  // Decode hex salt
  const saltBytes = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const newHashHex = new TextDecoder().decode(hexEncode(new Uint8Array(derivedBits)));
  return newHashHex === hashHex;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, phone, password, email, name, token, birthday } = await req.json();
    const normalizedPhone = phone?.replace(/\D/g, "") || "";

    if (!action) {
      return new Response(JSON.stringify({ error: "action is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CHECK if phone has orders (for registration eligibility) ──
    if (action === "check_phone") {
      if (!normalizedPhone || normalizedPhone.length < 9) {
        return new Response(JSON.stringify({ error: "invalid phone" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if profile already exists
      const { data: existing } = await supabase
        .from("customer_profiles")
        .select("id, name")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ status: "has_profile", name: existing.name }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if has orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .eq("customer_phone", normalizedPhone)
        .limit(1);

      if (orders && orders.length > 0) {
        return new Response(
          JSON.stringify({
            status: "can_register",
            name: orders[0].customer_name || "",
            email: orders[0].customer_email || "",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ status: "no_orders" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── REGISTER ──
    if (action === "register") {
      if (!normalizedPhone || !password || password.length < 6) {
        return new Response(
          JSON.stringify({ error: "phone and password (min 6 chars) required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify phone has orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_phone", normalizedPhone)
        .limit(1);

      if (!orders || orders.length === 0) {
        return new Response(
          JSON.stringify({ error: "no_orders" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from("customer_profiles")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: "already_registered" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const hash = await hashPassword(password);

      const { error: insertError } = await supabase
        .from("customer_profiles")
        .insert({
          phone: normalizedPhone,
          email: email || null,
          password_hash: hash,
          name: name || "",
          is_verified: true,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "registration_failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send confirmation email if email provided
      if (email) {
        try {
          const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
          if (RESEND_API_KEY) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "דיירקט פיקס <orders@directfix.co.il>",
                to: [email],
                subject: "הרישום הושלם בהצלחה - דיירקט פיקס",
                html: `
                  <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;">
                    <h2 style="color:#1a1a1a;text-align:center;">הרישום הושלם בהצלחה! ✓</h2>
                    <p style="color:#555;text-align:center;">שלום ${name || ""},</p>
                    <p style="color:#555;text-align:center;">הפרופיל שלך באזור האישי של דיירקט פיקס נוצר בהצלחה.</p>
                    <p style="color:#555;text-align:center;">כעת תוכל/י להתחבר עם מספר הטלפון והסיסמא שבחרת.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                    <p style="color:#999;text-align:center;font-size:12px;">דיירקט פיקס - תיקוני סלולר עד הבית</p>
                  </div>
                `,
              }),
            });
          }
        } catch (e) {
          console.error("Email send error:", e);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── LOGIN ──
    if (action === "login") {
      if (!normalizedPhone || !password) {
        return new Response(
          JSON.stringify({ error: "phone and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id, phone, name, email, password_hash")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: "invalid_credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const valid = await verifyPassword(password, profile.password_hash);
      if (!valid) {
        return new Response(
          JSON.stringify({ error: "invalid_credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── FORGOT PASSWORD ──
    if (action === "forgot_password") {
      if (!normalizedPhone) {
        return new Response(
          JSON.stringify({ error: "phone required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id, email, name")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (!profile || !profile.email) {
        return new Response(
          JSON.stringify({ error: "no_profile_or_email" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await supabase
        .from("customer_profiles")
        .update({ reset_token: resetToken, reset_token_expires_at: expiresAt })
        .eq("id", profile.id);

      // Send reset email
      try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "דיירקט פיקס <orders@directfix.co.il>",
              to: [profile.email],
              subject: "איפוס סיסמא - דיירקט פיקס",
              html: `
                <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;">
                  <h2 style="color:#1a1a1a;text-align:center;">איפוס סיסמא</h2>
                  <p style="color:#555;text-align:center;">שלום ${profile.name || ""},</p>
                  <p style="color:#555;text-align:center;">קיבלנו בקשה לאיפוס הסיסמא שלך.</p>
                  <p style="color:#555;text-align:center;">קוד האיפוס שלך:</p>
                  <div style="text-align:center;margin:20px 0;">
                    <span style="background:#f4f4f4;padding:15px 30px;font-size:28px;font-weight:bold;letter-spacing:4px;border-radius:12px;display:inline-block;">
                      ${resetToken.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <p style="color:#999;text-align:center;font-size:13px;">הקוד תקף לשעה אחת</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
                  <p style="color:#999;text-align:center;font-size:12px;">דיירקט פיקס - תיקוני סלולר עד הבית</p>
                </div>
              `,
            }),
          });
        }
      } catch (e) {
        console.error("Email send error:", e);
      }

      // Mask email for display
      const maskedEmail = profile.email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c
      );

      return new Response(
        JSON.stringify({ success: true, maskedEmail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── RESET PASSWORD ──
    if (action === "reset_password") {
      if (!normalizedPhone || !token || !password || password.length < 6) {
        return new Response(
          JSON.stringify({ error: "phone, token, and new password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id, reset_token, reset_token_expires_at")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (!profile || !profile.reset_token) {
        return new Response(
          JSON.stringify({ error: "invalid_token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check token matches (first 6 chars uppercase)
      if (profile.reset_token.slice(0, 6).toUpperCase() !== token.toUpperCase()) {
        return new Response(
          JSON.stringify({ error: "invalid_token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check expiry
      if (profile.reset_token_expires_at && new Date(profile.reset_token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "token_expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const hash = await hashPassword(password);

      await supabase
        .from("customer_profiles")
        .update({
          password_hash: hash,
          reset_token: null,
          reset_token_expires_at: null,
        })
        .eq("id", profile.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── GET PROFILE ──
    if (action === "get_profile") {
      if (!normalizedPhone) {
        return new Response(JSON.stringify({ error: "phone required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("customer_profiles")
        .select("id, name, email, birthday, phone")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (!profile) {
        return new Response(JSON.stringify({ error: "not_found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ name: profile.name, email: profile.email, birthday: profile.birthday, phone: profile.phone }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── UPDATE PROFILE ──
    if (action === "update_profile") {
      if (!normalizedPhone) {
        return new Response(JSON.stringify({ error: "phone required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updates: Record<string, any> = {};
      if (email !== undefined) updates.email = email || null;
      if (req.url) {
        // birthday comes from the parsed body
        const body = { email, birthday: (await req.clone().json().catch(() => ({}))).birthday };
        // We already parsed the body above, need to use the original parsed values
      }
      
      // Re-parse isn't possible since body was consumed. Use a different approach:
      // The birthday variable is already extracted at the top from the parsed body
      const bodyData = { email, birthday: undefined as string | undefined };
      
      return new Response(JSON.stringify({ error: "unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
