import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorOfficiosNames1780100600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── 1. Renombrar 4 oficios con nombres categóricos ─────────────────────
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Vidriería artesanal'   WHERE name = 'Vidrio y Mobiliario'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Decoración artesanal'  WHERE name = 'Pintura y Decoración'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Tejido artesanal'      WHERE name = 'Textiles y Tejidos'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Talabartería artesanal' WHERE name = 'Trabajo en Cuero'`);

    // ── 2. Ebanistería y Talla (41cbfbfc) → Ebanistería (33df4189) ────────
    // Ebanistería ya tiene Ensamble (afbc8ecd) y Tallado (9fe4fb05)
    // → redirigir primary + secondary y eliminar duplicados

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = 'afbc8ecd-ac91-46d4-99f1-42230b46ab06'
      WHERE primary_technique_id = '9329f25a-d1d6-4cd6-b87d-fe9d2ddca024'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = 'afbc8ecd-ac91-46d4-99f1-42230b46ab06'
      WHERE secondary_technique_id = '9329f25a-d1d6-4cd6-b87d-fe9d2ddca024'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = '9329f25a-d1d6-4cd6-b87d-fe9d2ddca024'`);

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = '9fe4fb05-d8a8-42c0-bf43-c090b94e62c3'
      WHERE primary_technique_id = 'e7db1f33-3a03-4638-a299-d8efa5933d82'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = '9fe4fb05-d8a8-42c0-bf43-c090b94e62c3'
      WHERE secondary_technique_id = 'e7db1f33-3a03-4638-a299-d8efa5933d82'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = 'e7db1f33-3a03-4638-a299-d8efa5933d82'`);

    // Mover técnicas restantes (Calado, Laminado, Talla, Taracea, Torneado) a Ebanistería
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = '33df4189-919a-4676-8b9f-a0ffe5cea7a0'
      WHERE craft_id = '41cbfbfc-fe33-4e15-8437-ad23dbfba12b'
    `);

    // Redirigir productos y eliminar oficio
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_craft_id = '33df4189-919a-4676-8b9f-a0ffe5cea7a0'
      WHERE primary_craft_id = '41cbfbfc-fe33-4e15-8437-ad23dbfba12b'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.crafts WHERE id = '41cbfbfc-fe33-4e15-8437-ad23dbfba12b'`);

    // ── 3. Alfarería y Cerámica (efd29962) → Alfarería (fcce803c) ─────────
    // Alfarería ya tiene Modelado (3dbaf9a5): redirigir y eliminar duplicado

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = '3dbaf9a5-c07a-4e42-9f57-33adb348a4f9'
      WHERE primary_technique_id = '03cbe16b-f23b-4932-8e84-d415caeca606'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = '3dbaf9a5-c07a-4e42-9f57-33adb348a4f9'
      WHERE secondary_technique_id = '03cbe16b-f23b-4932-8e84-d415caeca606'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = '03cbe16b-f23b-4932-8e84-d415caeca606'`);

    // Cartapesta y Papel Maché → Cerámica artesanal (475ef5e9)
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = '475ef5e9-51ef-454f-8e4e-7015c5cdb316'
      WHERE id IN ('d39afdee-b839-4cd6-afbc-7b703e804a8e', 'dcd48316-3c7a-4ffb-b8a0-74c3b4927b40')
    `);

    // Redirigir productos a Alfarería y eliminar oficio
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_craft_id = 'fcce803c-5510-4f08-bda1-f02f991303fd'
      WHERE primary_craft_id = 'efd29962-41f1-4d58-8cdb-36a6236807f0'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.crafts WHERE id = 'efd29962-41f1-4d58-8cdb-36a6236807f0'`);

    // ── 4. Joyería y Micro-Ingeniería (dd09c359) → Joyería artesanal (23a79d19)
    // Joyería artesanal ya tiene Engaste (d2e7b671), Filigrana (faf572ef), Martillado (24bc36b2)

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = 'd2e7b671-c2d5-45d3-8ddb-65ac50561a32'
      WHERE primary_technique_id = '9e938faf-32fc-4b3e-ac93-6fc3eacc2932'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = 'd2e7b671-c2d5-45d3-8ddb-65ac50561a32'
      WHERE secondary_technique_id = '9e938faf-32fc-4b3e-ac93-6fc3eacc2932'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = '9e938faf-32fc-4b3e-ac93-6fc3eacc2932'`);

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = 'faf572ef-ed13-4413-9c9e-7d362dbb1bd0'
      WHERE primary_technique_id = '148001df-beba-4c0b-bae1-f400e2f280ce'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = 'faf572ef-ed13-4413-9c9e-7d362dbb1bd0'
      WHERE secondary_technique_id = '148001df-beba-4c0b-bae1-f400e2f280ce'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = '148001df-beba-4c0b-bae1-f400e2f280ce'`);

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = '24bc36b2-ee1e-4762-9254-4f5a6961dce4'
      WHERE primary_technique_id = '842103a6-4200-43dc-901f-bf8f0c22beee'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = '24bc36b2-ee1e-4762-9254-4f5a6961dce4'
      WHERE secondary_technique_id = '842103a6-4200-43dc-901f-bf8f0c22beee'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE id = '842103a6-4200-43dc-901f-bf8f0c22beee'`);

    // Mover resto (Electroformado, Esmaltado, Repujado, Soldadura Al Fuego) a Joyería artesanal
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = '23a79d19-a2bd-4445-9d2c-d14c3e56f228'
      WHERE craft_id = 'dd09c359-7787-497b-ad01-cbf5a5dfc84c'
    `);

    // Redirigir productos y eliminar oficio
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_craft_id = '23a79d19-a2bd-4445-9d2c-d14c3e56f228'
      WHERE primary_craft_id = 'dd09c359-7787-497b-ad01-cbf5a5dfc84c'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.crafts WHERE id = 'dd09c359-7787-497b-ad01-cbf5a5dfc84c'`);

    // ── 5. Innovación y Diseño (fd5dbf1b) → eliminar ──────────────────────
    // Armado: primary = 4 refs, secondary = 3 refs → NULL ambas
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = NULL
      WHERE primary_technique_id = '751fc464-9767-4187-8162-b81abe9dd55e'
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = NULL
      WHERE secondary_technique_id = '751fc464-9767-4187-8162-b81abe9dd55e'
    `);
    // Recubrimiento: primary = 3 refs → NULL
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = NULL
      WHERE primary_technique_id = '77f9d2bc-b6ad-4cdb-bca1-35a7bf99d8f8'
    `);
    // Entorchado: secondary = 2 refs → NULL
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET secondary_technique_id = NULL
      WHERE secondary_technique_id = 'f0dcd570-dcfc-4781-91b6-b18c557e30d6'
    `);

    // Eliminar todas las técnicas del oficio (Casting y Recubrimiento no tienen refs)
    await queryRunner.query(`DELETE FROM taxonomy.techniques WHERE craft_id = 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0'`);

    // Desvincular los 2 productos y eliminar oficio
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_craft_id = NULL
      WHERE primary_craft_id = 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0'
    `);
    await queryRunner.query(`DELETE FROM taxonomy.crafts WHERE id = 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Revertir renombramientos ───────────────────────────────────────────
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Vidrio y Mobiliario'  WHERE name = 'Vidriería artesanal'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Pintura y Decoración' WHERE name = 'Decoración artesanal'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Textiles y Tejidos'   WHERE name = 'Tejido artesanal'`);
    await queryRunner.query(`UPDATE taxonomy.crafts SET name = 'Trabajo en Cuero'     WHERE name = 'Talabartería artesanal'`);

    // ── Recrear Innovación y Diseño con sus técnicas ───────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.crafts (id, name, description, is_active, status, category_id)
      VALUES ('fd5dbf1b-faf7-42e8-84ca-1e80857603f0', 'Innovación y Diseño', NULL, true, 'approved',
        (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios'))
      ON CONFLICT (name) DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status) VALUES
        ('751fc464-9767-4187-8162-b81abe9dd55e', 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0', 'Armado',        'approved'),
        ('0c147a86-90a9-4f65-955a-b4a29e95b39c', 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0', 'Casting',       'approved'),
        ('f0dcd570-dcfc-4781-91b6-b18c557e30d6', 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0', 'Entorchado',    'approved'),
        ('77f9d2bc-b6ad-4cdb-bca1-35a7bf99d8f8', 'fd5dbf1b-faf7-42e8-84ca-1e80857603f0', 'Recubrimiento', 'approved')
      ON CONFLICT (craft_id, name) DO NOTHING
    `);
    // Nota: productos que tenían secondary_technique_id = Armado/Entorchado quedaron con NULL y no se restauran

    // ── Recrear Joyería y Micro-Ingeniería ────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.crafts (id, name, description, is_active, status, category_id)
      VALUES ('dd09c359-7787-497b-ad01-cbf5a5dfc84c', 'Joyería y Micro-Ingeniería', NULL, true, 'approved',
        (SELECT id FROM taxonomy.categories WHERE slug = 'joyeria-y-accesorios'))
      ON CONFLICT (name) DO NOTHING
    `);
    // Restaurar técnicas sin conflicto
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = 'dd09c359-7787-497b-ad01-cbf5a5dfc84c'
      WHERE craft_id = '23a79d19-a2bd-4445-9d2c-d14c3e56f228'
        AND name IN ('Electroformado', 'Esmaltado', 'Repujado', 'Soldadura Al Fuego')
    `);
    // Re-insertar técnicas duplicadas eliminadas
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status) VALUES
        ('9e938faf-32fc-4b3e-ac93-6fc3eacc2932', 'dd09c359-7787-497b-ad01-cbf5a5dfc84c', 'Engaste',    'approved'),
        ('148001df-beba-4c0b-bae1-f400e2f280ce', 'dd09c359-7787-497b-ad01-cbf5a5dfc84c', 'Filigrana',  'approved'),
        ('842103a6-4200-43dc-901f-bf8f0c22beee', 'dd09c359-7787-497b-ad01-cbf5a5dfc84c', 'Martillado', 'approved')
      ON CONFLICT (craft_id, name) DO NOTHING
    `);
    // Nota: los 76 productos quedan apuntando a las técnicas/oficio de Joyería artesanal

    // ── Recrear Alfarería y Cerámica ──────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.crafts (id, name, description, is_active, status, category_id)
      VALUES ('efd29962-41f1-4d58-8cdb-36a6236807f0', 'Alfarería y Cerámica', NULL, true, 'approved',
        (SELECT id FROM taxonomy.categories WHERE slug = 'vajillas-y-cocina'))
      ON CONFLICT (name) DO NOTHING
    `);
    // Devolver Cartapesta y Papel Maché desde Cerámica artesanal
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = 'efd29962-41f1-4d58-8cdb-36a6236807f0'
      WHERE id IN ('d39afdee-b839-4cd6-afbc-7b703e804a8e', 'dcd48316-3c7a-4ffb-b8a0-74c3b4927b40')
    `);
    // Re-insertar Modelado eliminado
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      VALUES ('03cbe16b-f23b-4932-8e84-d415caeca606', 'efd29962-41f1-4d58-8cdb-36a6236807f0', 'Modelado', 'approved')
      ON CONFLICT (craft_id, name) DO NOTHING
    `);
    // Nota: los 55 productos quedan en Alfarería; secundario de Modelado apunta a Alfarería's Modelado

    // ── Recrear Ebanistería y Talla ───────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.crafts (id, name, description, is_active, status, category_id)
      VALUES ('41cbfbfc-fe33-4e15-8437-ad23dbfba12b', 'Ebanistería y Talla', NULL, true, 'approved',
        (SELECT id FROM taxonomy.categories WHERE slug = 'muebles'))
      ON CONFLICT (name) DO NOTHING
    `);
    // Devolver técnicas sin conflicto (Calado, Laminado, Talla, Taracea, Torneado)
    await queryRunner.query(`
      UPDATE taxonomy.techniques
      SET craft_id = '41cbfbfc-fe33-4e15-8437-ad23dbfba12b'
      WHERE craft_id = '33df4189-919a-4676-8b9f-a0ffe5cea7a0'
        AND name IN ('Calado', 'Laminado', 'Talla', 'Taracea', 'Torneado')
    `);
    // Re-insertar técnicas duplicadas eliminadas
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status) VALUES
        ('9329f25a-d1d6-4cd6-b87d-fe9d2ddca024', '41cbfbfc-fe33-4e15-8437-ad23dbfba12b', 'Ensamble', 'approved'),
        ('e7db1f33-3a03-4638-a299-d8efa5933d82', '41cbfbfc-fe33-4e15-8437-ad23dbfba12b', 'Tallado',  'approved')
      ON CONFLICT (craft_id, name) DO NOTHING
    `);
    // Nota: los 80 productos quedan en Ebanistería; primary/secondary de Ensamble/Tallado apuntan a Ebanistería
  }
}
