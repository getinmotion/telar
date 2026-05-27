import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTaxonomyCrafts1780100300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Insertar nuevos oficios ──────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.crafts (id, name, description, is_active, status, category_id)
      VALUES
        -- Textiles y Moda
        (gen_random_uuid(), 'Tejeduría tradicional',   NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Tejeduría contemporánea', NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Hilandería artesanal',    NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Tintorería artesanal',    NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Bordado artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Confección artesanal',    NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Trabajo en fibras naturales', NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Diseño textil artesanal', NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Tejeduría',               NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Macramé',                 NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        (gen_random_uuid(), 'Arte textil',             NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')),
        -- Joyería y Accesorios
        (gen_random_uuid(), 'Joyería artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        (gen_random_uuid(), 'Bisutería artesanal',     NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        (gen_random_uuid(), 'Trabajo en chaquira',     NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        (gen_random_uuid(), 'Orfebrería',              NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        (gen_random_uuid(), 'Alambrismo',              NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        (gen_random_uuid(), 'Trabajo en fibras',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')),
        -- Decoración del Hogar
        (gen_random_uuid(), 'Cestería',                NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar')),
        (gen_random_uuid(), 'Marroquinería decorativa',NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar')),
        -- Arte y Esculturas
        (gen_random_uuid(), 'Escultura artesanal',     NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')),
        (gen_random_uuid(), 'Cerámica artística',      NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')),
        (gen_random_uuid(), 'Pintura artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')),
        (gen_random_uuid(), 'Arte ritual',             NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')),
        (gen_random_uuid(), 'Tallado artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')),
        -- Vajillas y Cocina
        (gen_random_uuid(), 'Cerámica artesanal',      NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina')),
        (gen_random_uuid(), 'Alfarería',               NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina')),
        (gen_random_uuid(), 'Ilustración cerámica',    NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina')),
        -- Muebles
        (gen_random_uuid(), 'Carpintería artesanal',   NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'muebles')),
        (gen_random_uuid(), 'Ebanistería',             NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'muebles')),
        (gen_random_uuid(), 'Trabajo en guadua',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'muebles')),
        (gen_random_uuid(), 'Diseño mobiliario artesanal', NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'muebles')),
        -- Juguetes e Instrumentos Musicales
        (gen_random_uuid(), 'Luthería artesanal',      NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'juguetes-e-instrumentos-musicales')),
        (gen_random_uuid(), 'Modelado artesanal',      NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'juguetes-e-instrumentos-musicales')),
        -- Bolsos y Carteras
        (gen_random_uuid(), 'Marroquinería artesanal', NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras')),
        (gen_random_uuid(), 'Costura artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras')),
        (gen_random_uuid(), 'Diseño textil',           NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras')),
        -- Cuidado Personal
        (gen_random_uuid(), 'Cosmética artesanal',     NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal')),
        (gen_random_uuid(), 'Botánica artesanal',      NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal')),
        (gen_random_uuid(), 'Cerería artesanal',       NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal')),
        (gen_random_uuid(), 'Aromaterapia artesanal',  NULL, true, 'approved', (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal'))
      ON CONFLICT (name) DO NOTHING;
    `);

    // ── 2. Vincular oficios existentes a sus categorías principales ─────────
    await queryRunner.query(`
      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina')
        WHERE name = 'Alfarería y Cerámica' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'muebles')
        WHERE name = 'Ebanistería y Talla' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')
        WHERE name = 'Innovación y Diseño' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios')
        WHERE name = 'Joyería y Micro-Ingeniería' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas')
        WHERE name = 'Pintura y Decoración' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda')
        WHERE name = 'Textiles y Tejidos' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras')
        WHERE name = 'Trabajo en Cuero' AND category_id IS NULL;

      UPDATE taxonomy.crafts SET category_id = (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar')
        WHERE name = 'Vidrio y Mobiliario' AND category_id IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir links de oficios existentes
    await queryRunner.query(`
      UPDATE taxonomy.crafts SET category_id = NULL
      WHERE name IN (
        'Alfarería y Cerámica', 'Ebanistería y Talla', 'Innovación y Diseño',
        'Joyería y Micro-Ingeniería', 'Pintura y Decoración', 'Textiles y Tejidos',
        'Trabajo en Cuero', 'Vidrio y Mobiliario'
      );
    `);

    // Eliminar nuevos oficios
    await queryRunner.query(`
      DELETE FROM taxonomy.crafts WHERE name IN (
        'Tejeduría tradicional', 'Tejeduría contemporánea', 'Hilandería artesanal',
        'Tintorería artesanal', 'Bordado artesanal', 'Confección artesanal',
        'Trabajo en fibras naturales', 'Diseño textil artesanal', 'Tejeduría', 'Macramé', 'Arte textil',
        'Joyería artesanal', 'Bisutería artesanal', 'Trabajo en chaquira',
        'Orfebrería', 'Alambrismo', 'Trabajo en fibras',
        'Cestería', 'Marroquinería decorativa',
        'Escultura artesanal', 'Cerámica artística', 'Pintura artesanal', 'Arte ritual', 'Tallado artesanal',
        'Cerámica artesanal', 'Alfarería', 'Ilustración cerámica',
        'Carpintería artesanal', 'Ebanistería', 'Trabajo en guadua', 'Diseño mobiliario artesanal',
        'Luthería artesanal', 'Modelado artesanal',
        'Marroquinería artesanal', 'Costura artesanal', 'Diseño textil',
        'Cosmética artesanal', 'Botánica artesanal', 'Cerería artesanal', 'Aromaterapia artesanal'
      );
    `);
  }
}
