import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Actualizar constraint de bank_data_status en artisan_shops
 *
 * Valores anteriores: 'not_set', 'pending', 'approved'
 * Valores nuevos: 'not_set', 'complete'
 *
 * Cambios:
 * - Migra 'pending' → 'complete'
 * - Migra 'approved' → 'complete'
 * - Elimina constraint antiguo
 * - Crea constraint nuevo
 */
export class UpdateBankDataStatusConstraint1771202604956
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Actualizar datos existentes: 'pending' → 'complete'
    await queryRunner.query(`
      UPDATE shop.artisan_shops
      SET bank_data_status = 'complete'
      WHERE bank_data_status = 'pending'
    `);

    // 2. Actualizar datos existentes: 'approved' → 'complete'
    await queryRunner.query(`
      UPDATE shop.artisan_shops
      SET bank_data_status = 'complete'
      WHERE bank_data_status = 'approved'
    `);

    // 3. Eliminar constraint antiguo
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      DROP CONSTRAINT IF EXISTS artisan_shops_bank_data_status_check
    `);

    // 4. Crear constraint nuevo con valores correctos
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      ADD CONSTRAINT artisan_shops_bank_data_status_check
      CHECK (bank_data_status = ANY (ARRAY['not_set'::text, 'complete'::text]))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: 'complete' → 'approved' (decisión arbitraria)
    await queryRunner.query(`
      UPDATE shop.artisan_shops
      SET bank_data_status = 'approved'
      WHERE bank_data_status = 'complete'
    `);

    // Eliminar constraint nuevo
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      DROP CONSTRAINT IF EXISTS artisan_shops_bank_data_status_check
    `);

    // Restaurar constraint antiguo
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      ADD CONSTRAINT artisan_shops_bank_data_status_check
      CHECK (bank_data_status = ANY (ARRAY['not_set'::text, 'pending'::text, 'approved'::text]))
    `);
  }
}
