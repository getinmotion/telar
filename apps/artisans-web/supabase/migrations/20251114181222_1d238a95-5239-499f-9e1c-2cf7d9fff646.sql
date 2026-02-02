-- Crear tabla para clasificaciones oficiales de artesanos
CREATE TABLE IF NOT EXISTS artisan_official_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Materia Prima
  materia_prima TEXT NOT NULL,
  codigo_materia_prima_cuoc TEXT,
  codigo_materia_prima_adec TEXT,
  
  -- Oficio
  oficio TEXT NOT NULL,
  codigo_oficio_cuoc TEXT,
  codigo_oficio_adec TEXT,
  
  -- Técnicas (JSONB array)
  tecnicas JSONB DEFAULT '[]'::jsonb,
  
  -- Metadatos
  confianza DECIMAL(3,2) CHECK (confianza >= 0 AND confianza <= 1),
  justificacion TEXT,
  clasificado_automaticamente BOOLEAN DEFAULT true,
  clasificado_por_usuario BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_artisan_class_user ON artisan_official_classifications(user_id);
CREATE INDEX idx_artisan_class_oficio ON artisan_official_classifications(oficio);
CREATE INDEX idx_artisan_class_materia ON artisan_official_classifications(materia_prima);

-- RLS Policies
ALTER TABLE artisan_official_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own classifications"
ON artisan_official_classifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classifications"
ON artisan_official_classifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classifications"
ON artisan_official_classifications FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_artisan_classifications_updated_at
  BEFORE UPDATE ON artisan_official_classifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();