import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeduplicateTechniquesAndCraftLinks1780100700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Crear join table ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS taxonomy.technique_craft_links (
        technique_id UUID NOT NULL REFERENCES taxonomy.techniques(id) ON DELETE CASCADE,
        craft_id     UUID NOT NULL REFERENCES taxonomy.crafts(id)     ON DELETE CASCADE,
        PRIMARY KEY (technique_id, craft_id)
      );
    `);

    // ── 2. Poblar join table desde el craft_id existente de cada técnica ────
    await queryRunner.query(`
      INSERT INTO taxonomy.technique_craft_links (technique_id, craft_id)
      SELECT id, craft_id
      FROM taxonomy.techniques
      WHERE craft_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);

    // ── 3. Deduplicación por nombre (case-insensitive) ──────────────────────

    // 3a. Canónico: el registro más antiguo por nombre normalizado
    await queryRunner.query(`
      CREATE TEMP TABLE technique_canonical AS
      SELECT DISTINCT ON (lower(trim(name)))
        id            AS canonical_id,
        lower(trim(name)) AS norm_name
      FROM taxonomy.techniques
      ORDER BY lower(trim(name)), created_at ASC;
    `);

    // 3b. Migrar craft_links de duplicados al canónico
    await queryRunner.query(`
      INSERT INTO taxonomy.technique_craft_links (technique_id, craft_id)
      SELECT tc.canonical_id, tcl.craft_id
      FROM taxonomy.techniques t
      JOIN technique_canonical tc
        ON lower(trim(t.name)) = tc.norm_name AND t.id <> tc.canonical_id
      JOIN taxonomy.technique_craft_links tcl
        ON tcl.technique_id = t.id
      ON CONFLICT DO NOTHING;
    `);

    // 3c. Redirigir FKs en productos
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity pai
      SET primary_technique_id = tc.canonical_id
      FROM taxonomy.techniques t
      JOIN technique_canonical tc
        ON lower(trim(t.name)) = tc.norm_name AND t.id <> tc.canonical_id
      WHERE pai.primary_technique_id = t.id;
    `);

    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity pai
      SET secondary_technique_id = tc.canonical_id
      FROM taxonomy.techniques t
      JOIN technique_canonical tc
        ON lower(trim(t.name)) = tc.norm_name AND t.id <> tc.canonical_id
      WHERE pai.secondary_technique_id = t.id;
    `);

    // 3d. Redirigir FKs en identidad artesanal
    await queryRunner.query(`
      UPDATE artesanos.artisan_identity ai
      SET technique_primary_id = tc.canonical_id
      FROM taxonomy.techniques t
      JOIN technique_canonical tc
        ON lower(trim(t.name)) = tc.norm_name AND t.id <> tc.canonical_id
      WHERE ai.technique_primary_id = t.id;
    `);

    await queryRunner.query(`
      UPDATE artesanos.artisan_identity ai
      SET technique_secondary_id = tc.canonical_id
      FROM taxonomy.techniques t
      JOIN technique_canonical tc
        ON lower(trim(t.name)) = tc.norm_name AND t.id <> tc.canonical_id
      WHERE ai.technique_secondary_id = t.id;
    `);

    // 3e. Eliminar craft_links de los duplicados (ya migrados al canónico)
    await queryRunner.query(`
      DELETE FROM taxonomy.technique_craft_links tcl
      USING taxonomy.techniques t, technique_canonical tc
      WHERE tcl.technique_id = t.id
        AND lower(trim(t.name)) = tc.norm_name
        AND t.id <> tc.canonical_id;
    `);

    // 3f. Eliminar técnicas duplicadas
    await queryRunner.query(`
      DELETE FROM taxonomy.techniques t
      USING technique_canonical tc
      WHERE lower(trim(t.name)) = tc.norm_name
        AND t.id <> tc.canonical_id;
    `);

    // ── 4. Eliminar constraint UNIQUE(craft_id, name) si existe ─────────────
    await queryRunner.query(`
      ALTER TABLE taxonomy.techniques
        DROP CONSTRAINT IF EXISTS techniques_craft_id_name_key;
    `);

    // ── 5. Hacer craft_id nullable ──────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE taxonomy.techniques
        ALTER COLUMN craft_id DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir nullable (no recupera duplicados eliminados)
    await queryRunner.query(`
      ALTER TABLE taxonomy.techniques
        ALTER COLUMN craft_id SET NOT NULL;
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS taxonomy.technique_craft_links;
    `);
  }
}
