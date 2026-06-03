-- ============================================================
-- Seed shop data for Carlos Mendoza (ceramista)
-- user_id (same as agents seed): a1b2c3d4-0001-0001-0001-000000000001
-- Run AFTER seed_local_test_data.sql (requires auth.users row)
-- ============================================================

-- UUIDs fijos
-- store:    87bc861d-5494-485b-b318-df27449767dd
-- category: 9550f70b-33bb-4a82-aef0-3d46cf1c7658  (Decoración del Hogar — taxonomy.categories)
-- products: 372559b9, 67bc7ab1, b52cee54, ea8f0666, e7de1fcc

-- 1. Tienda de Carlos
INSERT INTO shop.stores (id, user_id, name, slug, story)
VALUES (
    '87bc861d-5494-485b-b318-df27449767dd',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Cerámica Mendoza',
    'ceramica-mendoza',
    'Taller artesanal de cerámica en Bogotá con técnicas prehispánicas colombianas.'
) ON CONFLICT DO NOTHING;

-- 2. Productos (category_id → taxonomy.categories, status must be approved/draft/etc.)
INSERT INTO shop.products_core (id, store_id, category_id, name, short_description, status)
VALUES
    ('372559b9-c363-4a3f-a0d9-9277374352c8', '87bc861d-5494-485b-b318-df27449767dd', '9550f70b-33bb-4a82-aef0-3d46cf1c7658',
     'Jarrón Prehispánico Grande', 'Jarrón decorativo con motivos muiscas, 30cm altura', 'approved'),
    ('67bc7ab1-bb5c-49cd-862c-73765f53caf6', '87bc861d-5494-485b-b318-df27449767dd', '9550f70b-33bb-4a82-aef0-3d46cf1c7658',
     'Taza Artesanal Negra', 'Taza utilitaria en cerámica negra pulida, 350ml', 'approved'),
    ('b52cee54-b55e-473b-bc0c-69b5882aaf7e', '87bc861d-5494-485b-b318-df27449767dd', '9550f70b-33bb-4a82-aef0-3d46cf1c7658',
     'Plato Decorativo Muisca', 'Plato decorativo con grabados geométricos muiscas, 25cm', 'approved'),
    ('ea8f0666-1ddd-49c8-ab59-e598422f56d3', '87bc861d-5494-485b-b318-df27449767dd', '9550f70b-33bb-4a82-aef0-3d46cf1c7658',
     'Set Cuencos x3', 'Set de 3 cuencos en cerámica natural, tamaños S/M/L', 'approved'),
    ('e7de1fcc-a4e8-4265-ba34-08eda4e1f0b0', '87bc861d-5494-485b-b318-df27449767dd', '9550f70b-33bb-4a82-aef0-3d46cf1c7658',
     'Maceta Colgante', 'Maceta en cerámica con sistema de colgado, 15cm', 'approved')
ON CONFLICT DO NOTHING;

-- 3. Variantes con precio (base_price_minor en centavos COP: 85000 COP = 8500000)
--    currency must match ^[A-Z]{3}$ → use 'COP'
INSERT INTO shop.product_variants (id, product_id, sku, stock_quantity, base_price_minor, currency, is_active)
VALUES
    ('c7d0977a-48a4-4e0b-86d3-3d255876b6ac', '372559b9-c363-4a3f-a0d9-9277374352c8', 'CER-JAR-001', 8,  8500000, 'COP', true),
    (uuid_generate_v4(),                     '67bc7ab1-bb5c-49cd-862c-73765f53caf6', 'CER-TZA-001', 45, 3500000, 'COP', true),
    (uuid_generate_v4(),                     'b52cee54-b55e-473b-bc0c-69b5882aaf7e', 'CER-PLA-001', 3,  6500000, 'COP', true),
    (uuid_generate_v4(),                     'ea8f0666-1ddd-49c8-ab59-e598422f56d3', 'CER-SET-001', 12, 9800000, 'COP', true),
    (uuid_generate_v4(),                     'e7de1fcc-a4e8-4265-ba34-08eda4e1f0b0', 'CER-MAC-001', 0,  4200000, 'COP', true)
ON CONFLICT DO NOTHING;

-- Verificación
SELECT
    pc.name                         AS producto,
    pv.sku,
    pv.stock_quantity               AS stock,
    pv.base_price_minor / 100       AS precio_cop,
    CASE WHEN pv.stock_quantity = 0 THEN 'sin stock'
         WHEN pv.stock_quantity < 5 THEN 'stock bajo'
         ELSE 'ok' END             AS estado_stock
FROM shop.products_core pc
JOIN shop.product_variants pv ON pc.id = pv.product_id
WHERE pc.store_id = '87bc861d-5494-485b-b318-df27449767dd'
ORDER BY pv.base_price_minor DESC;
