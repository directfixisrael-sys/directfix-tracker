GRANT SELECT ON public.price_promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_promotions TO authenticated;
GRANT ALL ON public.price_promotions TO service_role;