import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para sincronizar datos de artisan_shops a stores
 * Inserta en stores los registros de artisan_shops que no tienen correspondencia
 * usando legacy_id como referencia
 */
export class SyncArtisanShopsToStores1775650000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Iniciando sincronización de artisan_shops a stores...');

    // Insertar en stores los registros de artisan_shops que no existen
    // Validación: artisan_shops.id vs stores.legacy_id
    await queryRunner.query(`
      INSERT INTO store.stores (
        user_id,
        name,
        slug,
        story,
        legacy_id,
        created_at,
        updated_at
      )
      SELECT
        ash.user_id,
        ash.shop_name as name,
        ash.shop_slug as slug,
        ash.story,
        ash.id as legacy_id,
        ash.created_at,
        ash.updated_at
      FROM shop.artisan_shops ash
      WHERE NOT EXISTS (
        SELECT 1
        FROM store.stores s
        WHERE s.legacy_id = ash.id
      )
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // Obtener conteo de registros insertados
    const result = await queryRunner.query(`
      SELECT COUNT(*) as total
      FROM shop.artisan_shops ash
      WHERE NOT EXISTS (
        SELECT 1
        FROM store.stores s
        WHERE s.legacy_id = ash.id
      )
    `);

    console.log(
      `Sincronización completada. Registros procesados: ${result[0]?.total || 0}`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir eliminando registros de stores que fueron sincronizados
    console.log('Revirtiendo sincronización...');

    await queryRunner.query(`
      DELETE FROM store.stores
      WHERE legacy_id IN (
        SELECT id
        FROM shop.artisan_shops
      )
      AND created_at >= (
        SELECT created_at
        FROM store.stores
        ORDER BY created_at DESC
        LIMIT 1
      );
    `);

    console.log('Reversión completada.');
  }
}
