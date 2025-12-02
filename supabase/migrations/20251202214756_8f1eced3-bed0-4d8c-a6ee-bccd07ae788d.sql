-- Add waze_link column to orders table
ALTER TABLE public.orders 
ADD COLUMN waze_link text;