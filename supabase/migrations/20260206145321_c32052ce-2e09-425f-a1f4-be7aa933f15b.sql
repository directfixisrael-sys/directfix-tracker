
-- Add value column to promotions table for the monetary value of the promotion
ALTER TABLE public.promotions 
ADD COLUMN value numeric DEFAULT 0;
