-- Create push subscriptions table for storing admin notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public policies for push subscriptions
CREATE POLICY "Allow public insert push_subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read push_subscriptions" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public delete push_subscriptions" ON public.push_subscriptions FOR DELETE USING (true);