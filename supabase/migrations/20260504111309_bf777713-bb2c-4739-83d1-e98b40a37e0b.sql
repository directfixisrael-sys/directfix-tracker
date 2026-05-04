-- OTP codes table for phone verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  attempts INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone_created ON public.otp_codes(phone, created_at DESC);
CREATE INDEX idx_otp_expires ON public.otp_codes(expires_at);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No public access - only edge functions (service role) can read/write
CREATE POLICY "No public access to otp_codes"
ON public.otp_codes FOR ALL
USING (false);