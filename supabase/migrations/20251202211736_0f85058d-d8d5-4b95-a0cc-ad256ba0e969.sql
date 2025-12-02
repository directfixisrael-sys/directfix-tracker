-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT '',
  issue_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_arrival TEXT,
  technician_name TEXT,
  repair_price NUMERIC NOT NULL DEFAULT 0,
  accessories JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT[] NOT NULL DEFAULT '{}',
  wants_promotions BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER,
  feedback TEXT,
  is_viewing BOOLEAN DEFAULT false,
  last_viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for orders (no auth required for this simple app)
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

-- Public read/write policies for messages
CREATE POLICY "Allow public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update messages" ON public.messages FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;