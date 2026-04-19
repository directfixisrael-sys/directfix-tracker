import { useState, useCallback, useEffect, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, X, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AgentSettings {
  is_enabled: boolean;
  use_active_hours: boolean;
  active_hours_start: string | null;
  active_hours_end: string | null;
  vacation_start: string | null;
  vacation_end: string | null;
  vacation_message: string;
}

const isWithinActiveHours = (s: AgentSettings): boolean => {
  if (!s.use_active_hours) return true;
  const start = s.active_hours_start?.slice(0, 5) || "00:00";
  const end = s.active_hours_end?.slice(0, 5) || "23:59";
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return cur >= start && cur <= end;
};

const isOnVacation = (s: AgentSettings): boolean => {
  if (!s.vacation_start || !s.vacation_end) return false;
  const today = new Date().toISOString().slice(0, 10);
  return today >= s.vacation_start && today <= s.vacation_end;
};

const VoiceAgentInner = ({ settings }: { settings: AgentSettings }) => {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const animFrameRef = useRef<number>();
  const vacationContextSentRef = useRef(false);

  const onVacation = isOnVacation(settings);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice agent connected");
      toast.success("מחובר לטכנאי הוירטואלי");
    },
    onDisconnect: (details) => {
      console.log("Voice agent disconnected", details);
      vacationContextSentRef.current = false;
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
            status: onVacation ? "vacation" : "new",
          });
          if (error) throw error;
          toast.success("הפרטים שלך נשמרו - נחזור אליך בהקדם");
          return "Contact saved successfully. Tell the customer we will call them back soon.";
        } catch (err) {
          console.error("save_contact failed:", err);
          return "Failed to save contact. Please ask the customer to try again.";
        }
      },
      get_price: async (params: { model: string; repair_type: string; variant?: string }) => {
        try {
          const modelQuery = (params.model || "").trim();
          const repairQuery = (params.repair_type || "").trim();
          const variantHint = (params.variant || "").trim();
          if (!modelQuery || !repairQuery) return "Missing model or repair_type.";

          const normalize = (s: string) =>
            s
              .toLowerCase()
              .replace(/[\u05D0-\u05EA]+/g, (m) => {
                const map: Record<string, string> = {
                  "פרו": "pro", "מקס": "max", "פלוס": "plus", "מיני": "mini",
                  "אייפון": "iphone", "סמסונג": "samsung", "גלקסי": "galaxy",
                };
                return map[m] || m;
              })
              .replace(/[^a-z0-9\u05D0-\u05EA\s]/g, " ")
              .replace(/\s+/g, " ")
              .trim();

          const queryNorm = normalize(modelQuery + " " + variantHint);
          const wantsProMax = /\bpro\s*max\b/.test(queryNorm) || /\bmax\b/.test(queryNorm);
          const wantsPro = /\bpro\b/.test(queryNorm) && !wantsProMax;
          const wantsPlus = /\bplus\b/.test(queryNorm);
          const wantsMini = /\bmini\b/.test(queryNorm);
          const wantsBase = !wantsPro && !wantsProMax && !wantsPlus && !wantsMini;

          const { data: models } = await supabase.from("iphone_models").select("id, name").eq("is_active", true);
          const candidates = (models || []).map((m) => ({ ...m, norm: normalize(m.name) }));
          const isProMax = (n: string) => /\bpro\s*max\b/.test(n);
          const isPro = (n: string) => /\bpro\b/.test(n) && !isProMax(n);
          const isPlus = (n: string) => /\bplus\b/.test(n);
          const isMini = (n: string) => /\bmini\b/.test(n);
          const isBase = (n: string) => !isPro(n) && !isProMax(n) && !isPlus(n) && !isMini(n);

          const filtered = candidates.filter((c) => {
            if (wantsProMax) return isProMax(c.norm);
            if (wantsPro) return isPro(c.norm);
            if (wantsPlus) return isPlus(c.norm);
            if (wantsMini) return isMini(c.norm);
            return isBase(c.norm);
          });

          const variantWords = new Set(["pro", "max", "plus", "mini"]);
          const queryTokens = queryNorm.split(" ").filter((t) => t && !variantWords.has(t));
          let best: typeof candidates[number] | undefined;
          let bestScore = -1;
          for (const c of filtered) {
            const cTokensNoVariant = c.norm.split(" ").filter(Boolean).filter((t) => !variantWords.has(t));
            const allPresent = queryTokens.every((t) => cTokensNoVariant.includes(t));
            if (!allPresent) continue;
            const exactMatch = cTokensNoVariant.length === queryTokens.length;
            const score = (exactMatch ? 1000 : 0) + queryTokens.length - Math.abs(cTokensNoVariant.length - queryTokens.length);
            if (score > bestScore) { bestScore = score; best = c; }
          }

          if (!best) return `Model "${modelQuery}" not found.`;

          const { data: repairs } = await supabase.from("repair_types").select("id, name").eq("is_active", true);
          const normalizeRepair = (s: string) =>
            normalize(s)
              .replace(/מסך תואם/g, "screen compatible")
              .replace(/מסך מקורי/g, "screen original")
              .replace(/סוללה מקורית/g, "battery original")
              .replace(/גב מקורי/g, "back original")
              .replace(/תיקון טעינה/g, "charging")
              .replace(/החלפת/g, "")
              .replace(/תיקון/g, "")
              .replace(/\s+/g, " ").trim();

          const repairQueryNorm = normalizeRepair(repairQuery);
          const repairCandidates = (repairs || []).map((r) => ({ ...r, norm: normalizeRepair(r.name) }));
          const repair = repairCandidates.find((r) => r.norm === repairQueryNorm) ||
            repairCandidates.find((r) => r.norm.includes(repairQueryNorm) || repairQueryNorm.includes(r.norm));

          if (!repair) return `Repair "${repairQuery}" not recognized.`;

          const { data: priceRow } = await supabase
            .from("model_repair_prices")
            .select("price")
            .eq("model_id", best.id)
            .eq("repair_type_id", repair.id)
            .maybeSingle();

          if (!priceRow?.price) return `No price found for ${best.name} - ${repair.name}.`;
          return `מחיר מדויק: ${repair.name} עבור ${best.name} - ${priceRow.price} ש"ח.`;
        } catch (err) {
          console.error("get_price failed:", err);
          return "Failed to fetch price.";
        }
      },
    },
  });

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  useEffect(() => {
    if (!isConnected || !onVacation || vacationContextSentRef.current) return;
    vacationContextSentRef.current = true;
    conversation
      .sendContextualUpdate(
        `מצב חופשה פעיל עד ${settings.vacation_end}. בתחילת השיחה אמור בדיוק: "${settings.vacation_message}". לאחר מכן בקש רק שם מלא, טלפון ותיאור תקלה, שמור אותם עם save_contact, ואל תיתן מחירים או זמינות.`
      )
      .catch((err) => {
        console.error("Failed to send vacation context:", err);
        vacationContextSentRef.current = false;
      });
  }, [conversation, isConnected, onVacation, settings.vacation_end, settings.vacation_message]);

  useEffect(() => {
    if (!isConnected) { setVolumeLevel(0); return; }
    const tick = () => {
      try {
        const level = isSpeaking ? conversation.getOutputVolume?.() ?? 0 : conversation.getInputVolume?.() ?? 0;
        setVolumeLevel(level);
      } catch {}
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isConnected, isSpeaking, conversation]);

  const startConversation = useCallback(async () => {
    if (!consentAccepted) {
      toast.error("יש לאשר את מדיניות הפרטיות לפני התחלת השיחה");
      return;
    }
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
      if (error || !data?.signedUrl) throw new Error(error?.message || data?.error || "לא התקבל קישור");
      await conversation.startSession({ signedUrl: data.signedUrl, connectionType: "websocket" });
    } catch (err) {
      console.error("Failed to start:", err);
      toast.error(
        err instanceof Error && err.message.includes("Permission")
          ? "נדרשת הרשאה למיקרופון"
          : err instanceof Error ? err.message : "לא הצלחנו להתחבר."
      );
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, consentAccepted]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleClose = async () => {
    if (isConnected) await stopConversation();
    setOpen(false);
  };

  const orbScale = 1 + Math.min(volumeLevel * 0.6, 0.6);

  return (
    <>
      {/* Small floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="נציג AI"
        className={cn(
          "fixed bottom-24 left-4 z-40",
          "flex items-center gap-1.5 px-3 py-2 rounded-full",
          "bg-background/90 backdrop-blur border border-primary/30",
          "text-foreground shadow-md hover:shadow-lg",
          "hover:bg-primary/5 hover:scale-105 transition-all duration-300"
        )}
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px) / 2)" }}
      >
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold whitespace-nowrap">נציג AI</span>
      </button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-primary/20" dir="rtl">
          <DialogTitle className="sr-only">שיחה עם נציג AI</DialogTitle>
          <DialogDescription className="sr-only">שיחה קולית בזמן אמת עם הנציג הוירטואלי.</DialogDescription>
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 pt-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">דני - נציג AI</h2>
              <p className="text-sm text-muted-foreground">
                {isConnecting && "מתחבר..."}
                {isConnected && isSpeaking && "מדבר..."}
                {isConnected && !isSpeaking && "מקשיב..."}
                {!isConnected && !isConnecting && (onVacation ? "מצב חופשה" : "מוכן לשיחה")}
              </p>
            </div>

            {/* Voice orb */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {isConnected && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary/20 transition-transform duration-100" style={{ transform: `scale(${orbScale * 1.1})` }} />
                    <div className="absolute inset-4 rounded-full bg-primary/30 transition-transform duration-100" style={{ transform: `scale(${orbScale})` }} />
                  </>
                )}
                <div
                  className={cn(
                    "relative w-28 h-28 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-primary/60",
                    "shadow-2xl shadow-primary/40 transition-transform duration-100",
                    !isConnected && "opacity-50"
                  )}
                  style={{ transform: isConnected ? `scale(${orbScale})` : "scale(1)" }}
                >
                  {isSpeaking ? <Volume2 className="w-10 h-10 text-primary-foreground" />
                    : isConnected ? <Mic className="w-10 h-10 text-primary-foreground" />
                    : <MicOff className="w-10 h-10 text-primary-foreground" />}
                </div>
              </div>
            </div>

            {/* Consent checkbox - only when not connected */}
            {!isConnected && (
              <div className="bg-muted/50 rounded-2xl p-3 mb-4 border border-border">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="ai-consent"
                    checked={consentAccepted}
                    onCheckedChange={(c) => setConsentAccepted(c === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="ai-consent" className="text-sm cursor-pointer leading-snug flex-1">
                    <Shield className="w-3.5 h-3.5 inline ml-1 text-primary" />
                    אני מסכים/ה ש
                    <Link to="/terms" target="_blank" className="text-primary underline">
                      תנאי השימוש
                    </Link>
                    {" "}וכי השיחה עשויה להיות מוקלטת לצרכי שירות ושיפור.
                  </label>
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex justify-center">
              {isConnected ? (
                <Button variant="destructive" size="lg" onClick={handleClose} className="rounded-full px-8 gap-2">
                  <PhoneOff className="w-4 h-4" />
                  סיים שיחה
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={startConversation}
                  disabled={isConnecting || !consentAccepted}
                  className="rounded-full px-8 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {isConnecting ? "מתחבר..." : "התחל שיחה"}
                </Button>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              למקרים מורכבים -{" "}
              <a href="tel:033106020" className="text-primary font-semibold">03-3106020</a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const VoiceAgentButton = () => {
  const [settings, setSettings] = useState<AgentSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("voice_agent_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setSettings(data as AgentSettings);
      });
    return () => { mounted = false; };
  }, []);

  if (!settings) return null;
  if (!settings.is_enabled) return null;
  if (!isWithinActiveHours(settings)) return null;

  return (
    <ConversationProvider>
      <VoiceAgentInner settings={settings} />
    </ConversationProvider>
  );
};
