CREATE TABLE public.price_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_type_id uuid REFERENCES public.repair_types(id) ON DELETE CASCADE,
  model_id uuid REFERENCES public.iphone_models(id) ON DELETE CASCADE,
  promo_price numeric,
  discount_percent numeric,
  badge_text text NOT NULL DEFAULT 'מחיר מיוחד',
  info_text text NOT NULL DEFAULT 'מבצע מיוחד לזמן מוגבל, בכפוף לזמינות מלאי ולתיאום דרך המערכת.',
  starts_at date,
  ends_at date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.price_promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_promotions TO authenticated;
GRANT ALL ON public.price_promotions TO service_role;

ALTER TABLE public.price_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active price promotions"
ON public.price_promotions FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all price promotions"
ON public.price_promotions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert price promotions"
ON public.price_promotions FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update price promotions"
ON public.price_promotions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete price promotions"
ON public.price_promotions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_price_promotions_updated_at
BEFORE UPDATE ON public.price_promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();