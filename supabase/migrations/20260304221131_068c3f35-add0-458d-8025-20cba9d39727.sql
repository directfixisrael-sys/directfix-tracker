
CREATE TABLE public.admin_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reminders" ON public.admin_reminders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reminders" ON public.admin_reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reminders" ON public.admin_reminders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reminders" ON public.admin_reminders FOR DELETE USING (true);
