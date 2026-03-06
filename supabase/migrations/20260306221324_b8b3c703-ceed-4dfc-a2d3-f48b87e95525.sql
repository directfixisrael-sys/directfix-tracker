
-- Create junction table for model-specific repair prices
CREATE TABLE public.model_repair_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.iphone_models(id) ON DELETE CASCADE,
  repair_type_id uuid NOT NULL REFERENCES public.repair_types(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (model_id, repair_type_id)
);

-- Enable RLS
ALTER TABLE public.model_repair_prices ENABLE ROW LEVEL SECURITY;

-- RLS policies - public access (matching existing pattern)
CREATE POLICY "Allow public read model_repair_prices" ON public.model_repair_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert model_repair_prices" ON public.model_repair_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update model_repair_prices" ON public.model_repair_prices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete model_repair_prices" ON public.model_repair_prices FOR DELETE USING (true);

-- Migrate existing price data from iphone_models into junction table
-- We need to match repair_types by name to the correct price columns
INSERT INTO public.model_repair_prices (model_id, repair_type_id, price)
SELECT m.id, rt.id, 
  CASE 
    WHEN rt.name LIKE '%מסך מקורי%' THEN m.original_screen_price
    WHEN rt.name LIKE '%מסך תואם%' THEN m.compatible_screen_price
    WHEN rt.name LIKE '%סוללה%' THEN m.battery_price
    WHEN rt.name LIKE '%גב%' THEN m.back_glass_price
    WHEN rt.name LIKE '%טעינה%' THEN m.charging_price
    ELSE 0
  END as price
FROM public.iphone_models m
CROSS JOIN public.repair_types rt
WHERE rt.name LIKE '%מסך מקורי%' 
   OR rt.name LIKE '%מסך תואם%'
   OR rt.name LIKE '%סוללה%'
   OR rt.name LIKE '%גב%'
   OR rt.name LIKE '%טעינה%'
ON CONFLICT (model_id, repair_type_id) DO NOTHING;
