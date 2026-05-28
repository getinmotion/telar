import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMaterialesHerramientas1780100500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── 0. Redirigir FKs antes de eliminar duplicados ─────────────────────
    // 'Cascara De Huevo' -> canonical 'Cáscara De Huevo': 3 productos apuntan al duplicado
    await queryRunner.query(`
      UPDATE shop.product_materials_link
      SET material_id = (SELECT id FROM taxonomy.materials WHERE name = 'Cáscara De Huevo')
      WHERE material_id = (SELECT id FROM taxonomy.materials WHERE name = 'Cascara De Huevo')
    `);

    // 'vinil' -> canonical 'Vinilos': 1 producto apunta al duplicado
    await queryRunner.query(`
      UPDATE shop.product_materials_link
      SET material_id = (SELECT id FROM taxonomy.materials WHERE name = 'Vinilos')
      WHERE material_id = (SELECT id FROM taxonomy.materials WHERE name = 'vinil')
    `);

    // 'seda' -> canonical 'Seda': el artesano ya tiene la fila con 'Seda',
    // por lo que eliminamos la fila duplicada en lugar de actualizar (unique constraint)
    await queryRunner.query(`
      DELETE FROM artesanos.artisan_materials
      WHERE material_id = (SELECT id FROM taxonomy.materials WHERE name = 'seda')
    `);

    // ── 1. Limpiar duplicados de materiales ───────────────────────────────
    await queryRunner.query(`DELETE FROM taxonomy.materials WHERE name = 'seda'`);
    await queryRunner.query(`DELETE FROM taxonomy.materials WHERE name = 'Cascara De Huevo'`);
    await queryRunner.query(`DELETE FROM taxonomy.materials WHERE name = 'vinil'`);

    // ── 2. Aprobar y normalizar materiales pendientes ─────────────────────
    await queryRunner.query(`UPDATE taxonomy.materials SET name = 'Algodón',         status = 'approved' WHERE name = 'algodón'`);
    await queryRunner.query(`UPDATE taxonomy.materials SET name = 'Algodón Peruano', status = 'approved' WHERE name = 'algodon peruano'`);
    await queryRunner.query(`UPDATE taxonomy.materials SET name = 'Cáñamo',          status = 'approved' WHERE name = 'cañamo'`);
    await queryRunner.query(`UPDATE taxonomy.materials SET name = 'Coco',            status = 'approved' WHERE name = 'coco'`);
    await queryRunner.query(`UPDATE taxonomy.materials SET status = 'approved' WHERE name = 'Seda'`);
    await queryRunner.query(`UPDATE taxonomy.materials SET status = 'approved' WHERE name = 'Vinilos'`);

    // ── 3. Insertar nuevos materiales ─────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.materials (id, name, is_organic, is_sustainable, status)
      VALUES
        -- Textiles
        (gen_random_uuid(), 'Lana virgen',       false, false, 'approved'),
        (gen_random_uuid(), 'Lana oveja',         false, false, 'approved'),
        (gen_random_uuid(), 'Lana merino',        false, false, 'approved'),
        (gen_random_uuid(), 'Lana',               false, false, 'approved'),
        (gen_random_uuid(), 'Alpaca',             false, false, 'approved'),
        (gen_random_uuid(), 'Fique',              true,  true,  'approved'),
        (gen_random_uuid(), 'Lino',               false, false, 'approved'),
        (gen_random_uuid(), 'Fibra reciclada',    false, true,  'approved'),
        (gen_random_uuid(), 'Yute',               true,  true,  'approved'),
        (gen_random_uuid(), 'Rellenos naturales', false, false, 'approved'),
        (gen_random_uuid(), 'Fibra sintética',    false, false, 'approved'),
        (gen_random_uuid(), 'Nylon artesanal',    false, false, 'approved'),
        (gen_random_uuid(), 'Fieltro',            false, false, 'approved'),
        (gen_random_uuid(), 'Lona',               false, false, 'approved'),
        -- Cestería y decoración
        (gen_random_uuid(), 'Iraca',              true,  true,  'approved'),
        (gen_random_uuid(), 'Palma',              true,  true,  'approved'),
        (gen_random_uuid(), 'Mimbre',             true,  true,  'approved'),
        (gen_random_uuid(), 'Bejuco',             true,  true,  'approved'),
        -- Cerámica
        (gen_random_uuid(), 'Gres',               false, false, 'approved'),
        (gen_random_uuid(), 'Pigmentos',          false, false, 'approved'),
        (gen_random_uuid(), 'Esmaltes',           false, false, 'approved'),
        -- Madera y carpintería
        (gen_random_uuid(), 'Cedro',              false, false, 'approved'),
        (gen_random_uuid(), 'Nogal',              false, false, 'approved'),
        (gen_random_uuid(), 'Guadua',             true,  true,  'approved'),
        (gen_random_uuid(), 'Bambú',              true,  true,  'approved'),
        (gen_random_uuid(), 'Madera reciclada',   false, true,  'approved'),
        (gen_random_uuid(), 'Madera resonante',   false, false, 'approved'),
        -- Joyería
        (gen_random_uuid(), 'Resina',             false, false, 'approved'),
        (gen_random_uuid(), 'Semillas',           true,  true,  'approved'),
        (gen_random_uuid(), 'Bronce',             false, false, 'approved'),
        (gen_random_uuid(), 'Cobre',              false, false, 'approved'),
        (gen_random_uuid(), 'Oro',                false, false, 'approved'),
        -- Cuidado personal
        (gen_random_uuid(), 'Cera',               false, false, 'approved'),
        (gen_random_uuid(), 'Flores secas',       true,  false, 'approved'),
        (gen_random_uuid(), 'Flores',             true,  false, 'approved')
      ON CONFLICT (name) DO NOTHING;
    `);

    // ── 4. Aprobar herramientas pendientes existentes ─────────────────────
    await queryRunner.query(`UPDATE taxonomy.herramientas SET status = 'approved' WHERE name = 'telar'`);
    await queryRunner.query(`UPDATE taxonomy.herramientas SET status = 'approved' WHERE name = 'martillo'`);
    await queryRunner.query(`UPDATE taxonomy.herramientas SET status = 'approved' WHERE name = 'prensa'`);
    await queryRunner.query(`UPDATE taxonomy.herramientas SET status = 'approved' WHERE name = 'barra de hiero'`);

    // ── 5. Insertar nuevas herramientas ───────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.herramientas (id, name, status)
      VALUES
        -- Textiles
        (gen_random_uuid(), 'Huso',                  'approved'),
        (gen_random_uuid(), 'Peine textil',           'approved'),
        (gen_random_uuid(), 'Bastidor',               'approved'),
        (gen_random_uuid(), 'Agujas',                 'approved'),
        (gen_random_uuid(), 'Tijeras textiles',       'approved'),
        (gen_random_uuid(), 'Tijeras',                'approved'),
        (gen_random_uuid(), 'Ollas de teñido',        'approved'),
        (gen_random_uuid(), 'Ganchos',                'approved'),
        -- Joyería
        (gen_random_uuid(), 'Pinzas',                'approved'),
        (gen_random_uuid(), 'Soplete',               'approved'),
        (gen_random_uuid(), 'Segueta',               'approved'),
        (gen_random_uuid(), 'Limas',                 'approved'),
        (gen_random_uuid(), 'Moldes',                'approved'),
        (gen_random_uuid(), 'Cortafríos',            'approved'),
        -- Cestería y decoración
        (gen_random_uuid(), 'Cuchillos',             'approved'),
        (gen_random_uuid(), 'Pegantes artesanales',  'approved'),
        -- Cerámica
        (gen_random_uuid(), 'Torno',                 'approved'),
        (gen_random_uuid(), 'Estecas',               'approved'),
        (gen_random_uuid(), 'Espátulas',             'approved'),
        (gen_random_uuid(), 'Hornos',                'approved'),
        -- Carpintería
        (gen_random_uuid(), 'Formones',              'approved'),
        (gen_random_uuid(), 'Gubias',                'approved'),
        (gen_random_uuid(), 'Lijadoras',             'approved'),
        (gen_random_uuid(), 'Cepillos',              'approved'),
        (gen_random_uuid(), 'Serruchos',             'approved'),
        (gen_random_uuid(), 'Taladros',              'approved'),
        (gen_random_uuid(), 'Tensores',              'approved'),
        (gen_random_uuid(), 'Lijas',                 'approved'),
        (gen_random_uuid(), 'Cinceles',              'approved'),
        (gen_random_uuid(), 'Pulidoras',             'approved'),
        -- Arte y costura
        (gen_random_uuid(), 'Pinceles',              'approved'),
        (gen_random_uuid(), 'Máquina de coser',      'approved'),
        (gen_random_uuid(), 'Buriles',               'approved'),
        (gen_random_uuid(), 'Remachadoras',          'approved'),
        -- Cuidado personal
        (gen_random_uuid(), 'Básculas',              'approved'),
        (gen_random_uuid(), 'Mezcladores',           'approved'),
        (gen_random_uuid(), 'Termómetros',           'approved'),
        (gen_random_uuid(), 'Recipientes',           'approved')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar herramientas nuevas
    await queryRunner.query(`
      DELETE FROM taxonomy.herramientas WHERE name IN (
        'Huso', 'Peine textil', 'Bastidor', 'Agujas', 'Tijeras textiles', 'Tijeras',
        'Ollas de teñido', 'Ganchos', 'Pinzas', 'Soplete', 'Segueta', 'Limas',
        'Moldes', 'Cortafríos', 'Cuchillos', 'Pegantes artesanales', 'Torno',
        'Estecas', 'Espátulas', 'Hornos', 'Formones', 'Gubias', 'Lijadoras',
        'Cepillos', 'Serruchos', 'Taladros', 'Tensores', 'Lijas', 'Cinceles',
        'Pulidoras', 'Pinceles', 'Máquina de coser', 'Buriles', 'Remachadoras',
        'Básculas', 'Mezcladores', 'Termómetros', 'Recipientes'
      );
    `);

    // Revertir aprobación de herramientas existentes
    await queryRunner.query(`UPDATE taxonomy.herramientas SET status = 'pending' WHERE name IN ('telar', 'martillo', 'prensa', 'barra de hiero')`);

    // Eliminar materiales nuevos
    await queryRunner.query(`
      DELETE FROM taxonomy.materials WHERE name IN (
        'Lana virgen', 'Lana oveja', 'Lana merino', 'Lana', 'Alpaca',
        'Fique', 'Lino', 'Fibra reciclada', 'Yute', 'Rellenos naturales',
        'Fibra sintética', 'Nylon artesanal', 'Fieltro', 'Lona',
        'Iraca', 'Palma', 'Mimbre', 'Bejuco',
        'Gres', 'Pigmentos', 'Esmaltes',
        'Cedro', 'Nogal', 'Guadua', 'Bambú', 'Madera reciclada', 'Madera resonante',
        'Resina', 'Semillas', 'Bronce', 'Cobre', 'Oro',
        'Cera', 'Flores secas', 'Flores'
      );
    `);

    // Nota: duplicados eliminados y nombres normalizados NO se restauran
    // porque causarían conflictos con la constraint UNIQUE.
  }
}
