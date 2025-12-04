-- Add invoice_link column to orders table
ALTER TABLE public.orders ADD COLUMN invoice_link text;