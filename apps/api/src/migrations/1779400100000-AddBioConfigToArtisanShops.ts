import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBioConfigToArtisanShops1779400100000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN IF NOT EXISTS bio_config_show_shop_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS bio_config_show_profile_link BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS bio_config_featured_product_id UUID NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        DROP COLUMN IF EXISTS bio_config_show_shop_link,
        DROP COLUMN IF EXISTS bio_config_show_profile_link,
        DROP COLUMN IF EXISTS bio_config_featured_product_id;
    `);
  }
}
