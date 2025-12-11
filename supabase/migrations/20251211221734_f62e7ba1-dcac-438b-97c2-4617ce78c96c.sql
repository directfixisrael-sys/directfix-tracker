-- Create table for iPhone models and their prices
CREATE TABLE public.iphone_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  screen_price NUMERIC NOT NULL DEFAULT 0,
  battery_price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for repair types
CREATE TABLE public.repair_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'smartphone',
  is_phone_only BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.iphone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (needed for order form)
CREATE POLICY "Allow public read iphone_models" 
ON public.iphone_models 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read repair_types" 
ON public.repair_types 
FOR SELECT 
USING (true);

-- Create policies for public write access (for admin panel)
CREATE POLICY "Allow public insert iphone_models" 
ON public.iphone_models 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update iphone_models" 
ON public.iphone_models 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete iphone_models" 
ON public.iphone_models 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public insert repair_types" 
ON public.repair_types 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update repair_types" 
ON public.repair_types 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete repair_types" 
ON public.repair_types 
FOR DELETE 
USING (true);

-- Add update triggers
CREATE TRIGGER update_iphone_models_updated_at
BEFORE UPDATE ON public.iphone_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_types_updated_at
BEFORE UPDATE ON public.repair_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default iPhone models
INSERT INTO public.iphone_models (name, screen_price, battery_price, sort_order) VALUES
('iPhone 16 Pro Max', 1350, 280, 1),
('iPhone 16 Pro', 1250, 280, 2),
('iPhone 16 Plus', 1100, 250, 3),
('iPhone 16', 1000, 250, 4),
('iPhone 15 Pro Max', 1200, 250, 5),
('iPhone 15 Pro', 1100, 250, 6),
('iPhone 15 Plus', 950, 220, 7),
('iPhone 15', 850, 220, 8),
('iPhone 14 Pro Max', 1000, 220, 9),
('iPhone 14 Pro', 900, 220, 10),
('iPhone 14 Plus', 750, 200, 11),
('iPhone 14', 650, 200, 12),
('iPhone 13 Pro Max', 800, 200, 13),
('iPhone 13 Pro', 700, 200, 14),
('iPhone 13', 550, 180, 15),
('iPhone 13 Mini', 500, 180, 16),
('iPhone 12 Pro Max', 650, 180, 17),
('iPhone 12 Pro', 600, 180, 18),
('iPhone 12', 450, 150, 19),
('iPhone 12 Mini', 400, 150, 20),
('iPhone 11 Pro Max', 550, 150, 21),
('iPhone 11 Pro', 500, 150, 22),
('iPhone 11', 350, 130, 23),
('iPhone XR', 300, 130, 24),
('iPhone XS Max', 400, 130, 25),
('iPhone XS', 350, 130, 26),
('iPhone X', 300, 120, 27),
('iPhone 8 Plus', 250, 100, 28),
('iPhone 8', 200, 100, 29);

-- Insert default repair types
INSERT INTO public.repair_types (name, description, icon, is_phone_only, sort_order) VALUES
('החלפת מסך', 'מסך שבור או לא מגיב', 'smartphone', false, 1),
('החלפת סוללה', 'סוללה חלשה או נפוחה', 'battery', false, 2),
('תיקון אחר', 'צור קשר טלפוני', 'phone', true, 3);