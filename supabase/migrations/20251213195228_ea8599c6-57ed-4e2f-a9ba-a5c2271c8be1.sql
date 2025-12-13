-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  badge_text TEXT,
  icon TEXT DEFAULT 'gift',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true);

-- Create policies for admin management (public for now, no auth)
CREATE POLICY "Anyone can insert promotions"
ON public.promotions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update promotions"
ON public.promotions
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete promotions"
ON public.promotions
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();