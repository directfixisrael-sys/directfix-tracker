
-- Fix: Remove public delete on device-images bucket
DROP POLICY IF EXISTS "Anyone can delete device images" ON storage.objects;

-- Fix: Remove public read on resumes bucket (private bucket, should not be publicly readable)
DROP POLICY IF EXISTS "Anyone can read resumes" ON storage.objects;

-- Fix: Remove broad SELECT policy that allows listing all device-images files.
-- The bucket is public, so direct file URLs continue to work via the CDN without this policy.
DROP POLICY IF EXISTS "Anyone can view device images" ON storage.objects;

-- Fix: SECURITY DEFINER function executable by anon/authenticated.
-- Switch to SECURITY INVOKER; coupons UPDATE policy already permits the operation.
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;
