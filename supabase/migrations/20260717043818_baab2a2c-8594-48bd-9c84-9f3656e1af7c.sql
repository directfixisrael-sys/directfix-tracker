DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public'
  LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.relname);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.relname);
  END LOOP;
END $$;

-- Public-readable catalog/config tables
GRANT SELECT ON public.iphone_models TO anon;
GRANT SELECT ON public.ipad_models TO anon;
GRANT SELECT ON public.repair_types TO anon;
GRANT SELECT ON public.repair_bundles TO anon;
GRANT SELECT ON public.model_repair_prices TO anon;
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT ON public.blocked_dates TO anon;
GRANT SELECT ON public.voice_agent_settings TO anon;

-- Public insert paths (RLS still validates content)
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.messages TO anon;
GRANT INSERT ON public.site_visits TO anon;
GRANT INSERT ON public.wp_button_clicks TO anon;
GRANT INSERT ON public.voice_leads TO anon;
GRANT INSERT ON public.push_subscriptions TO anon;
GRANT INSERT ON public.otp_codes TO anon;
GRANT INSERT, SELECT, UPDATE ON public.customer_profiles TO anon;