import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRATION: Incremento temporal de precios 20%
 *
 * DESCRIPCIÓN:
 * - Crea una columna temporal para guardar los precios originales
 * - Incrementa todos los precios en un 20%
 * - Duración prevista: 2 días
 *
 * PROCESO:
 * 1. HOY: Ejecutar esta migration con `npm run migration:run`
 * 2. ESPERAR 2 DÍAS
 * 3. Ejecutar la migration RevertTempPriceIncrease20Percent
 *
 * ROLLBACK:
 * - Si necesitas revertir antes de los 2 días, ejecuta `npm run migration:revert`
 */
export class ApplyTempPriceIncrease20Percent1780118319749
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Iniciando incremento temporal de precios 20%...\n');

    // -------------------------------------------------------------------------
    // 1. VERIFICACIONES PREVIAS
    // -------------------------------------------------------------------------
    console.log('📊 Estadísticas ANTES del cambio:');
    const statsBefore = await queryRunner.query(`
      SELECT
        COUNT(*) as total_variantes,
        MIN(base_price_minor) as precio_minimo,
        MAX(base_price_minor) as precio_maximo,
        ROUND(AVG(base_price_minor)) as precio_promedio,
        COUNT(*) FILTER (WHERE base_price_minor IS NULL) as variantes_sin_precio
      FROM shop.product_variants
    `);
    console.table(statsBefore);

    // -------------------------------------------------------------------------
    // 2. CREAR COLUMNA TEMPORAL Y GUARDAR PRECIOS ORIGINALES
    // -------------------------------------------------------------------------
    console.log('\n💾 Creando columna temporal y guardando precios originales...');

    await queryRunner.query(`
      ALTER TABLE shop.product_variants
      ADD COLUMN IF NOT EXISTS temp_original_price_minor BIGINT
    `);

    await queryRunner.query(`
      UPDATE shop.product_variants
      SET temp_original_price_minor = base_price_minor
    `);

    // Verificar backup
    const backupVerification = await queryRunner.query(`
      SELECT
        COUNT(*) as total_respaldados,
        COUNT(*) FILTER (WHERE temp_original_price_minor = base_price_minor) as coincidencias_correctas,
        COUNT(*) FILTER (WHERE temp_original_price_minor IS NULL AND base_price_minor IS NULL) as nulos_correctos
      FROM shop.product_variants
    `);
    console.log('✅ Backup verificado:');
    console.table(backupVerification);

    // -------------------------------------------------------------------------
    // 3. APLICAR INCREMENTO DEL 20%
    // -------------------------------------------------------------------------
    console.log('\n📈 Aplicando incremento del 20%...');

    const result = await queryRunner.query(`
      UPDATE shop.product_variants
      SET base_price_minor = ROUND(base_price_minor * 1.20)
      WHERE base_price_minor IS NOT NULL
      RETURNING id
    `);

    console.log(`✅ ${result.length} variantes actualizadas\n`);

    // -------------------------------------------------------------------------
    // 4. VERIFICACIONES POST-CAMBIO
    // -------------------------------------------------------------------------
    console.log('📊 Estadísticas DESPUÉS del cambio:');
    const statsAfter = await queryRunner.query(`
      SELECT
        COUNT(*) as total_variantes,
        MIN(base_price_minor) as precio_minimo,
        MAX(base_price_minor) as precio_maximo,
        ROUND(AVG(base_price_minor)) as precio_promedio,
        COUNT(*) FILTER (WHERE base_price_minor IS NULL) as variantes_sin_precio
      FROM shop.product_variants
    `);
    console.table(statsAfter);

    // Verificar incremento
    console.log('\n📊 Verificación del incremento:');
    const incrementVerification = await queryRunner.query(`
      SELECT
        COUNT(*) as total_con_precio,
        ROUND(AVG((base_price_minor::NUMERIC / NULLIF(temp_original_price_minor, 0) - 1) * 100), 2) as incremento_promedio_porcentaje
      FROM shop.product_variants
      WHERE base_price_minor IS NOT NULL AND temp_original_price_minor IS NOT NULL
    `);
    console.table(incrementVerification);

    // Mostrar ejemplos
    console.log('\n📋 Ejemplos de cambios:');
    const examples = await queryRunner.query(`
      SELECT
        id,
        temp_original_price_minor as precio_original,
        base_price_minor as precio_nuevo,
        (base_price_minor - temp_original_price_minor) as diferencia,
        ROUND(((base_price_minor::NUMERIC / temp_original_price_minor - 1) * 100), 2) as porcentaje_incremento
      FROM shop.product_variants
      WHERE base_price_minor IS NOT NULL
      LIMIT 5
    `);
    console.table(examples);

    console.log(
      '\n✅ Incremento de precios aplicado exitosamente!',
    );
    console.log(
      '⏰ Recuerda ejecutar la migration de reversión después de 2 días\n',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Revirtiendo incremento de precios...\n');

    // Restaurar precios desde la columna temporal
    await queryRunner.query(`
      UPDATE shop.product_variants
      SET base_price_minor = temp_original_price_minor
    `);

    console.log('✅ Precios restaurados desde columna temporal\n');

    // Eliminar columna temporal
    await queryRunner.query(`
      ALTER TABLE shop.product_variants
      DROP COLUMN IF EXISTS temp_original_price_minor
    `);

    console.log('✅ Columna temporal eliminada');

    // Mostrar estadísticas finales
    const statsAfterRevert = await queryRunner.query(`
      SELECT
        COUNT(*) as total_variantes,
        MIN(base_price_minor) as precio_minimo,
        MAX(base_price_minor) as precio_maximo,
        ROUND(AVG(base_price_minor)) as precio_promedio
      FROM shop.product_variants
    `);
    console.log('\n📊 Estadísticas después de revertir:');
    console.table(statsAfterRevert);

    console.log('\n✅ Rollback completado exitosamente!\n');
  }
}
