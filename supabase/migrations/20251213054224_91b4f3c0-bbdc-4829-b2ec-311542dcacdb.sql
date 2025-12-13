-- Allow insert blocked dates (for admin use)
CREATE POLICY "Anyone can insert blocked dates" 
ON public.blocked_dates 
FOR INSERT 
WITH CHECK (true);

-- Allow delete blocked dates (for admin use)
CREATE POLICY "Anyone can delete blocked dates" 
ON public.blocked_dates 
FOR DELETE 
USING (true);