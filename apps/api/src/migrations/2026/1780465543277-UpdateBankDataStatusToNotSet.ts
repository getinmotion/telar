import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRATION: Actualizar bank_data_status a 'not_set'
 *
 * DESCRIPCIÓN:
 * - Actualiza todos los registros de shop.artisan_shops
 * - Establece bank_data_status = 'not_set' para todos los registros
 *
 * IMPORTANTE:
 * - Esta migration NO es reversible porque no guarda los valores anteriores
 * - Si necesitas revertir, tendrás que restaurar desde un backup
 */
export class UpdateBankDataStatusToNotSet1780465543277
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '🔄 Actualizando bank_data_status a "not_set" en shop.artisan_shops...\n',
    );

    // Contar registros antes del update
    const countBefore = await queryRunner.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE bank_data_status = 'not_set') as ya_not_set,
        COUNT(*) FILTER (WHERE bank_data_status != 'not_set') as a_actualizar
      FROM shop.artisan_shops;
    `);

    console.log('📊 Estado ANTES del update:');
    console.table(countBefore);

    // Realizar el update
    const result = await queryRunner.query(`
      UPDATE shop.artisan_shops
      SET bank_data_status = 'not_set'
      WHERE bank_data_status != 'not_set' OR bank_data_status IS NULL;
    `);

    console.log(`✅ ${result[1]} registros actualizados\n`);

    // Verificar después del update
    const countAfter = await queryRunner.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE bank_data_status = 'not_set') as con_not_set,
        COUNT(*) FILTER (WHERE bank_data_status != 'not_set') as con_otro_valor
      FROM shop.artisan_shops;
    `);

    console.log('📊 Estado DESPUÉS del update:');
    console.table(countAfter);

    if (countAfter[0].con_otro_valor > 0) {
      console.warn(
        `⚠️ ADVERTENCIA: Aún hay ${countAfter[0].con_otro_valor} registros con otro valor`,
      );
    } else {
      console.log('✅ Todos los registros tienen bank_data_status = "not_set"');
    }

    console.log('\n✅ Actualización completada exitosamente!\n');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '⚠️ ADVERTENCIA: Esta migration NO es reversible de forma automática.',
    );
    console.log(
      '⚠️ Los valores anteriores de bank_data_status no se guardaron.',
    );
    console.log(
      '⚠️ Si necesitas revertir, debes restaurar desde un backup de la base de datos.\n',
    );

    throw new Error(
      'No se puede revertir UpdateBankDataStatusToNotSet. ' +
        'Los valores anteriores no se guardaron. ' +
        'Restaura desde un backup si necesitas los valores originales.',
    );
  }
}
