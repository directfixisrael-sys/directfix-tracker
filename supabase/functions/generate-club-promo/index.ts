import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, template, generateImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Generate text message
    const textSystemPrompt = `אתה מעצב הודעות שיווקיות עבור דיירקט פיקס - שירות תיקון אייפונים.
צור הודעת WhatsApp מעוצבת ומושכת בעברית.
השתמש בפורמט WhatsApp (*bold*, _italic_) ובאימוג'ים מתאימים.
ההודעה צריכה להיות ממותגת עם השם "דיירקט פיקס".
הקפד על הודעה קצרה, מושכת ומקצועית.`;

    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: textSystemPrompt },
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
                message: { type: "string", description: "Full WhatsApp formatted message in Hebrew with emojis" },
                imagePrompt: { type: "string", description: "A short English prompt to generate a matching promotional banner image. Include: modern phone repair theme, blue brand colors, clean professional design." }
              },
              required: ["subject", "message", "imagePrompt"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_promo" } },
      }),
    });

    if (!textResponse.ok) {
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (textResponse.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש טעינת קרדיטים" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const t = await textResponse.text();
      console.error("AI text error:", textResponse.status, t);
      throw new Error(`AI gateway error: ${textResponse.status}`);
    }

    const textResult = await textResponse.json();
    const toolCall = textResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let subject = 'מבצע מיוחד';
    let message = '';
    let imagePrompt = '';

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      subject = parsed.subject || subject;
      message = parsed.message || '';
      imagePrompt = parsed.imagePrompt || '';
    } else {
      message = textResult.choices?.[0]?.message?.content || '';
    }

    // Step 2: Generate image if requested
    let imageBase64 = null;
    if (generateImage && imagePrompt) {
      try {
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              { role: "user", content: imagePrompt + '. Include text "DirectFix" as brand logo. Modern, sleek banner design for WhatsApp, 16:9 aspect ratio.' }
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imgResponse.ok) {
          const imgResult = await imgResponse.json();
          const imgUrl = imgResult.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imgUrl) {
            imageBase64 = imgUrl;
          }
        } else {
          console.error("Image generation failed:", imgResponse.status);
        }
      } catch (imgErr) {
        console.error("Image generation error:", imgErr);
        // Continue without image
      }
    }

    return new Response(JSON.stringify({ subject, message, image: imageBase64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("generate-club-promo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
