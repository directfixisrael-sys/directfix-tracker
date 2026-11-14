import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BYTES = 10 * 1024 * 1024;

const RULES: Record<string, { types: string[]; exts: string[] }> = {
  "device-images": {
    types: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"],
    exts: ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"],
  },
  resumes: {
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ],
    exts: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
  },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const form = await req.formData();
    const bucket = String(form.get("bucket") || "");
    const file = form.get("file");
    const rule = RULES[bucket];
    if (!rule) return json({ error: "invalid_bucket" }, 400);
    if (!(file instanceof File)) return json({ error: "missing_file" }, 400);
    if (file.size === 0 || file.size > MAX_BYTES) return json({ error: "invalid_size" }, 400);

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!rule.exts.includes(ext)) return json({ error: "invalid_type" }, 400);
    if (file.type && !rule.types.includes(file.type)) return json({ error: "invalid_type" }, 400);

    const path = `${Date.now()}_${crypto.randomUUID()}.${ext}`;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) {
      console.error("public-upload error", error);
      return json({ error: "upload_failed" }, 500);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return json({ path, publicUrl: data.publicUrl });
  } catch (e) {
    console.error("public-upload server error", e);
    return json({ error: "server_error" }, 500);
  }
});
