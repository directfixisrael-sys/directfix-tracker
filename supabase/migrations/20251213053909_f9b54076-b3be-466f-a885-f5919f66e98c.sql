-- Create table for blocked/vacation dates
CREATE TABLE public.blocked_dates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read blocked dates (needed for booking flow)
CREATE POLICY "Anyone can view blocked dates" 
ON public.blocked_dates 
FOR SELECT 
USING (true);

-- Create index for faster date lookups
CREATE INDEX idx_blocked_dates_date ON public.blocked_dates(date);