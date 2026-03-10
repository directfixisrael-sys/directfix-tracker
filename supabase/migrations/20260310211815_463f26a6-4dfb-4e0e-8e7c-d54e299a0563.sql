
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  is_returning_customer BOOLEAN NOT NULL DEFAULT false,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view leads" ON public.leads FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update leads" ON public.leads FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete leads" ON public.leads FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
