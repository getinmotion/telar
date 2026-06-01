import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agregar columna policies_config a artisan_shops
 *
 * Almacena la política de devoluciones y preguntas frecuentes del artesano.
 * Tipo: jsonb
 * Default: {}
 */
export class AddPoliciesConfigToArtisanShops1778630000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      ADD COLUMN policies_config jsonb NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      DROP COLUMN policies_config
    `);
  }
}
