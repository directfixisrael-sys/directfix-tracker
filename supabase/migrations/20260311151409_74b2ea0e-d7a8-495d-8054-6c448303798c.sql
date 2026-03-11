ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS device_type text NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS repair_type text NULL;