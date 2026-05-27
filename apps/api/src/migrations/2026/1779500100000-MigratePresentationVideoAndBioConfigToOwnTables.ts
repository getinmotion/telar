import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratePresentationVideoAndBioConfigToOwnTables1779500100000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // artisan_presentation_video
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_presentation_video (
        artisan_identity_id UUID        PRIMARY KEY
          REFERENCES artesanos.artisan_identity(id) ON DELETE CASCADE,
        url                 TEXT        NULL,
        provider            TEXT        NULL,
        thumbnail_url       TEXT        NULL,
        duration_seconds    INTEGER     NULL,
        created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      INSERT INTO artesanos.artisan_presentation_video
        (artisan_identity_id, url, provider, thumbnail_url, duration_seconds)
      SELECT
        ap.artisan_identity_id,
        s.presentation_video->>'url',
        s.presentation_video->>'provider',
        s.presentation_video->>'thumbnail_url',
        (s.presentation_video->>'duration_seconds')::INTEGER
      FROM shop.artisan_shops s
      JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
      WHERE ap.artisan_identity_id IS NOT NULL
        AND s.presentation_video IS NOT NULL
        AND s.presentation_video->>'url' IS NOT NULL
      ON CONFLICT (artisan_identity_id) DO NOTHING;
    `);

    // Note: individual presentation_video columns were already consolidated into the
    // presentation_video JSONB column — no DROP needed here.

    // artisan_bio_config
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artesanos.artisan_bio_config (
        artisan_identity_id   UUID      PRIMARY KEY
          REFERENCES artesanos.artisan_identity(id) ON DELETE CASCADE,
        show_shop_link        BOOLEAN   NOT NULL DEFAULT true,
        show_profile_link     BOOLEAN   NOT NULL DEFAULT true,
        featured_product_id   UUID      NULL,
        created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      INSERT INTO artesanos.artisan_bio_config
        (artisan_identity_id, show_shop_link, show_profile_link, featured_product_id)
      SELECT
        ap.artisan_identity_id,
        COALESCE((s.bio_config->>'show_shop_link')::BOOLEAN, true),
        COALESCE((s.bio_config->>'show_profile_link')::BOOLEAN, true),
        (s.bio_config->>'featured_product_id')::UUID
      FROM shop.artisan_shops s
      JOIN artesanos.artisan_profile ap ON ap.user_id = s.user_id
      WHERE ap.artisan_identity_id IS NOT NULL
      ON CONFLICT (artisan_identity_id) DO NOTHING;
    `);

    // Note: individual bio_config columns were already consolidated into the
    // bio_config JSONB column — no DROP needed here.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_bio_config;`);

    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN IF NOT EXISTS bio_config_show_shop_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS bio_config_show_profile_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS bio_config_featured_product_id UUID NULL;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_presentation_video;`);

    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN IF NOT EXISTS presentation_video_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_provider TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_thumbnail_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_duration_seconds INTEGER NULL;
    `);
  }
}
