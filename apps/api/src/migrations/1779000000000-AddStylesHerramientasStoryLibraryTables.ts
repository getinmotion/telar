import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStylesHerramientasStoryLibraryTables1779000000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── taxonomy.styles ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS taxonomy.styles (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name         varchar(120) NOT NULL UNIQUE,
        status       varchar(20)  NOT NULL DEFAULT 'approved',
        suggested_by uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at   timestamptz  NOT NULL DEFAULT NOW(),
        updated_at   timestamptz  NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_styles_status
        ON taxonomy.styles (status)
        WHERE status = 'pending';
    `);

    // Seed approved styles from the existing VARCHAR enum used in product_artisanal_identity
    await queryRunner.query(`
      INSERT INTO taxonomy.styles (name, status)
      VALUES
        ('Tradicional', 'approved'),
        ('Contemporáneo', 'approved'),
        ('Fusión', 'approved')
      ON CONFLICT (name) DO NOTHING;
    `);

    // ── artesanos.artisan_styles (junction) ──────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_styles (
        artisan_id uuid NOT NULL REFERENCES artesanos.artisan_profile(id) ON DELETE CASCADE,
        style_id   uuid NOT NULL REFERENCES taxonomy.styles(id)           ON DELETE CASCADE,
        PRIMARY KEY (artisan_id, style_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_styles_artisan
        ON artesanos.artisan_styles (artisan_id);
    `);

    // ── taxonomy.herramientas ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS taxonomy.herramientas (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name         varchar(120) NOT NULL UNIQUE,
        status       varchar(20)  NOT NULL DEFAULT 'approved',
        suggested_by uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at   timestamptz  NOT NULL DEFAULT NOW(),
        updated_at   timestamptz  NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_herramientas_status
        ON taxonomy.herramientas (status)
        WHERE status = 'pending';
    `);

    // ── artesanos.artisan_herramientas (junction) ────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_herramientas (
        artisan_id     uuid NOT NULL REFERENCES artesanos.artisan_profile(id)  ON DELETE CASCADE,
        herramienta_id uuid NOT NULL REFERENCES taxonomy.herramientas(id)      ON DELETE CASCADE,
        PRIMARY KEY (artisan_id, herramienta_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_herramientas_artisan
        ON artesanos.artisan_herramientas (artisan_id);
    `);

    // ── artesanos.story_library ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.story_library (
        id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id uuid        NOT NULL REFERENCES artesanos.artisan_profile(id) ON DELETE CASCADE,
        title      varchar(200) NOT NULL,
        type       varchar(30)  NOT NULL DEFAULT 'process',
        content    text         NOT NULL,
        is_public  boolean      NOT NULL DEFAULT false,
        created_at timestamptz  NOT NULL DEFAULT NOW(),
        updated_at timestamptz  NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_story_library_artisan
        ON artesanos.story_library (artisan_id);
    `);

    // ── artesanos.product_stories (M:N junction) ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.product_stories (
        product_id uuid NOT NULL REFERENCES shop.products(id) ON DELETE CASCADE,
        story_id   uuid NOT NULL REFERENCES artesanos.story_library(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, story_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_stories_product
        ON artesanos.product_stories (product_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.product_stories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.story_library;`);
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_herramientas;`);
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.herramientas;`);
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_styles;`);
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.styles;`);
  }
}
