-- Add payment_link column to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_link text DEFAULT NULL;

-- Add payment_status column to track if paid
ALTER TABLE public.orders 
ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'none'));