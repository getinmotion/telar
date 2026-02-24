
-- Pre-populate with images for onboarding profiles
INSERT INTO public.site_images (context, key, image_url, alt_text)
VALUES
  ('onboarding-profile', 'idea', '/lovable-uploads/e5849e7b-cac1-4c76-9858-c7d5222cce96.png', 'Una persona teniendo una idea con una bombilla.'),
  ('onboarding-profile', 'solo', '/lovable-uploads/cfd16f14-72a3-4b55-bfd2-67adcd44eb78.png', 'Un emprendedor solitario trabajando en un portátil.'),
  ('onboarding-profile', 'team', '/lovable-uploads/a2ebe4fd-31ed-43ec-9f9f-35fe6b529ad2.png', 'Un equipo colaborando en un proyecto.')
ON CONFLICT (context, key) DO NOTHING;

-- Pre-populate with images for wizard steps
INSERT INTO public.site_images (context, key, image_url, alt_text)
VALUES
  ('wizard-steps', 'businessMaturity', '/lovable-uploads/c131a30d-0ce5-4b65-ae3c-5715f73e4f4c.png', 'Ilustración de las etapas de crecimiento de un negocio.'),
  ('wizard-steps', 'managementStyle', '/lovable-uploads/e2faf820-4987-4cf2-a69b-0b534fbbecbd.png', 'Ilustración de diferentes estilos de gestión.'),
  ('wizard-steps', 'culturalProfile', '/lovable-uploads/4d2abc22-b792-462b-8247-6cc413c71b23.png', 'Ilustración de perfiles culturales en una empresa.'),
  ('wizard-steps', 'results', '/lovable-uploads/4da82626-7a63-45bd-a402-64023f2f2d44.png', 'Dashboard mostrando resultados y analíticas.')
ON CONFLICT (context, key) DO NOTHING;

-- Pre-populate with images for wizard profile types
INSERT INTO public.site_images (context, key, image_url, alt_text)
VALUES
  ('wizard-profile-types', 'creator', '/lovable-uploads/e5849e7b-cac1-4c76-9858-c7d5222cce96.png', 'Una persona creativa trabajando en arte.'),
  ('wizard-profile-types', 'entrepreneur', '/lovable-uploads/cfd16f14-72a3-4b55-bfd2-67adcd44eb78.png', 'Un emprendedor planificando una estrategia de negocio.'),
  ('wizard-profile-types', 'leader', '/lovable-uploads/a2ebe4fd-31ed-43ec-9f9f-35fe6b529ad2.png', 'Un líder guiando a un equipo.')
ON CONFLICT (context, key) DO NOTHING;
