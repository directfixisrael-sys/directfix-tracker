
CREATE TABLE public.voice_agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  active_hours_start TIME DEFAULT '09:00',
  active_hours_end TIME DEFAULT '22:00',
  use_active_hours BOOLEAN NOT NULL DEFAULT false,
  vacation_start DATE,
  vacation_end DATE,
  vacation_message TEXT NOT NULL DEFAULT 'שלום, אני כרגע בחופשה. אשמח לקחת את הפרטים שלך ונחזור אליך בהקדם כשנשוב.',
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view voice agent settings"
  ON public.voice_agent_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert voice agent settings"
  ON public.voice_agent_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update voice agent settings"
  ON public.voice_agent_settings FOR UPDATE
  USING (true);

CREATE TRIGGER update_voice_agent_settings_updated_at
  BEFORE UPDATE ON public.voice_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.voice_agent_settings (is_enabled, use_active_hours) VALUES (true, false);
