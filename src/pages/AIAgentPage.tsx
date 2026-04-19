import { useState, useCallback, useEffect, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

interface AgentSettings {
  is_enabled: boolean;
  use_active_hours: boolean;
  active_hours_start: string | null;
  active_hours_end: string | null;
  vacation_start: string | null;
  vacation_end: string | null;
  vacation_message: string;
}

const isOnVacation = (s: AgentSettings): boolean => {
  if (!s.vacation_start || !s.vacation_end) return false;
  const today = new Date().toISOString().slice(0, 10);
  return today >= s.vacation_start && today <= s.vacation_end;
};

const AgentInner = ({ settings }: { settings: AgentSettings }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const animFrameRef = useRef<number>();
  const vacationContextSentRef = useRef(false);

  const onVacation = isOnVacation(settings);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[AI Agent] Connected");
      toast.success("מחובר לנציג");
    },
    onDisconnect: (details) => {
      console.log("[AI Agent] Disconnected", details);
      vacationContextSentRef.current = false;
    },
    onError: (error) => {
      console.error("[AI Agent] Error:", error);
      const msg = typeof error === "string" ? error : (error as any)?.message || "שגיאה בחיבור";
      toast.error(msg);
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
          toast.success("הפרטים נשמרו - נחזור אליך");
          return onVacation
            ? "We are currently on vacation. Tell the customer we received the details and will call back when we return."
            : "Contact saved successfully. Tell the customer we will call them back soon.";
        } catch {
          return "Failed to save contact.";
        }
      },
      get_price: async (params: { model: string; repair_type: string; variant?: string }) => {
        try {
          if (onVacation) {
            return `החנות כרגע בחופשה. במקום למסור מחיר, בקש מהלקוח שם מלא, מספר טלפון ותיאור התקלה, ואז קרא ל-save_contact. אמור גם: "${settings.vacation_message}"`;
          }

          const modelQuery = (params.model || "").trim();
          const repairQuery = (params.repair_type || "").trim();
          const variantHint = (params.variant || "").trim();
          if (!modelQuery || !repairQuery) return "Missing model or repair_type.";

          const normalize = (s: string) =>
            s.toLowerCase()
              .replace(/[\u05D0-\u05EA]+/g, (m) => {
                const map: Record<string, string> = {
                  "פרו": "pro", "מקס": "max", "פלוס": "plus", "מיני": "mini",
                  "אייפון": "iphone", "סמסונג": "samsung", "גלקסי": "galaxy",
                };
                return map[m] || m;
              })
              .replace(/[^a-z0-9\u05D0-\u05EA\s]/g, " ")
              .replace(/\s+/g, " ").trim();

          const queryNorm = normalize(modelQuery + " " + variantHint);
          const wantsProMax = /\bpro\s*max\b/.test(queryNorm) || /\bmax\b/.test(queryNorm);
          const wantsPro = /\bpro\b/.test(queryNorm) && !wantsProMax;
          const wantsPlus = /\bplus\b/.test(queryNorm);
          const wantsMini = /\bmini\b/.test(queryNorm);

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
            const cTokens = c.norm.split(" ").filter(Boolean).filter((t) => !variantWords.has(t));
            const allPresent = queryTokens.every((t) => cTokens.includes(t));
            if (!allPresent) continue;
            const score = (cTokens.length === queryTokens.length ? 1000 : 0) + queryTokens.length - Math.abs(cTokens.length - queryTokens.length);
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
    try {
      vacationContextSentRef.current = true;
      conversation.sendContextualUpdate(
        `מצב חופשה פעיל. הודע מיד ללקוח: "${settings.vacation_message}". אחר כך בקש רק שם מלא, טלפון ותיאור תקלה. אל תיתן מחירים, אל תיתן זמינות. השתמש רק ב-save_contact.`
      );
    } catch {
      vacationContextSentRef.current = false;
    }
  }, [conversation, isConnected, onVacation, settings.vacation_message]);

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
      toast.error("יש לאשר את מדיניות הפרטיות");
      return;
    }
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
      if (error) throw new Error(error.message || "לא הצלחנו להתחבר");
      if (!data?.conversationToken && !data?.signedUrl) {
        throw new Error(data?.error || "לא התקבלו פרטי חיבור");
      }
      if (data.conversationToken) {
        await conversation.startSession({
          conversationToken: data.conversationToken,
          connectionType: "webrtc",
        });
      } else {
        await conversation.startSession({
          signedUrl: data.signedUrl,
          connectionType: "websocket",
        });
      }
    } catch (err) {
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

  const orbScale = 1 + Math.min(volumeLevel * 0.6, 0.6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex flex-col" dir="rtl">
      <header className="px-6 py-3 flex items-center justify-between border-b border-border/50">
        <Logo size="sm" />
        <a href="tel:033106020" className="text-xs text-muted-foreground hover:text-primary">
          03-3106020
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 pb-56">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3 h-3" />
              נציג AI חכם
            </div>
            <h1 className="text-2xl font-extrabold mb-1">דברו עם דני</h1>
            <p className="text-muted-foreground text-xs">
              {isConnecting && "מתחבר לנציג..."}
              {isConnected && isSpeaking && "דני מדבר..."}
              {isConnected && !isSpeaking && "דני מקשיב לך..."}
              {!isConnected && !isConnecting && (onVacation
                ? "אנחנו בחופשה - השאירו פרטים ונחזור אליכם"
                : "מחירים, זמינות, ייעוץ - 24/7")}
            </p>
          </div>

          {/* Voice orb */}
          <div className="flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {isConnected && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/15 transition-transform duration-100" style={{ transform: `scale(${orbScale * 1.15})` }} />
                  <div className="absolute inset-5 rounded-full bg-primary/25 transition-transform duration-100" style={{ transform: `scale(${orbScale})` }} />
                </>
              )}
              <div
                className={cn(
                  "relative w-28 h-28 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-emerald-400 to-green-600",
                  "shadow-2xl shadow-green-500/40 transition-transform duration-100",
                  !isConnected && "opacity-80"
                )}
                style={{ transform: isConnected ? `scale(${orbScale})` : "scale(1)" }}
              >
                {isSpeaking ? <Volume2 className="w-10 h-10 text-white" />
                  : isConnected ? <Mic className="w-10 h-10 text-white" />
                  : <MicOff className="w-10 h-10 text-white" />}
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-4 ring-background">
                  <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom: consent + CTA + phone fallback */}
      <div className="fixed bottom-0 inset-x-0 z-50 px-4 pt-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-md border-t border-border/40">
        <div className="max-w-md mx-auto space-y-3">
          {!isConnected && (
            <div className="bg-card/80 rounded-xl p-2.5 border border-border">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="ai-consent"
                  checked={consentAccepted}
                  onCheckedChange={(c) => setConsentAccepted(c === true)}
                  className="mt-0.5"
                />
                <label htmlFor="ai-consent" className="text-xs cursor-pointer leading-snug flex-1">
                  <Shield className="w-3 h-3 inline ml-1 text-primary" />
                  אני מסכים/ה ל
                  <Link to="/terms" target="_blank" className="text-primary underline">תנאי השימוש</Link>
                  {" "}והקלטת השיחה.
                </label>
              </div>
            </div>
          )}

          {isConnected ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={stopConversation}
              className="w-full h-14 text-base rounded-full gap-2 shadow-2xl shadow-destructive/40"
            >
              <PhoneOff className="w-5 h-5" />
              סיים שיחה
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startConversation}
              disabled={isConnecting || !consentAccepted}
              className="w-full h-14 text-base rounded-full gap-2 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 transition-all bg-gradient-to-br from-emerald-400 to-green-600 text-white border-0"
            >
              <Phone className="w-5 h-5" />
              {isConnecting ? "מתחבר..." : "התחל שיחה עם דני"}
            </Button>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            למקרים מורכבים -{" "}
            <a href="tel:033106020" className="text-primary font-semibold">03-3106020</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const AIAgentPage = () => {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("voice_agent_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted) {
          if (data) setSettings(data as AgentSettings);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (!settings || !settings.is_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6" dir="rtl">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold mb-2">הנציג כרגע לא זמין</h1>
          <p className="text-muted-foreground mb-6">לשירות אישי אפשר להתקשר אלינו</p>
          <a
            href="tel:033106020"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold"
          >
            <Phone className="w-4 h-4" />
            03-3106020
          </a>
        </div>
      </div>
    );
  }

  return (
    <ConversationProvider>
      <AgentInner settings={settings} />
    </ConversationProvider>
  );
};

export default AIAgentPage;
