
-- Add time columns to blocked_dates for partial day blocking
ALTER TABLE public.blocked_dates 
ADD COLUMN start_time time WITHOUT TIME ZONE DEFAULT NULL,
ADD COLUMN end_time time WITHOUT TIME ZONE DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.blocked_dates.start_time IS 'If null, entire day is blocked. If set, only the time range is blocked.';
COMMENT ON COLUMN public.blocked_dates.end_time IS 'End time of blocked range. Required if start_time is set.';
