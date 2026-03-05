
CREATE TABLE public.site_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  page text NOT NULL,
  step text,
  lead_source text,
  referrer text,
  user_agent text,
  language text,
  device_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_visits_created_at ON public.site_visits (created_at DESC);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits (visitor_id);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert site visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view site visits" ON public.site_visits FOR SELECT USING (true);
