import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEXT_STYLE_PROMPTS: Record<string, string> = {
  marketing_heavy: 'כתוב הודעה שיווקית אגרסיבית עם הרבה אימוג\'ים, קריאות לפעולה חזקות וטקסט מושך.',
  marketing_light: 'כתוב הודעה שיווקית מאוזנת עם מעט אימוג\'ים ושפה נעימה ומקצועית.',
  professional: 'כתוב הודעה מקצועית ורשמית ללא אימוג\'ים כלל. שפה עסקית ומכובדת.',
  minimal: 'כתוב הודעה קצרה וענייינית בלי קישוטים, בלי אימוג\'ים. ישירות לעניין.',
};

const IMAGE_STYLE_PROMPTS: Record<string, string> = {
  banner: 'Create a modern promotional banner for a phone repair service. Clean design with bold text areas, blue brand colors, professional marketing banner style.',
  product: 'Create a product showcase image featuring a smartphone being repaired. Clean white background, professional product photography style, blue accents.',
  abstract: 'Create an abstract geometric graphic design with modern shapes, gradients in blue and white tones, suitable for a tech brand promotional material.',
  photo: 'Create a realistic photo of a professional technician repairing an iPhone in a clean modern workshop. Natural lighting, professional setting.',
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, template, generateImage, textStyle, imageStyle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const styleInstruction = TEXT_STYLE_PROMPTS[textStyle] || TEXT_STYLE_PROMPTS.marketing_light;

    const textSystemPrompt = `אתה מעצב הודעות שיווקיות עבור דיירקט פיקס - שירות תיקון אייפונים.
צור הודעת מייל מעוצבת בעברית.
${styleInstruction}
ההודעה צריכה להיות ממותגת עם השם "דיירקט פיקס".
הקפד על הודעה מקצועית ומותאמת לפורמט מייל.`;

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
                subject: { type: "string", description: "Short email subject line in Hebrew" },
                message: { type: "string", description: "Full email message in Hebrew" },
                imagePrompt: { type: "string", description: "A short English prompt to generate a matching promotional image. Do NOT include any text or words in the image." }
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

    // Generate image if requested
    let imageBase64 = null;
    if (generateImage && imageStyle && imageStyle !== 'none') {
      try {
        const stylePrompt = IMAGE_STYLE_PROMPTS[imageStyle] || IMAGE_STYLE_PROMPTS.banner;
        const fullImagePrompt = `${stylePrompt} Context: ${prompt}. DO NOT include any text, words, or letters in the image. Image only, no typography.`;

        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              { role: "user", content: fullImagePrompt }
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imgResponse.ok) {
          const imgResult = await imgResponse.json();
          const imgUrl = imgResult.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imgUrl) imageBase64 = imgUrl;
        } else {
          console.error("Image generation failed:", imgResponse.status);
        }
      } catch (imgErr) {
        console.error("Image generation error:", imgErr);
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
