import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bot, Clock, Plane, Save } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  id: string;
  is_enabled: boolean;
  use_active_hours: boolean;
  active_hours_start: string | null;
  active_hours_end: string | null;
  vacation_start: string | null;
  vacation_end: string | null;
  vacation_message: string;
}

const VoiceAgentManagement = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("voice_agent_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      toast.error("שגיאה בטעינת ההגדרות");
    } else if (data) {
      setSettings(data as Settings);
    }
    setLoading(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("voice_agent_settings")
      .update({
        is_enabled: settings.is_enabled,
        use_active_hours: settings.use_active_hours,
        active_hours_start: settings.active_hours_start,
        active_hours_end: settings.active_hours_end,
        vacation_start: settings.vacation_start || null,
        vacation_end: settings.vacation_end || null,
        vacation_message: settings.vacation_message,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error("שמירה נכשלה");
    } else {
      toast.success("ההגדרות נשמרו");
    }
  };

  if (loading || !settings) {
    return <div className="p-6 text-center text-muted-foreground">טוען הגדרות...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">נציג AI - הגדרות</h2>
          <p className="text-sm text-muted-foreground">נהל זמינות הנציג הוירטואלי באתר</p>
        </div>
      </div>

      {/* Master toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">הפעלה כללית</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">הצג כפתור נציג AI באתר</Label>
            <p className="text-sm text-muted-foreground">
              {settings.is_enabled ? "הכפתור פעיל ומוצג ללקוחות" : "הכפתור מוסתר מהאתר"}
            </p>
          </div>
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(v) => setSettings({ ...settings, is_enabled: v })}
          />
        </CardContent>
      </Card>

      {/* Active hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            שעות פעילות יומיות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">הגבל לשעות מסוימות ביום</Label>
              <p className="text-sm text-muted-foreground">מחוץ לשעות אלה הכפתור לא יופיע</p>
            </div>
            <Switch
              checked={settings.use_active_hours}
              onCheckedChange={(v) => setSettings({ ...settings, use_active_hours: v })}
            />
          </div>

          {settings.use_active_hours && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <Label className="text-sm">משעה</Label>
                <Input
                  type="time"
                  value={settings.active_hours_start?.slice(0, 5) || "09:00"}
                  onChange={(e) =>
                    setSettings({ ...settings, active_hours_start: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-sm">עד שעה</Label>
                <Input
                  type="time"
                  value={settings.active_hours_end?.slice(0, 5) || "22:00"}
                  onChange={(e) =>
                    setSettings({ ...settings, active_hours_end: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plane className="w-5 h-5" />
            מצב חופשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            בתקופת חופשה: הנציג יודיע ללקוח שאתה בחופשה, יקח את פרטיו (שם+טלפון+תקלה) ויודיע שתחזור.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">תאריך התחלה</Label>
              <Input
                type="date"
                value={settings.vacation_start || ""}
                onChange={(e) =>
                  setSettings({ ...settings, vacation_start: e.target.value || null })
                }
              />
            </div>
            <div>
              <Label className="text-sm">תאריך סיום</Label>
              <Input
                type="date"
                value={settings.vacation_end || ""}
                onChange={(e) =>
                  setSettings({ ...settings, vacation_end: e.target.value || null })
                }
              />
            </div>
          </div>

          {(settings.vacation_start || settings.vacation_end) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSettings({ ...settings, vacation_start: null, vacation_end: null })
              }
            >
              נקה תאריכי חופשה
            </Button>
          )}

          <div>
            <Label className="text-sm">הודעת חופשה (מה הנציג יגיד)</Label>
            <Textarea
              value={settings.vacation_message}
              onChange={(e) => setSettings({ ...settings, vacation_message: e.target.value })}
              rows={3}
              placeholder="שלום, אני כרגע בחופשה..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <Button
          onClick={save}
          disabled={saving}
          className="w-full h-14 text-lg shadow-lg"
        >
          <Save className="w-5 h-5 ml-2" />
          {saving ? "שומר..." : "שמור הגדרות"}
        </Button>
      </div>
    </div>
  );
};

export default VoiceAgentManagement;
