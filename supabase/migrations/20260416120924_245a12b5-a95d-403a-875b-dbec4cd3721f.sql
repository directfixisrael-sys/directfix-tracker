
CREATE TABLE public.ipad_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  screen_price NUMERIC NOT NULL DEFAULT 0,
  series TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ipad_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read ipad_models" ON public.ipad_models FOR SELECT USING (true);
CREATE POLICY "Allow public insert ipad_models" ON public.ipad_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ipad_models" ON public.ipad_models FOR UPDATE USING (true);
CREATE POLICY "Allow public delete ipad_models" ON public.ipad_models FOR DELETE USING (true);

INSERT INTO public.ipad_models (name, screen_price, series, sort_order) VALUES
  ('iPad דור 6', 400, 'iPad', 1),
  ('iPad דור 7', 400, 'iPad', 2),
  ('iPad דור 8', 400, 'iPad', 3),
  ('iPad דור 9', 400, 'iPad', 4),
  ('iPad דור 10', 400, 'iPad', 5),
  ('iPad דור 11', 400, 'iPad', 6),
  ('iPad Air דור 4', 400, 'iPad Air', 7),
  ('iPad Air דור 5', 400, 'iPad Air', 8),
  ('iPad Air M2', 400, 'iPad Air', 9);
