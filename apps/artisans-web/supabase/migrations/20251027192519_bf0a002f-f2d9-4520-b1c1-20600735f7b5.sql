-- Poblar catálogo de logros (achievements)
INSERT INTO public.achievements_catalog (id, title, description, icon, unlock_criteria, category, display_order) VALUES
  ('first_mission', 'Primera Misión', 'Completa tu primera misión', 'rocket', '{"type": "missions_completed", "count": 1}', 'progress', 1),
  ('five_missions', 'Artesano Dedicado', 'Completa 5 misiones', 'star', '{"type": "missions_completed", "count": 5}', 'progress', 2),
  ('ten_missions', 'Maestro en Progreso', 'Completa 10 misiones', 'award', '{"type": "missions_completed", "count": 10}', 'progress', 3),
  ('level_2', 'Aprendiz Avanzado', 'Alcanza el nivel 2', 'trending-up', '{"type": "level_reached", "level": 2}', 'growth', 4),
  ('level_3', 'Artesano Competente', 'Alcanza el nivel 3', 'trophy', '{"type": "level_reached", "level": 3}', 'growth', 5),
  ('level_5', 'Gran Maestro', 'Alcanza el nivel 5', 'crown', '{"type": "level_reached", "level": 5}', 'growth', 6),
  ('streak_3', 'Constancia', 'Mantén una racha de 3 días', 'flame', '{"type": "streak_reached", "days": 3}', 'engagement', 7),
  ('streak_7', 'Compromiso Total', 'Mantén una racha de 7 días', 'zap', '{"type": "streak_reached", "days": 7}', 'engagement', 8),
  ('streak_30', 'Dedicación Absoluta', 'Mantén una racha de 30 días', 'sparkles', '{"type": "streak_reached", "days": 30}', 'engagement', 9),
  ('onboarding_complete', 'Bienvenido', 'Completa el proceso de onboarding', 'check-circle', '{"type": "onboarding_complete"}', 'milestone', 10),
  ('first_deliverable', 'Primer Entregable', 'Genera tu primer entregable', 'file-text', '{"type": "deliverables_generated", "count": 1}', 'progress', 11),
  ('brand_master', 'Experto en Marca', 'Completa todas las misiones de marca', 'palette', '{"type": "agent_mastery", "agent": "brand"}', 'specialization', 12),
  ('pricing_master', 'Experto en Precios', 'Completa todas las misiones de pricing', 'dollar-sign', '{"type": "agent_mastery", "agent": "pricing"}', 'specialization', 13),
  ('growth_master', 'Experto en Crecimiento', 'Completa todas las misiones de growth', 'trending-up', '{"type": "agent_mastery", "agent": "growth"}', 'specialization', 14),
  ('early_bird', 'Madrugador', 'Completa una misión antes de las 8am', 'sunrise', '{"type": "time_based", "before": "08:00"}', 'special', 15)
ON CONFLICT (id) DO NOTHING;