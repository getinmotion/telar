-- Actualizar esquema de colores del entorno de producción a paleta verde artesanal
UPDATE environments
SET color_scheme = jsonb_build_object(
  'primary', 'hsl(145 65% 42%)',
  'primaryGlow', 'hsl(145 70% 58%)',
  'secondary', 'hsl(85 70% 45%)',
  'accent', 'hsl(35 85% 55%)',
  'headerBg', 'bg-gradient-to-r from-green-700 to-emerald-600'
)
WHERE name = 'production';

-- Mantener staging con colores diferentes para diferenciar entornos
UPDATE environments
SET color_scheme = jsonb_build_object(
  'primary', 'hsl(280 60% 50%)',
  'primaryGlow', 'hsl(280 70% 65%)',
  'secondary', 'hsl(260 55% 45%)',
  'accent', 'hsl(340 70% 55%)',
  'headerBg', 'bg-gradient-to-r from-purple-800 to-indigo-700'
)
WHERE name = 'staging';