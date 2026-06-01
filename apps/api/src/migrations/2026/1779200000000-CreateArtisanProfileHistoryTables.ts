import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtisanProfileHistoryTables1779200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── artesanos.artisan_profile_history ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_profile_history (
        id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id      uuid         NOT NULL REFERENCES artesanos.artisan_profile(id) ON DELETE CASCADE,
        shop_name       varchar(200) NOT NULL,
        craft_type      varchar(100) NOT NULL,
        region          varchar(100) NOT NULL,
        hero_title      text         NOT NULL,
        hero_subtitle   text         NOT NULL,
        claim           text         NOT NULL,
        origin_story    text         NOT NULL,
        cultural_story  text         NOT NULL,
        craft_story     text         NOT NULL,
        workshop_story  text         NOT NULL,
        artisan_quote   text         NOT NULL,
        closing_message text         NOT NULL,
        created_at      timestamptz  NOT NULL DEFAULT NOW(),
        updated_at      timestamptz  NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_profile_history_artisan
        ON artesanos.artisan_profile_history (artisan_id);
    `);

    // ── artesanos.artisan_profile_history_timeline ───────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_profile_history_timeline (
        id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        history_id uuid        NOT NULL REFERENCES artesanos.artisan_profile_history(id) ON DELETE CASCADE,
        year       varchar(50)  NOT NULL,
        event      text         NOT NULL,
        sort_order integer      NOT NULL DEFAULT 0,
        created_at timestamptz  NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_profile_history_timeline_history
        ON artesanos.artisan_profile_history_timeline (history_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_profile_history_timeline;`);
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_profile_history;`);
  }
}
