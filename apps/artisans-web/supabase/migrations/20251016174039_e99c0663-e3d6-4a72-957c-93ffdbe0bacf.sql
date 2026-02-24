-- Extensión de user_profiles para registro Colombia
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_e164 TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS rut TEXT,
ADD COLUMN IF NOT EXISTS rut_pendiente BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_opt_in BOOLEAN DEFAULT false;

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_user_profiles_rut_pendiente ON user_profiles(rut_pendiente) WHERE rut_pendiente = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);

-- Comentarios descriptivos
COMMENT ON COLUMN user_profiles.whatsapp_e164 IS 'WhatsApp en formato E.164 (+57XXXXXXXXXX)';
COMMENT ON COLUMN user_profiles.rut IS 'Registro Único Tributario con dígito verificador';
COMMENT ON COLUMN user_profiles.rut_pendiente IS 'Indica si el usuario necesita tramitar su RUT';

-- Tabla para gestionar tokens de verificación
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at) WHERE used_at IS NULL;

-- RLS Policies
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert verification tokens" ON email_verifications;
CREATE POLICY "System can insert verification tokens"
ON email_verifications FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own tokens" ON email_verifications;
CREATE POLICY "Users can view own tokens"
ON email_verifications FOR SELECT
USING (auth.uid() = user_id);

-- Función de limpieza automática de tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < now() - interval '7 days';
END;
$$;

-- Actualizar trigger handle_new_user para manejar nuevos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    first_name,
    last_name,
    full_name,
    whatsapp_e164,
    department,
    city,
    rut,
    rut_pendiente,
    newsletter_opt_in,
    language_preference
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name')
    ),
    new.raw_user_meta_data->>'whatsapp_e164',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'rut',
    COALESCE((new.raw_user_meta_data->>'rut_pendiente')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'newsletter_opt_in')::boolean, false),
    'es'
  );
  RETURN new;
END;
$$;