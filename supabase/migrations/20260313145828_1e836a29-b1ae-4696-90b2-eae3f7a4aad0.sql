
-- Add club membership tracking to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_club_member boolean NOT NULL DEFAULT false;

-- Create club_members table to track members independently
CREATE TABLE IF NOT EXISTS public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  wants_promotions boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club members" ON public.club_members FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert club members" ON public.club_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update club members" ON public.club_members FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete club members" ON public.club_members FOR DELETE TO public USING (true);
