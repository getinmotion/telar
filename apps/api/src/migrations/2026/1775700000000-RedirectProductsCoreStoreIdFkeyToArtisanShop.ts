import { MigrationInterface, QueryRunner } from 'typeorm';

export class RedirectProductsCoreStoreIdFkeyToArtisanShop1775700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing FK that points to shop.stores
    await queryRunner.query(`
      ALTER TABLE shop.products_core
      DROP CONSTRAINT IF EXISTS products_core_store_id_fkey;
    `);

    // Add new FK pointing to shop.artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.products_core
      ADD CONSTRAINT products_core_store_id_fkey
      FOREIGN KEY (store_id)
      REFERENCES shop.artisan_shops(id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the FK pointing to shop.artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.products_core
      DROP CONSTRAINT IF EXISTS products_core_store_id_fkey;
    `);

    // Restore the original FK pointing to shop.stores
    await queryRunner.query(`
      ALTER TABLE shop.products_core
      ADD CONSTRAINT products_core_store_id_fkey
      FOREIGN KEY (store_id)
      REFERENCES shop.stores(id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;
    `);
  }
}
