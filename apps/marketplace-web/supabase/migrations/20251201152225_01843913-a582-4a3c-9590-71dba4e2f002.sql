-- Tabla para almacenar códigos OTP temporales
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  code TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por identifier
CREATE INDEX idx_otp_codes_identifier ON public.otp_codes(identifier);

-- Índice para limpieza de códigos expirados
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Habilitar RLS (solo edge functions con service role pueden acceder)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;