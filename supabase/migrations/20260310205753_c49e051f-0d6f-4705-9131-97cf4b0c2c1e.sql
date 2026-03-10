
CREATE TABLE public.loyalty_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone text NOT NULL,
  points integer NOT NULL,
  type text NOT NULL DEFAULT 'earned',
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loyalty points" ON public.loyalty_points FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert loyalty points" ON public.loyalty_points FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update loyalty points" ON public.loyalty_points FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete loyalty points" ON public.loyalty_points FOR DELETE TO public USING (true);

CREATE INDEX idx_loyalty_points_phone ON public.loyalty_points(customer_phone);
