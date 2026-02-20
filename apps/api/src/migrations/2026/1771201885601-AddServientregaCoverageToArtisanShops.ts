import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agregar columna servientrega_coverage a artisan_shops
 *
 * Indica si la tienda tiene cobertura de Servientrega
 * Tipo: boolean
 * Default: false
 * NOT NULL
 */
export class AddServientregaCoverageToArtisanShops1771201885601
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      ADD COLUMN servientrega_coverage boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      DROP COLUMN servientrega_coverage
    `);
  }
}
