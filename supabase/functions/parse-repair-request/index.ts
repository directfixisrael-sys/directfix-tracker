import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch available models and repair types from the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [modelsRes, repairsRes] = await Promise.all([
      supabase.from("iphone_models").select("name").eq("is_active", true).order("sort_order"),
      supabase.from("repair_types").select("name, is_phone_only").eq("is_active", true).order("sort_order"),
    ]);

    const modelNames = (modelsRes.data || []).map((m: any) => m.name);
    const repairTypes = (repairsRes.data || [])
      .filter((r: any) => !r.is_phone_only)
      .map((r: any) => r.name);

    const systemPrompt = `אתה עוזר חכם שמנתח בקשות תיקון טלפונים. 
המשתמש יתאר מה הוא רוצה לתקן וצריך לזהות:
1. דגם המכשיר
2. סוג התיקון

הדגמים הזמינים: ${modelNames.join(", ")}
סוגי התיקון הזמינים: ${repairTypes.join(", ")}

חוקים:
- אם המשתמש כותב "מסך" בלי לציין מקורי/תואם, תחזיר את שני סוגי המסך כאפשרויות
- אם המשתמש כותב "סוללה" או "בטריה", תתאים ל"החלפת סוללה מקורית"
- אם לא ניתן לזהות דגם, החזר null עבור model_name
- אם לא ניתן לזהות תיקון, החזר null עבור repair_name  
- נסה להתאים גם אם המשתמש כותב באנגלית או בעברית
- "אייפון" = "iPhone"
- אם המשתמש כותב מספר בלבד (כמו "14"), נסה להתאים לדגם iPhone עם אותו מספר`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_repair",
              description: "Identify the device model and repair type from the user's request",
              parameters: {
                type: "object",
                properties: {
                  model_name: {
                    type: "string",
                    description: "The exact model name from the available list, or null if not identified",
                    nullable: true,
                  },
                  repair_names: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of matching repair type names from the available list. Can be multiple if ambiguous (e.g. both screen types).",
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence level of the identification",
                  },
                  suggestion: {
                    type: "string",
                    description: "A short Hebrew message to show the user about what was identified",
                  },
                },
                required: ["model_name", "repair_names", "confidence", "suggestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_repair" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "שגיאת מערכת, נסה לבחור ידנית" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ 
        model_name: null, 
        repair_names: [], 
        confidence: "low",
        suggestion: "לא הצלחתי לזהות, אנא בחר ידנית" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-repair-request error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error",
      model_name: null,
      repair_names: [],
      confidence: "low",
      suggestion: "שגיאה, אנא בחר ידנית"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
