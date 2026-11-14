CREATE OR REPLACE FUNCTION public.get_loyalty_balance(_phone text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, coalesce(sum(CASE WHEN type = 'redeemed' THEN -points ELSE points END), 0))::int
  FROM public.loyalty_points
  WHERE customer_phone = regexp_replace(coalesce(_phone, ''), '\D', '', 'g');
$$;