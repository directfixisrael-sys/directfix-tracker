-- 1. Lock down push_subscriptions: deny public reads (edge functions use service role)
DROP POLICY IF EXISTS "Allow public read push_subscriptions" ON public.push_subscriptions;

-- Keep insert (clients subscribe) and delete (clients unsubscribe by endpoint), but block reads from anon/public
CREATE POLICY "Deny public read push_subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (false);

-- 2. Atomic coupon usage increment to prevent race conditions
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c RECORD;
BEGIN
  SELECT id, current_uses, max_uses, is_active
  INTO c
  FROM public.coupons
  WHERE code = coupon_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;

  IF NOT c.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'inactive');
  END IF;

  IF c.max_uses IS NOT NULL AND c.current_uses >= c.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'limit_exceeded');
  END IF;

  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE id = c.id;

  RETURN jsonb_build_object('success', true, 'current_uses', c.current_uses + 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO anon, authenticated;