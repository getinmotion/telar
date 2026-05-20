import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPresentationVideoToArtisanShops1779000001000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS artesanos.artisan_presentation_video;
    `);
  }
}
