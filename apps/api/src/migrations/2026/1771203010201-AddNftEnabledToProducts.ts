import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agregar columna nft_enabled a products
 *
 * Indica si el producto tiene NFT habilitado
 * Tipo: boolean
 * Default: false
 * NOT NULL
 */
export class AddNftEnabledToProducts1771203010201
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.products
      ADD COLUMN nft_enabled boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.products
      DROP COLUMN nft_enabled
    `);
  }
}
