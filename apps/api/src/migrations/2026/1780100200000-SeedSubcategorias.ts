import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSubcategorias1780100200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO taxonomy.categories (id, name, slug, parent_id, display_order, is_active)
      VALUES
        -- Textiles y Moda
        (gen_random_uuid(), 'Ruanas',    'ruanas',    (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda'), 1, true),
        (gen_random_uuid(), 'Hamacas',   'hamacas',   (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda'), 2, true),
        (gen_random_uuid(), 'Tapices',   'tapices',   (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda'), 3, true),
        (gen_random_uuid(), 'Cojines',   'cojines',   (SELECT id FROM taxonomy.categories WHERE slug = 'textiles-y-moda'), 4, true),
        -- Joyería y Accesorios
        (gen_random_uuid(), 'Collares',  'collares',  (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios'), 1, true),
        (gen_random_uuid(), 'Aretes',    'aretes',    (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios'), 2, true),
        -- Decoración del Hogar
        (gen_random_uuid(), 'Cestas',    'cestas',    (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar'), 1, true),
        (gen_random_uuid(), 'Jarrones',  'jarrones',  (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar'), 2, true),
        (gen_random_uuid(), 'Espejos',   'espejos',   (SELECT id FROM taxonomy.categories WHERE slug = 'decoracion-del-hogar'), 3, true),
        -- Muebles
        (gen_random_uuid(), 'Mesas',     'mesas',     (SELECT id FROM taxonomy.categories WHERE slug = 'muebles'), 1, true),
        (gen_random_uuid(), 'Sillas',    'sillas',    (SELECT id FROM taxonomy.categories WHERE slug = 'muebles'), 2, true),
        -- Vajillas y Cocina
        (gen_random_uuid(), 'Platos',    'platos',    (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina'), 1, true),
        (gen_random_uuid(), 'Tazas',     'tazas',     (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina'), 2, true),
        (gen_random_uuid(), 'Utensilios','utensilios',(SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina'), 3, true),
        -- Arte y Esculturas
        (gen_random_uuid(), 'Esculturas','esculturas',(SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas'), 1, true),
        (gen_random_uuid(), 'Máscaras',  'mascaras',  (SELECT id FROM taxonomy.categories WHERE slug = 'arte-y-esculturas'), 2, true),
        -- Juguetes e Instrumentos Musicales
        (gen_random_uuid(), 'Tambores',           'tambores',           (SELECT id FROM taxonomy.categories WHERE slug = 'juguetes-e-instrumentos-musicales'), 1, true),
        (gen_random_uuid(), 'Muñecos artesanales','municos-artesanales',(SELECT id FROM taxonomy.categories WHERE slug = 'juguetes-e-instrumentos-musicales'), 2, true),
        -- Bolsos y Carteras
        (gen_random_uuid(), 'Mochilas',  'mochilas',  (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras'), 1, true),
        (gen_random_uuid(), 'Tote Bags', 'tote-bags', (SELECT id FROM taxonomy.categories WHERE slug = 'bolsos-y-carteras'), 2, true),
        -- Cuidado Personal
        (gen_random_uuid(), 'Jabones artesanales', 'jabones-artesanales', (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal'), 1, true),
        (gen_random_uuid(), 'Velas aromáticas',    'velas-aromaticas',    (SELECT id FROM taxonomy.categories WHERE slug = 'belleza-y-cuidado-personal'), 2, true)
      ON CONFLICT (slug) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM taxonomy.categories WHERE slug IN (
        'ruanas', 'hamacas', 'tapices', 'cojines',
        'collares', 'aretes',
        'cestas', 'jarrones', 'espejos',
        'mesas', 'sillas',
        'platos', 'tazas', 'utensilios',
        'esculturas', 'mascaras',
        'tambores', 'municos-artesanales',
        'mochilas', 'tote-bags',
        'jabones-artesanales', 'velas-aromaticas'
      );
    `);
  }
}
