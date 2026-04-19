import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Trash2, CheckCircle, MessageCircle, Mic } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface VoiceLead {
  id: string;
  customer_name: string;
  customer_phone: string;
  issue_description: string | null;
  conversation_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return "972" + digits.slice(1);
  return digits;
};

const VoiceLeadsManagement = () => {
  const [leads, setLeads] = useState<VoiceLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("voice_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("שגיאה בטעינת פניות");
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel("voice_leads_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voice_leads" },
        () => fetchLeads()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markHandled = async (id: string) => {
    const { error } = await supabase
      .from("voice_leads")
      .update({ status: "handled" })
      .eq("id", id);
    if (error) toast.error("שגיאה בעדכון");
    else toast.success("סומן כטופל");
  };

  const removeLead = async (id: string) => {
    if (!confirm("למחוק פנייה זו?")) return;
    const { error } = await supabase.from("voice_leads").delete().eq("id", id);
    if (error) toast.error("שגיאה במחיקה");
    else toast.success("נמחק");
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const whatsappCustomer = (phone: string, name: string) => {
    const msg = encodeURIComponent(
      `שלום ${name}, דיברת עם הטכנאי הוירטואלי שלנו ב-DirectFix. השארת בקשה לחזרה - איך אפשר לעזור?`
    );
    window.open(`https://wa.me/${formatPhone(phone)}?text=${msg}`, "_blank");
  };

  const newLeads = leads.filter((l) => l.status === "new");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            פניות מטכנאי AI
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            לקוחות שביקשו חזרה במהלך שיחה עם הטכנאי הוירטואלי
          </p>
        </div>
        {newLeads.length > 0 && (
          <Badge variant="destructive" className="text-base px-3 py-1">
            {newLeads.length} חדש
          </Badge>
        )}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">טוען...</p>
      ) : leads.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>אין עדיין פניות מהטכנאי הוירטואלי</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={`p-4 ${lead.status === "new" ? "border-primary/40 bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{lead.customer_name || "ללא שם"}</h3>
                    {lead.status === "new" ? (
                      <Badge variant="destructive">חדש</Badge>
                    ) : (
                      <Badge variant="secondary">טופל</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(lead.created_at), {
                      addSuffix: true,
                      locale: he,
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${lead.customer_phone}`} className="font-mono font-bold text-primary">
                    {lead.customer_phone}
                  </a>
                </div>
                {lead.issue_description && (
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-foreground">{lead.issue_description}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => callCustomer(lead.customer_phone)} className="gap-1">
                  <Phone className="w-4 h-4" />
                  התקשר
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => whatsappCustomer(lead.customer_phone, lead.customer_name)}
                  className="gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                {lead.status === "new" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markHandled(lead.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    סמן כטופל
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLead(lead.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  מחק
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceLeadsManagement;
