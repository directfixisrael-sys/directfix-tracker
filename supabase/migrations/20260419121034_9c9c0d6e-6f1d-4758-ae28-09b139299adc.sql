
CREATE TABLE public.voice_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  issue_description text DEFAULT '',
  conversation_id text,
  status text NOT NULL DEFAULT 'new',
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert voice leads"
  ON public.voice_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view voice leads"
  ON public.voice_leads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update voice leads"
  ON public.voice_leads FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete voice leads"
  ON public.voice_leads FOR DELETE
  USING (true);

CREATE TRIGGER update_voice_leads_updated_at
  BEFORE UPDATE ON public.voice_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_leads;
ALTER TABLE public.voice_leads REPLICA IDENTITY FULL;
