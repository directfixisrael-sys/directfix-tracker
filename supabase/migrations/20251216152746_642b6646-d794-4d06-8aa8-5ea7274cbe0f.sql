-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can insert coupons" ON public.coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update coupons" ON public.coupons
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete coupons" ON public.coupons
  FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add coupon fields to orders table
ALTER TABLE public.orders 
  ADD COLUMN coupon_code TEXT,
  ADD COLUMN coupon_discount NUMERIC DEFAULT 0,
  ADD COLUMN device_images TEXT[] DEFAULT '{}';

-- Create storage bucket for device images
INSERT INTO storage.buckets (id, name, public) VALUES ('device-images', 'device-images', true);

-- Storage policies for device images
CREATE POLICY "Anyone can upload device images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'device-images');

CREATE POLICY "Anyone can view device images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'device-images');

CREATE POLICY "Anyone can delete device images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'device-images');