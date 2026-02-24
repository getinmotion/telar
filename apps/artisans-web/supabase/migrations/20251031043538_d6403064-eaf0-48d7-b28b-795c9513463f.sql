-- Create brand_themes table for complete color palettes
CREATE TABLE IF NOT EXISTS brand_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Complete color palette with tonal scales
  palette JSONB NOT NULL,
  
  -- Style context (tone, emotion, contrast, texture)
  style_context JSONB,
  
  -- Usage rules for UI elements
  usage_rules JSONB,
  
  -- Human-readable preview description
  preview_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_brand_themes_user_id ON brand_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_themes_active ON brand_themes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brand_themes_theme_id ON brand_themes(theme_id);

-- Enable RLS
ALTER TABLE brand_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own themes"
  ON brand_themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own themes"
  ON brand_themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON brand_themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON brand_themes FOR DELETE
  USING (auth.uid() = user_id);

-- Add active_theme_id to artisan_shops
ALTER TABLE artisan_shops 
ADD COLUMN IF NOT EXISTS active_theme_id TEXT REFERENCES brand_themes(theme_id);

-- Create index on active_theme_id
CREATE INDEX IF NOT EXISTS idx_artisan_shops_active_theme ON artisan_shops(active_theme_id);

-- Update timestamp trigger for brand_themes
CREATE OR REPLACE FUNCTION update_brand_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brand_themes_updated_at
  BEFORE UPDATE ON brand_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_themes_updated_at();