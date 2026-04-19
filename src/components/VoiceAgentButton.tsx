import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Phone, PhoneOff, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const VoiceAgentButton = () => {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const animFrameRef = useRef<number>();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice agent connected");
      toast.success("מחובר לטכנאי הוירטואלי");
    },
    onDisconnect: () => {
      console.log("Voice agent disconnected");
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      toast.error("שגיאה בחיבור לטכנאי הוירטואלי");
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

      if (error || !data?.token) {
        throw new Error(error?.message || "לא התקבל טוקן");
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(
        err instanceof Error && err.message.includes("Permission")
          ? "נדרשת הרשאה למיקרופון כדי לדבר עם הטכנאי"
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
