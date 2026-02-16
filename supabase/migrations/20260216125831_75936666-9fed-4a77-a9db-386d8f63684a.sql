
-- Add auto-increment order number
ALTER TABLE public.orders ADD COLUMN order_number SERIAL;

-- Create unique index
CREATE UNIQUE INDEX idx_orders_order_number ON public.orders (order_number);
