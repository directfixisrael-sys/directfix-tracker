-- Add compatible screen price column
ALTER TABLE public.iphone_models 
ADD COLUMN compatible_screen_price NUMERIC NOT NULL DEFAULT 0;

-- Update existing models with compatible screen prices (about 30-40% cheaper)
UPDATE public.iphone_models SET compatible_screen_price = ROUND(screen_price * 0.65) WHERE compatible_screen_price = 0;

-- Rename screen_price to original_screen_price for clarity
ALTER TABLE public.iphone_models RENAME COLUMN screen_price TO original_screen_price;

-- Add more repair types for original vs compatible
INSERT INTO public.repair_types (name, description, icon, is_phone_only, sort_order) VALUES
('החלפת מסך תואם', 'מסך איכותי במחיר משתלם', 'smartphone', false, 0);

-- Update sort orders
UPDATE public.repair_types SET sort_order = 1 WHERE name = 'החלפת מסך תואם';
UPDATE public.repair_types SET sort_order = 2, name = 'החלפת מסך מקורי', description = 'מסך מקורי Apple באיכות מעולה' WHERE name = 'החלפת מסך';
UPDATE public.repair_types SET sort_order = 3, name = 'החלפת סוללה מקורית', description = '100% בריאות סוללה ללא התראות' WHERE name = 'החלפת סוללה';
UPDATE public.repair_types SET sort_order = 4 WHERE name = 'תיקון אחר';