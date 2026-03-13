import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, template } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `אתה מעצב הודעות שיווקיות עבור דיירקט פיקס - שירות תיקון אייפונים.
צור הודעת WhatsApp מעוצבת ומושכת בעברית.
השתמש בפורמט WhatsApp (*bold*, _italic_) ובאימוג'ים מתאימים.
ההודעה צריכה להיות ממותגת עם השם "דיירקט פיקס".
הקפד על הודעה קצרה, מושכת ומקצועית.
החזר JSON עם שדות: subject (כותרת קצרה) ו-message (ההודעה המלאה).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `צור הודעה שיווקית על בסיס: ${prompt}${template ? ` (סוג: ${template})` : ''}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_promo",
            description: "Create a promotional message",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string", description: "Short subject line in Hebrew" },
                message: { type: "string", description: "Full WhatsApp formatted message in Hebrew with emojis" }
              },
              required: ["subject", "message"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_promo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש טעינת קרדיטים" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fallback
    const content = result.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ subject: 'מבצע מיוחד', message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("generate-club-promo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
