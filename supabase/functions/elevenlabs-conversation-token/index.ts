const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENT_ID = "agent_7701kpjs7b8re47a4ajhgg9q1n6a";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Get both a WebRTC token (preferred) and a signed URL (fallback)
    const [tokenRes, signedRes] = await Promise.all([
      fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT_ID}`,
        { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
      ),
      fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
        { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
      ),
    ]);

    let conversationToken: string | null = null;
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      conversationToken = tokenData?.token ?? null;
    } else {
      console.error("ElevenLabs token error:", tokenRes.status, await tokenRes.text());
    }

    let signedUrl: string | null = null;
    if (signedRes.ok) {
      const signedData = await signedRes.json();
      signedUrl = signedData?.signed_url ?? null;
    } else {
      console.error("ElevenLabs signed URL error:", signedRes.status, await signedRes.text());
    }

    if (!conversationToken && !signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to get conversation credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ conversationToken, signedUrl, agentId: AGENT_ID }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
