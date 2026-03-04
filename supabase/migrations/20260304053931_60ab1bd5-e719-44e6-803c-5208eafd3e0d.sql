CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  message text NOT NULL,
  placement text NOT NULL DEFAULT 'header_banner',
  is_active boolean NOT NULL DEFAULT true,
  bg_color text DEFAULT 'warning',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete announcements" ON public.announcements FOR DELETE USING (true);