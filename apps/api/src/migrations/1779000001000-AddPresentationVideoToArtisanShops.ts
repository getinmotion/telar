import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPresentationVideoToArtisanShops1779000001000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN IF NOT EXISTS presentation_video_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_provider TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_thumbnail_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS presentation_video_duration_seconds INTEGER NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        DROP COLUMN IF EXISTS presentation_video_url,
        DROP COLUMN IF EXISTS presentation_video_provider,
        DROP COLUMN IF EXISTS presentation_video_thumbnail_url,
        DROP COLUMN IF EXISTS presentation_video_duration_seconds;
    `);
  }
}
