-- Create design_system_config table for dynamic color management
CREATE TABLE IF NOT EXISTS public.design_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN NOT NULL DEFAULT false,
  color_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_theme UNIQUE(user_id, theme_name)
);

-- Create design_system_history table for change tracking
CREATE TABLE IF NOT EXISTS public.design_system_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.design_system_config(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_element TEXT, -- 'logo', 'colors', 'palette', 'gradient', etc.
  changes_made JSONB NOT NULL,
  score_before NUMERIC,
  score_after NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for design_system_config
ALTER TABLE public.design_system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage design system config"
ON public.design_system_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

CREATE POLICY "Users can view active global config"
ON public.design_system_config
FOR SELECT
USING (user_id IS NULL AND is_active = true);

-- RLS policies for design_system_history
ALTER TABLE public.design_system_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view design system history"
ON public.design_system_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_design_system_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_design_system_config_updated_at
BEFORE UPDATE ON public.design_system_config
FOR EACH ROW
EXECUTE FUNCTION update_design_system_config_updated_at();

-- Insert default configuration with current values
INSERT INTO public.design_system_config (
  user_id,
  theme_name,
  is_active,
  color_variables
) VALUES (
  NULL, -- Global config
  'default',
  true,
  '{
    "semantic": {
      "primary": "220 50% 15%",
      "primary-foreground": "0 0% 100%",
      "primary-glow": "220 45% 25%",
      "primary-subtle": "220 30% 96%",
      "secondary": "45 95% 45%",
      "secondary-foreground": "0 0% 100%",
      "secondary-glow": "45 95% 55%",
      "accent": "17 75% 52%",
      "accent-foreground": "0 0% 100%",
      "background": "40 50% 98%",
      "foreground": "220 50% 15%",
      "card": "0 0% 100%",
      "card-foreground": "220 50% 15%",
      "muted": "40 30% 90%",
      "muted-foreground": "220 35% 25%",
      "success": "142 76% 36%",
      "success-foreground": "0 0% 100%",
      "warning": "43 96% 56%",
      "warning-foreground": "222.2 84% 4.9%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      "border": "214.3 31.8% 91.4%",
      "input": "214.3 31.8% 91.4%",
      "ring": "222.2 84% 4.9%"
    },
    "palettes": {
      "navy": {
        "50": "220 50% 98%",
        "100": "220 50% 95%",
        "200": "220 50% 85%",
        "300": "220 50% 70%",
        "400": "220 50% 50%",
        "500": "220 50% 35%",
        "600": "220 50% 25%",
        "700": "220 50% 15%",
        "800": "220 50% 10%",
        "900": "220 50% 5%"
      },
      "golden": {
        "50": "45 100% 95%",
        "100": "45 100% 88%",
        "200": "45 100% 78%",
        "300": "45 100% 68%",
        "400": "45 100% 58%",
        "500": "45 100% 54%",
        "600": "45 95% 48%",
        "700": "45 90% 42%",
        "800": "45 85% 35%",
        "900": "45 80% 28%"
      },
      "coral": {
        "50": "20 89% 95%",
        "100": "20 89% 88%",
        "200": "20 89% 78%",
        "300": "20 89% 70%",
        "400": "20 89% 66%",
        "500": "20 89% 60%",
        "600": "20 85% 52%",
        "700": "20 80% 45%",
        "800": "20 75% 38%",
        "900": "20 70% 30%"
      },
      "cream": {
        "50": "40 50% 99%",
        "100": "40 50% 98%",
        "200": "40 45% 94%",
        "300": "40 40% 88%",
        "400": "40 35% 82%",
        "500": "40 30% 75%"
      }
    },
    "gradients": {
      "gradient-primary": "linear-gradient(135deg, hsl(220 50% 15%), hsl(220 45% 25%))",
      "gradient-secondary": "linear-gradient(135deg, hsl(45 100% 54%), hsl(45 95% 64%))",
      "gradient-accent": "linear-gradient(135deg, hsl(20 89% 66%), hsl(45 100% 54%))",
      "gradient-subtle": "linear-gradient(180deg, hsl(40 50% 98%), hsl(40 45% 94%))",
      "gradient-hero": "linear-gradient(135deg, hsl(220 50% 15% / 0.9), hsl(45 100% 54% / 0.8))",
      "gradient-warm": "linear-gradient(135deg, hsl(20 89% 66%), hsl(40 50% 98%))",
      "gradient-brand": "linear-gradient(135deg, hsl(220 50% 15%), hsl(45 100% 54%), hsl(20 89% 66%))",
      "gradient-card": "linear-gradient(145deg, hsl(0 0% 100%), hsl(40 50% 98%))",
      "gradient-glass": "linear-gradient(145deg, hsl(0 0% 100% / 0.8), hsl(40 50% 98% / 0.4))"
    },
    "shadows": {
      "shadow-elegant": "0 10px 30px -10px hsl(220 50% 15% / 0.3)",
      "shadow-glow": "0 0 40px hsl(45 100% 54% / 0.4)",
      "shadow-card": "0 4px 20px hsl(220 50% 15% / 0.08)",
      "shadow-hover": "0 20px 40px -10px hsl(220 50% 15% / 0.15)",
      "shadow-glass": "0 8px 32px hsl(220 50% 15% / 0.12)",
      "shadow-soft": "0 2px 8px hsl(220 50% 15% / 0.06)"
    }
  }'::jsonb
) ON CONFLICT (user_id, theme_name) DO NOTHING;

COMMENT ON TABLE public.design_system_config IS 'Stores dynamic design system configuration including color palettes, semantic tokens, gradients, and shadows';
COMMENT ON TABLE public.design_system_history IS 'Tracks all changes made to design system configuration for rollback and auditing';