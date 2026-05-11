CREATE TABLE public.wp_button_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer text,
  page_url text,
  user_agent text,
  device_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wp_button_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert wp clicks"
ON public.wp_button_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view wp clicks"
ON public.wp_button_clicks FOR SELECT
USING (true);

CREATE INDEX idx_wp_button_clicks_created_at ON public.wp_button_clicks(created_at DESC);