-- Add warranty_expiry to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS warranty_expiry date DEFAULT NULL;

-- Add bundle_discount to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS bundle_discount numeric DEFAULT 0;

-- Add bundle_items to track what's in the bundle
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS bundle_items jsonb DEFAULT '[]'::jsonb;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_phone text NOT NULL,
  referred_phone text NOT NULL,
  referrer_discount numeric NOT NULL DEFAULT 50,
  referred_discount numeric NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'pending',
  order_id uuid REFERENCES public.orders(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Anyone can view referrals" ON public.referrals
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update referrals" ON public.referrals
  FOR UPDATE USING (true);

-- Create repair_bundles table for configurable bundles
CREATE TABLE IF NOT EXISTS public.repair_bundles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  primary_repair_type text NOT NULL,
  addon_repair_type text NOT NULL,
  discount_percent numeric NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on repair_bundles
ALTER TABLE public.repair_bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies for repair_bundles
CREATE POLICY "Anyone can view active bundles" ON public.repair_bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can manage bundles" ON public.repair_bundles
  FOR ALL USING (true);

-- Insert default bundles
INSERT INTO public.repair_bundles (name, primary_repair_type, addon_repair_type, discount_percent)
VALUES 
  ('מסך מקורי + סוללה', 'מסך מקורי', 'סוללה', 30),
  ('מסך תואם + סוללה', 'מסך תואם', 'סוללה', 30);

-- Enable realtime for referrals
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.repair_bundles;