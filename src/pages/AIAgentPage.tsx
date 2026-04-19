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
    onConnect: () => toast.success("מחובר לנציג"),
    onDisconnect: () => { vacationContextSentRef.current = false; },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "שגיאה בחיבור");
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
      if (error || !data?.signedUrl) throw new Error(error?.message || data?.error || "לא התקבל קישור");
      await conversation.startSession({ signedUrl: data.signedUrl, connectionType: "websocket" });
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
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50">
        <Logo size="sm" />
        <a href="tel:033106020" className="text-xs text-muted-foreground hover:text-primary">
          03-3106020
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              נציג AI חכם
            </div>
            <h1 className="text-3xl font-extrabold mb-2">דברו עם דני</h1>
            <p className="text-muted-foreground text-sm">
              {isConnecting && "מתחבר לנציג..."}
              {isConnected && isSpeaking && "דני מדבר..."}
              {isConnected && !isSpeaking && "דני מקשיב לך..."}
              {!isConnected && !isConnecting && (onVacation
                ? "אנחנו בחופשה - השאירו פרטים ונחזור אליכם"
                : "מחירים, זמינות, ייעוץ - 24/7")}
            </p>
          </div>

          {/* Voice orb */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {isConnected && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/15 transition-transform duration-100" style={{ transform: `scale(${orbScale * 1.15})` }} />
                  <div className="absolute inset-6 rounded-full bg-primary/25 transition-transform duration-100" style={{ transform: `scale(${orbScale})` }} />
                </>
              )}
              <div
                className={cn(
                  "relative w-36 h-36 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-emerald-400 to-green-600",
                  "shadow-2xl shadow-green-500/40 transition-transform duration-100",
                  !isConnected && "opacity-80"
                )}
                style={{ transform: isConnected ? `scale(${orbScale})` : "scale(1)" }}
              >
                {isSpeaking ? <Volume2 className="w-14 h-14 text-white" />
                  : isConnected ? <Mic className="w-14 h-14 text-white" />
                  : <MicOff className="w-14 h-14 text-white" />}
                <span className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-4 ring-background">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </div>

          {/* Consent */}
          {!isConnected && (
            <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="ai-consent"
                  checked={consentAccepted}
                  onCheckedChange={(c) => setConsentAccepted(c === true)}
                  className="mt-0.5"
                />
                <label htmlFor="ai-consent" className="text-sm cursor-pointer leading-snug flex-1">
                  <Shield className="w-3.5 h-3.5 inline ml-1 text-primary" />
                  אני מסכים/ה ל
                  <Link to="/terms" target="_blank" className="text-primary underline">תנאי השימוש</Link>
                  {" "}וכי השיחה עשויה להיות מוקלטת לצרכי שירות.
                </label>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-center mb-6">
            {isConnected ? (
              <Button variant="destructive" size="lg" onClick={stopConversation} className="rounded-full px-10 h-14 text-base gap-2 shadow-lg">
                <PhoneOff className="w-5 h-5" />
                סיים שיחה
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={startConversation}
                disabled={isConnecting || !consentAccepted}
                className="rounded-full px-10 h-14 text-base gap-2 shadow-lg shadow-primary/30"
              >
                <Phone className="w-5 h-5" />
                {isConnecting ? "מתחבר..." : "התחל שיחה"}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            למקרים מורכבים -{" "}
            <a href="tel:033106020" className="text-primary font-semibold">03-3106020</a>
          </p>
        </div>
      </main>
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
