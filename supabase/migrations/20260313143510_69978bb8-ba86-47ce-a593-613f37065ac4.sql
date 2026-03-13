
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  email text,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  reset_token text,
  reset_token_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- No public access - only edge functions with service role can access
CREATE POLICY "No public access to customer_profiles"
ON public.customer_profiles
FOR ALL
TO public
USING (false);

-- Add updated_at trigger
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
