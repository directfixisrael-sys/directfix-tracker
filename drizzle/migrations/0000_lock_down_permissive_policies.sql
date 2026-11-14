-- ===== Admin-only management tables =====
-- admin_reminders
DROP POLICY IF EXISTS "Anyone can delete reminders" ON public.admin_reminders;
DROP POLICY IF EXISTS "Anyone can insert reminders" ON public.admin_reminders;
DROP POLICY IF EXISTS "Anyone can view reminders" ON public.admin_reminders;
DROP POLICY IF EXISTS "Anyone can update reminders" ON public.admin_reminders;
CREATE POLICY "Admins manage reminders" ON public.admin_reminders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- club_members
DROP POLICY IF EXISTS "Anyone can delete club members" ON public.club_members;
DROP POLICY IF EXISTS "Anyone can insert club members" ON public.club_members;
DROP POLICY IF EXISTS "Anyone can view club members" ON public.club_members;
DROP POLICY IF EXISTS "Anyone can update club members" ON public.club_members;
CREATE POLICY "Admins manage club members" ON public.club_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- loyalty_points
DROP POLICY IF EXISTS "Anyone can delete loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Anyone can insert loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Anyone can view loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Anyone can update loyalty points" ON public.loyalty_points;
CREATE POLICY "Admins manage loyalty points" ON public.loyalty_points FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- leads
DROP POLICY IF EXISTS "Anyone can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- referrals
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can view referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can update referrals" ON public.referrals;
CREATE POLICY "Admins view referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update referrals" ON public.referrals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- push_subscriptions (managed from the admin panel)
DROP POLICY IF EXISTS "Allow public delete push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public insert push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Deny public read push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins manage push subscriptions" ON public.push_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- marketing_events: written only by the meta-capi function (service role)
DROP POLICY IF EXISTS "Anyone can log marketing events" ON public.marketing_events;

-- wp_button_clicks: written only by the log-wp-click function (service role)
DROP POLICY IF EXISTS "Anyone can insert wp clicks" ON public.wp_button_clicks;
DROP POLICY IF EXISTS "Anyone can view wp clicks" ON public.wp_button_clicks;
CREATE POLICY "Admins view wp clicks" ON public.wp_button_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- site_visits: visitors may log validated visits, only admins read
DROP POLICY IF EXISTS "Anyone can insert site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Anyone can view site visits" ON public.site_visits;
CREATE POLICY "Visitors log validated site visits" ON public.site_visits FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(visitor_id) BETWEEN 1 AND 100
    AND char_length(page) BETWEEN 1 AND 500
    AND (step IS NULL OR char_length(step) <= 200)
    AND (lead_source IS NULL OR char_length(lead_source) <= 200)
    AND (referrer IS NULL OR char_length(referrer) <= 1000)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
    AND (language IS NULL OR char_length(language) <= 50)
    AND (device_type IS NULL OR char_length(device_type) <= 50)
  );
CREATE POLICY "Admins view site visits" ON public.site_visits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- voice_leads: voice agent may submit validated leads, only admins read/manage
DROP POLICY IF EXISTS "Anyone can delete voice leads" ON public.voice_leads;
DROP POLICY IF EXISTS "Anyone can insert voice leads" ON public.voice_leads;
DROP POLICY IF EXISTS "Anyone can view voice leads" ON public.voice_leads;
DROP POLICY IF EXISTS "Anyone can update voice leads" ON public.voice_leads;
CREATE POLICY "Visitors submit validated voice leads" ON public.voice_leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    status IN ('new', 'vacation')
    AND char_length(customer_name) <= 200
    AND char_length(customer_phone) <= 30
    AND (issue_description IS NULL OR char_length(issue_description) <= 2000)
    AND (conversation_id IS NULL OR char_length(conversation_id) <= 200)
    AND coalesce(notes, '') = ''
  );
CREATE POLICY "Admins view voice leads" ON public.voice_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update voice leads" ON public.voice_leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete voice leads" ON public.voice_leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- voice_agent_settings: public reads the single settings row, admins change it
DROP POLICY IF EXISTS "Anyone can insert voice agent settings" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Anyone can view voice agent settings" ON public.voice_agent_settings;
DROP POLICY IF EXISTS "Anyone can update voice agent settings" ON public.voice_agent_settings;
CREATE POLICY "Public reads voice agent settings row" ON public.voice_agent_settings FOR SELECT TO anon, authenticated
  USING (singleton = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert voice agent settings" ON public.voice_agent_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update voice agent settings" ON public.voice_agent_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Public content managed by admins =====
-- announcements
DROP POLICY IF EXISTS "Anyone can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can update announcements" ON public.announcements;
CREATE POLICY "Public views active announcements" ON public.announcements FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- coupons (active-coupon read policy kept as-is)
DROP POLICY IF EXISTS "Anyone can delete coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Anyone can update coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- promotions (active-promotion read policy kept as-is)
DROP POLICY IF EXISTS "Anyone can delete promotions" ON public.promotions;
DROP POLICY IF EXISTS "Anyone can insert promotions" ON public.promotions;
DROP POLICY IF EXISTS "Anyone can update promotions" ON public.promotions;
CREATE POLICY "Admins manage promotions" ON public.promotions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- repair_bundles (active-bundle read policy kept as-is)
DROP POLICY IF EXISTS "Anyone can manage bundles" ON public.repair_bundles;
CREATE POLICY "Admins manage bundles" ON public.repair_bundles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- blocked_dates: public sees current/upcoming blocks for scheduling
DROP POLICY IF EXISTS "Anyone can delete blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Anyone can insert blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public views upcoming blocked dates" ON public.blocked_dates FOR SELECT TO anon, authenticated
  USING (date >= current_date - 1);
CREATE POLICY "Admins manage blocked dates" ON public.blocked_dates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- iphone_models
DROP POLICY IF EXISTS "Allow public delete iphone_models" ON public.iphone_models;
DROP POLICY IF EXISTS "Allow public insert iphone_models" ON public.iphone_models;
DROP POLICY IF EXISTS "Allow public read iphone_models" ON public.iphone_models;
DROP POLICY IF EXISTS "Allow public update iphone_models" ON public.iphone_models;
CREATE POLICY "Public views active iphone models" ON public.iphone_models FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage iphone models" ON public.iphone_models FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ipad_models
DROP POLICY IF EXISTS "Allow public delete ipad_models" ON public.ipad_models;
DROP POLICY IF EXISTS "Allow public insert ipad_models" ON public.ipad_models;
DROP POLICY IF EXISTS "Allow public read ipad_models" ON public.ipad_models;
DROP POLICY IF EXISTS "Allow public update ipad_models" ON public.ipad_models;
CREATE POLICY "Public views active ipad models" ON public.ipad_models FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage ipad models" ON public.ipad_models FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- repair_types
DROP POLICY IF EXISTS "Allow public delete repair_types" ON public.repair_types;
DROP POLICY IF EXISTS "Allow public insert repair_types" ON public.repair_types;
DROP POLICY IF EXISTS "Allow public read repair_types" ON public.repair_types;
DROP POLICY IF EXISTS "Allow public update repair_types" ON public.repair_types;
CREATE POLICY "Public views active repair types" ON public.repair_types FOR SELECT TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage repair types" ON public.repair_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- model_repair_prices
DROP POLICY IF EXISTS "Allow public delete model_repair_prices" ON public.model_repair_prices;
DROP POLICY IF EXISTS "Allow public insert model_repair_prices" ON public.model_repair_prices;
DROP POLICY IF EXISTS "Allow public read model_repair_prices" ON public.model_repair_prices;
DROP POLICY IF EXISTS "Allow public update model_repair_prices" ON public.model_repair_prices;
CREATE POLICY "Public views prices of active models" ON public.model_repair_prices FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.iphone_models m WHERE m.id = model_repair_prices.model_id AND m.is_active = true));
CREATE POLICY "Admins manage model repair prices" ON public.model_repair_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Storage: uploads now go through the public-upload server function =====
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload device images" ON storage.objects;

-- ===== Coupon usage counter must work without public UPDATE on coupons =====
ALTER FUNCTION public.increment_coupon_usage(text) SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO anon, authenticated;

-- ===== Narrow public functions replacing direct table access =====
CREATE OR REPLACE FUNCTION public.is_active_club_member(_phone text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE phone = regexp_replace(coalesce(_phone, ''), '\D', '', 'g') AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_loyalty_balance(_phone text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, coalesce(sum(CASE WHEN type = 'earned' THEN points ELSE -points END), 0))::int
  FROM public.loyalty_points
  WHERE customer_phone = regexp_replace(coalesce(_phone, ''), '\D', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.join_club(_phone text, _name text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p text := regexp_replace(coalesce(_phone, ''), '\D', '', 'g');
  n text := left(btrim(coalesce(_name, '')), 100);
BEGIN
  IF char_length(p) < 9 OR char_length(p) > 15 OR n = '' THEN
    RETURN 'invalid';
  END IF;
  IF EXISTS (SELECT 1 FROM public.club_members WHERE phone = p) THEN
    RETURN 'exists';
  END IF;
  INSERT INTO public.club_members (phone, name, email, is_active, wants_promotions)
  VALUES (p, n, NULL, true, true);
  INSERT INTO public.loyalty_points (customer_phone, points, type, description)
  VALUES (p, 50, 'earned', 'בונוס הצטרפות למועדון — מבצע מרץ 2026');
  RETURN 'ok';
END;
$$;

CREATE OR REPLACE FUNCTION public.create_lead(
  _customer_name text, _customer_phone text, _customer_email text DEFAULT NULL,
  _privacy_accepted boolean DEFAULT false, _last_step text DEFAULT '',
  _device_type text DEFAULT NULL, _repair_type text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.leads (customer_name, customer_phone, customer_email, privacy_accepted,
                            is_returning_customer, converted, last_step, device_type, repair_type)
  VALUES (
    left(btrim(coalesce(_customer_name, '')), 200),
    left(regexp_replace(coalesce(_customer_phone, ''), '\D', '', 'g'), 15),
    NULLIF(left(btrim(coalesce(_customer_email, '')), 200), ''),
    coalesce(_privacy_accepted, false),
    false, false,
    left(coalesce(_last_step, ''), 200),
    NULLIF(left(coalesce(_device_type, ''), 200), ''),
    NULLIF(left(coalesce(_repair_type, ''), 200), '')
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Lead id (random UUID returned only to the visitor who created it) acts as the capability
CREATE OR REPLACE FUNCTION public.update_lead(
  _lead_id uuid, _last_step text DEFAULT NULL, _device_type text DEFAULT NULL,
  _repair_type text DEFAULT NULL, _customer_name text DEFAULT NULL,
  _customer_phone text DEFAULT NULL, _customer_email text DEFAULT NULL,
  _converted boolean DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.leads SET
    last_step = coalesce(left(_last_step, 200), last_step),
    device_type = coalesce(left(_device_type, 200), device_type),
    repair_type = coalesce(left(_repair_type, 200), repair_type),
    customer_name = coalesce(left(btrim(_customer_name), 200), customer_name),
    customer_phone = coalesce(left(regexp_replace(_customer_phone, '\D', '', 'g'), 15), customer_phone),
    customer_email = coalesce(NULLIF(left(btrim(_customer_email), 200), ''), customer_email),
    converted = CASE WHEN _converted IS TRUE THEN true ELSE converted END,
    updated_at = now()
  WHERE id = _lead_id AND converted = false AND created_at > now() - interval '2 days';
END;
$$;

-- Called once right after an order is created; derives everything from the stored order
CREATE OR REPLACE FUNCTION public.finalize_order_loyalty(
  _order_id uuid, _join_club boolean, _redeem_points integer DEFAULT 0
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  o RECORD;
  balance int;
  earn int;
BEGIN
  SELECT id, customer_phone, customer_name, customer_email, repair_price, created_at
  INTO o FROM public.orders WHERE id = _order_id;
  IF NOT FOUND OR o.created_at < now() - interval '30 minutes' THEN
    RETURN;
  END IF;
  -- idempotent: only once per order
  IF EXISTS (SELECT 1 FROM public.loyalty_points WHERE order_id = o.id) THEN
    RETURN;
  END IF;

  UPDATE public.leads SET converted = true, updated_at = now()
  WHERE customer_phone = o.customer_phone AND converted = false;

  IF coalesce(_redeem_points, 0) > 0 THEN
    balance := public.get_loyalty_balance(o.customer_phone);
    IF balance > 0 THEN
      INSERT INTO public.loyalty_points (customer_phone, points, type, description, order_id)
      VALUES (o.customer_phone, LEAST(_redeem_points, balance), 'redeemed', 'מימוש נקודות - הזמנה', o.id);
    END IF;
  END IF;

  IF _join_club IS TRUE THEN
    INSERT INTO public.club_members (phone, name, email, wants_promotions, is_active)
    VALUES (o.customer_phone, o.customer_name, o.customer_email, true, true)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name,
      email = coalesce(EXCLUDED.email, public.club_members.email),
      wants_promotions = true, is_active = true;
    UPDATE public.orders SET is_club_member = true WHERE id = o.id;
    earn := (floor(coalesce(o.repair_price, 0) / 100) * 10)::int;
    IF earn > 0 THEN
      INSERT INTO public.loyalty_points (customer_phone, points, type, description, order_id)
      VALUES (o.customer_phone, earn, 'earned', 'צבירה מתיקון - חבר מועדון', o.id);
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.is_active_club_member(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_loyalty_balance(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_club(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_lead(text, text, text, boolean, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_lead(uuid, text, text, text, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_order_loyalty(uuid, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_club_member(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_loyalty_balance(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_club(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_lead(text, text, text, boolean, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead(uuid, text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_order_loyalty(uuid, boolean, integer) TO anon, authenticated;