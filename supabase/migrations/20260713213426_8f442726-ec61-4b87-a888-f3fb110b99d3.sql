
-- Lock down orders SELECT/UPDATE/DELETE to admin only. Keep anon INSERT for public order creation.
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "orders_select_all" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "orders_update_all" ON public.orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_all" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_all" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;

-- List and drop ALL existing policies on orders (safety catch-all)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
  END LOOP;
END $$;

-- Revoke broad grants; keep only what we need
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.orders FROM authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Only admins can read/update/delete orders directly. Anon can only INSERT (create order).
CREATE POLICY "Admins full access on orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon can create orders"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (
    customer_phone IS NOT NULL
    AND customer_name IS NOT NULL
    AND length(customer_phone) BETWEEN 7 AND 20
    AND length(customer_name) BETWEEN 1 AND 100
  );

-- Same for messages
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', r.policyname);
  END LOOP;
END $$;

REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.messages FROM authenticated;
GRANT INSERT ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

CREATE POLICY "Admins full access on messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anon can insert chat messages (must reference a real order)
CREATE POLICY "Anon can send messages"
  ON public.messages FOR INSERT
  TO anon
  WITH CHECK (
    order_id IS NOT NULL
    AND sender IN ('customer','support')
    AND length(message) BETWEEN 1 AND 2000
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id)
  );
