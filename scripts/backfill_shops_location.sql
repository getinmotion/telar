-- =============================================================
-- Backfill department / municipality en shop.artisan_shops
-- Fuente preferida: artesanos.artisan_profile (department / city)
-- Fuente secundaria: contact_info->>'address' (manual review)
-- =============================================================
-- Modo de uso:
--   1. Corré los bloques marcados [INSPECCIÓN] para ver el universo.
--   2. Corré el bloque [PREVIEW] para ver el cambio antes de aplicar.
--   3. Corré [BACKFILL] dentro de la transacción.
--   4. Si todo se ve bien => COMMIT. Si no => ROLLBACK.
-- =============================================================

-- [INSPECCIÓN] Conteo general -------------------------------------
SELECT
  COUNT(*)                                                              AS total_activas,
  COUNT(*) FILTER (WHERE department IS NULL OR department = '')         AS sin_dept,
  COUNT(*) FILTER (WHERE municipality IS NULL OR municipality = '')     AS sin_muni
FROM shop.artisan_shops
WHERE active = true;

-- [INSPECCIÓN] ¿Cuántas de las que faltan tienen perfil con ubicación?
SELECT
  COUNT(*)                                                              AS faltantes,
  COUNT(ap.id)                                                          AS con_perfil,
  COUNT(*) FILTER (WHERE ap.department IS NOT NULL AND ap.department <> '')   AS perfil_con_dept,
  COUNT(*) FILTER (WHERE ap.city       IS NOT NULL AND ap.city       <> '')   AS perfil_con_city,
  COUNT(*) FILTER (
    WHERE (ap.department IS NOT NULL AND ap.department <> '')
       OR (ap.city       IS NOT NULL AND ap.city       <> '')
  )                                                                     AS rescatables
FROM shop.artisan_shops s
LEFT JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
WHERE s.active = true
  AND ((s.department IS NULL OR s.department = '') OR (s.municipality IS NULL OR s.municipality = ''));

-- [INSPECCIÓN] Muestra de filas a tocar
SELECT s.id, s.shop_name,
       s.department      AS shop_dept,
       s.municipality    AS shop_muni,
       ap.department     AS profile_dept,
       ap.city           AS profile_city,
       ap.dane_city
FROM shop.artisan_shops s
LEFT JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
WHERE s.active = true
  AND ((s.department IS NULL OR s.department = '') OR (s.municipality IS NULL OR s.municipality = ''))
ORDER BY (ap.department IS NULL), s.shop_name
LIMIT 50;

-- [PREVIEW] Cómo quedaría cada tienda tras el backfill (sin escribir)
SELECT s.id, s.shop_name,
       s.department      AS dept_actual,
       s.municipality    AS muni_actual,
       COALESCE(NULLIF(s.department, ''),   ap.department, 'Bogotá D.C.') AS dept_nuevo,
       COALESCE(NULLIF(s.municipality, ''), ap.city,       'Bogotá D.C.') AS muni_nueva,
       CASE
         WHEN NULLIF(s.department, '')   IS NOT NULL THEN 'sin_cambio'
         WHEN ap.department IS NOT NULL AND ap.department <> '' THEN 'desde_perfil'
         ELSE 'default'
       END AS origen
FROM shop.artisan_shops s
LEFT JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
WHERE s.active = true
  AND ((s.department IS NULL OR s.department = '') OR (s.municipality IS NULL OR s.municipality = ''));

-- =============================================================
-- [BACKFILL] Ejecutar en transacción para poder revisar y rollback.
-- =============================================================

BEGIN;

WITH src AS (
  SELECT s.id,
         COALESCE(NULLIF(s.department, ''),   ap.department, 'Bogotá D.C.') AS new_dept,
         COALESCE(NULLIF(s.municipality, ''), ap.city,       'Bogotá D.C.') AS new_muni
  FROM shop.artisan_shops s
  LEFT JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
  WHERE s.active = true
    AND ((s.department IS NULL OR s.department = '')
      OR (s.municipality IS NULL OR s.municipality = ''))
)
UPDATE shop.artisan_shops s
SET department   = src.new_dept,
    municipality = src.new_muni,
    updated_at   = NOW()
FROM src
WHERE s.id = src.id;

-- Verificación post-update
SELECT department, municipality, COUNT(*) AS tiendas
FROM shop.artisan_shops
WHERE active = true
GROUP BY 1, 2
ORDER BY 3 DESC;

-- Cuántas siguen sin ubicación (debería ser 0)
SELECT COUNT(*) AS aun_sin_ubicacion
FROM shop.artisan_shops
WHERE active = true
  AND ((department IS NULL OR department = '') OR (municipality IS NULL OR municipality = ''));

-- Si todo OK:
-- COMMIT;
-- Si algo se ve raro:
-- ROLLBACK;
