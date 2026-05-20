import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBioConfigToArtisanShops1779400100000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS artesanos.artisan_bio_config;
    `);
  }
}
