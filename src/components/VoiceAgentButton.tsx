import { useState, useCallback, useEffect, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VoiceAgentInner = () => {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const animFrameRef = useRef<number>();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice agent connected");
      toast.success("מחובר לטכנאי הוירטואלי");
    },
    onDisconnect: (details) => {
      console.log("Voice agent disconnected", details);
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בחיבור לטכנאי הוירטואלי");
    },
    clientTools: {
      save_contact: async (params: { name: string; phone: string; issue?: string }) => {
        try {
          const conversationId = conversation.getId?.() ?? null;
          const { error } = await supabase.from("voice_leads").insert({
            customer_name: params.name || "",
            customer_phone: params.phone || "",
            issue_description: params.issue || "",
            conversation_id: conversationId,
            status: "new",
          });
          if (error) throw error;
          toast.success("הפרטים שלך נשמרו - נחזור אליך בהקדם");
          return "Contact saved successfully. Tell the customer we will call them back soon.";
        } catch (err) {
          console.error("save_contact failed:", err);
          return "Failed to save contact. Please ask the customer to try again.";
        }
      },
      get_price: async (params: { model: string; repair_type: string }) => {
        try {
          const modelQuery = (params.model || "").trim();
          const repairQuery = (params.repair_type || "").trim();
          if (!modelQuery || !repairQuery) {
            return "Missing model or repair_type. Ask the customer for both.";
          }

          // Normalize: lowercase, strip punctuation, collapse spaces, normalize Hebrew "פרו"->"pro" etc.
          const normalize = (s: string) =>
            s
              .toLowerCase()
              .replace(/[\u05D0-\u05EA]+/g, (m) => {
                // Map common Hebrew tokens to English equivalents
                const map: Record<string, string> = {
                  "פרו": "pro",
                  "מקס": "max",
                  "פלוס": "plus",
                  "מיני": "mini",
                  "אייפון": "iphone",
                  "סמסונג": "samsung",
                  "גלקסי": "galaxy",
                };
                return map[m] || m;
              })
              .replace(/[^a-z0-9\u05D0-\u05EA\s]/g, " ")
              .replace(/\s+/g, " ")
              .trim();

          const queryNorm = normalize(modelQuery);
          // Detect variant qualifiers explicitly
          const wantsProMax = /\bpro\s*max\b/.test(queryNorm);
          const wantsPro = /\bpro\b/.test(queryNorm) && !wantsProMax;
          const wantsPlus = /\bplus\b/.test(queryNorm);
          const wantsMini = /\bmini\b/.test(queryNorm);
          const wantsBase = !wantsPro && !wantsProMax && !wantsPlus && !wantsMini;

          const { data: models } = await supabase
            .from("iphone_models")
            .select("id, name")
            .eq("is_active", true);

          const candidates = (models || []).map((m) => ({ ...m, norm: normalize(m.name) }));

          // Match variant strictly
          const isProMax = (n: string) => /\bpro\s*max\b/.test(n);
          const isPro = (n: string) => /\bpro\b/.test(n) && !isProMax(n);
          const isPlus = (n: string) => /\bplus\b/.test(n);
          const isMini = (n: string) => /\bmini\b/.test(n);
          const isBase = (n: string) => !isPro(n) && !isProMax(n) && !isPlus(n) && !isMini(n);

          let filtered = candidates.filter((c) => {
            if (wantsProMax) return isProMax(c.norm);
            if (wantsPro) return isPro(c.norm);
            if (wantsPlus) return isPlus(c.norm);
            if (wantsMini) return isMini(c.norm);
            return isBase(c.norm);
          });

          // Now pick the one whose tokens overlap most with query (e.g. "iphone 13")
          const queryTokens = queryNorm.split(" ").filter(Boolean);
          let best: typeof candidates[number] | undefined;
          let bestScore = -1;
          for (const c of filtered) {
            const cTokens = c.norm.split(" ").filter(Boolean);
            // require all query tokens (numbers + brand) to be present in candidate
            const allPresent = queryTokens.every((t) => cTokens.includes(t));
            if (!allPresent) continue;
            const score = cTokens.length === queryTokens.length ? 1000 : queryTokens.length;
            if (score > bestScore) {
              bestScore = score;
              best = c;
            }
          }

          if (!best) {
            return `Model "${modelQuery}" not found in the requested variant. Ask the customer to clarify exactly: base model, Pro, Pro Max, Plus, or Mini.`;
          }

          // Find best matching repair type
          const { data: repairs } = await supabase
            .from("repair_types")
            .select("id, name")
            .eq("is_active", true);
          const repair = repairs?.find(
            (r) =>
              r.name.includes(repairQuery) ||
              repairQuery.includes(r.name) ||
              r.name.toLowerCase().includes(repairQuery.toLowerCase())
          );
          if (!repair) {
            return `Repair type "${repairQuery}" not recognized. Available: החלפת מסך תואם, החלפת מסך מקורי, החלפת סוללה מקורית, החלפת גב מקורי, תיקון טעינה.`;
          }

          const { data: priceRow } = await supabase
            .from("model_repair_prices")
            .select("price")
            .eq("model_id", best.id)
            .eq("repair_type_id", repair.id)
            .maybeSingle();

          if (!priceRow || priceRow.price === 0) {
            return `Price for ${repair.name} on ${best.name} is not currently available. Ask the customer to leave their details and we will call back with a quote.`;
          }

          return `המחיר ל${repair.name} ב${best.name} הוא ${priceRow.price} שקלים, כולל הגעה עד הבית, התקנה ואחריות. Tell the customer the exact model name "${best.name}" and the price clearly in Hebrew.`;
        } catch (err) {
          console.error("get_price failed:", err);
          return "Failed to fetch price. Tell the customer we will check and call them back.";
        }
      },
    },
  });

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  // Animate volume visualization
  useEffect(() => {
    if (!isConnected) {
      setVolumeLevel(0);
      return;
    }
    const tick = () => {
      try {
        const level = isSpeaking
          ? conversation.getOutputVolume?.() ?? 0
          : conversation.getInputVolume?.() ?? 0;
        setVolumeLevel(level);
      } catch {
        // ignore
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isConnected, isSpeaking, conversation]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || data?.error || "לא התקבל קישור חיבור מאובטח");
      }

      await conversation.startSession({
        signedUrl: data.signedUrl,
        connectionType: "websocket",
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(
        err instanceof Error && err.message.includes("Permission")
          ? "נדרשת הרשאה למיקרופון כדי לדבר עם הטכנאי"
          : err instanceof Error
            ? err.message
            : "לא הצלחנו להתחבר. נסה שוב."
      );
      setOpen(false);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleOpen = () => {
    setOpen(true);
    if (!isConnected && !isConnecting) {
      startConversation();
    }
  };

  const handleClose = async () => {
    if (isConnected) await stopConversation();
    setOpen(false);
  };

  // Compute scale for pulsing orb based on volume
  const orbScale = 1 + Math.min(volumeLevel * 0.6, 0.6);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="דבר עם טכנאי וירטואלי"
        className={cn(
          "fixed bottom-24 left-4 z-40 group",
          "flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-gradient-to-br from-primary to-primary/80",
          "text-primary-foreground shadow-lg shadow-primary/30",
          "hover:shadow-xl hover:shadow-primary/40 hover:scale-105",
          "transition-all duration-300",
          "border border-primary/20 backdrop-blur-sm"
        )}
        style={{
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px) / 2)",
        }}
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
          <Phone className="w-5 h-5 relative" />
        </span>
        <span className="text-sm font-bold whitespace-nowrap">
          טכנאי AI
        </span>
      </button>

      {/* Conversation dialog */}
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent
          className="max-w-md rounded-3xl p-0 overflow-hidden border-primary/20"
          dir="rtl"
        >
          <DialogTitle className="sr-only">שיחה עם טכנאי וירטואלי</DialogTitle>
          <DialogDescription className="sr-only">שיחה קולית בזמן אמת עם הטכנאי הוירטואלי של DirectFix.</DialogDescription>
          {/* Close button on Left */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 pt-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1">דני - טכנאי וירטואלי</h2>
              <p className="text-sm text-muted-foreground">
                {isConnecting && "מתחבר..."}
                {isConnected && isSpeaking && "מדבר..."}
                {isConnected && !isSpeaking && "מקשיב..."}
                {!isConnected && !isConnecting && "מנותק"}
              </p>
            </div>

            {/* Voice orb visualization */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer ring pulses */}
                {isConnected && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-primary/20 transition-transform duration-100"
                      style={{ transform: `scale(${orbScale * 1.1})` }}
                    />
                    <div
                      className="absolute inset-4 rounded-full bg-primary/30 transition-transform duration-100"
                      style={{ transform: `scale(${orbScale})` }}
                    />
                  </>
                )}
                {/* Core orb */}
                <div
                  className={cn(
                    "relative w-32 h-32 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-primary/60",
                    "shadow-2xl shadow-primary/40 transition-transform duration-100",
                    !isConnected && "opacity-50"
                  )}
                  style={{
                    transform: isConnected ? `scale(${orbScale})` : "scale(1)",
                  }}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-12 h-12 text-primary-foreground" />
                  ) : isConnected ? (
                    <Mic className="w-12 h-12 text-primary-foreground" />
                  ) : (
                    <MicOff className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex justify-center">
              {isConnected ? (
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleClose}
                  className="rounded-full px-8 gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  סיים שיחה
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={startConversation}
                  disabled={isConnecting}
                  className="rounded-full px-8 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {isConnecting ? "מתחבר..." : "התחל שיחה"}
                </Button>
              )}
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              שיחה קולית עם בינה מלאכותית. למקרים מורכבים -{" "}
              <a href="tel:033106020" className="text-primary font-semibold">
                03-3106020
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const VoiceAgentButton = () => (
  <ConversationProvider>
    <VoiceAgentInner />
  </ConversationProvider>
);

