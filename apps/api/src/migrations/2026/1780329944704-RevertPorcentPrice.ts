import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRATION: Revertir incremento temporal de precios 20% + aplicar incremento 5%
 *
 * DESCRIPCIÓN:
 * - Restaura los precios desde la columna temporal (precio original)
 * - Aplica un incremento del 5% sobre el precio original
 * - Elimina la columna temporal
 * - Esta migration debe ejecutarse DESPUÉS DE 2 DÍAS de aplicar el incremento del 20%
 *
 * RESULTADO FINAL:
 * - De precio original: 100
 * - Se incrementó 20%: 120 (durante 2 días)
 * - Se revierte con +5%: 105 (precio final)
 *
 * PROCESO:
 * 1. Verificar que han pasado 2 días desde la migration anterior
 * 2. Ejecutar esta migration con `npm run migration:run`
 *
 * IMPORTANTE:
 * - NO ejecutar esta migration si la columna temp_original_price_minor no existe
 * - Verificar que los precios se restauran correctamente antes de confirmar
 */
export class RevertPorcentPrice1780329944704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Iniciando reversión de incremento de precios con ajuste del 5%...\n');

    // -------------------------------------------------------------------------
    // 1. VERIFICACIONES PREVIAS
    // -------------------------------------------------------------------------

    // Verificar que la columna temporal existe
    const columnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'shop'
        AND table_name = 'product_variants'
        AND column_name = 'temp_original_price_minor'
    `);

    if (columnExists.length === 0) {
      throw new Error(
        '❌ ERROR: La columna temp_original_price_minor no existe. ' +
          'Esta migration requiere que se haya ejecutado ApplyTempPriceIncrease20Percent primero.',
      );
    }

    console.log('✅ Columna temporal encontrada\n');

    // Estadísticas antes de revertir
    console.log('📊 Estadísticas ANTES de revertir:');
    const statsBefore = await queryRunner.query(`
      SELECT
        COUNT(*) as total_variantes,
        MIN(base_price_minor) as precio_minimo_actual,
        MAX(base_price_minor) as precio_maximo_actual,
        ROUND(AVG(base_price_minor)) as precio_promedio_actual,
        MIN(temp_original_price_minor) as precio_minimo_original,
        MAX(temp_original_price_minor) as precio_maximo_original,
        ROUND(AVG(temp_original_price_minor)) as precio_promedio_original
      FROM shop.product_variants
    `);
    console.table(statsBefore);

    // -------------------------------------------------------------------------
    // 2. RESTAURAR PRECIOS ORIGINALES CON INCREMENTO DEL 5%
    // -------------------------------------------------------------------------
    console.log('\n📥 Restaurando precios originales con incremento del 5%...');

    const result = await queryRunner.query(`
      UPDATE shop.product_variants
      SET base_price_minor = ROUND(temp_original_price_minor * 1.05)
      WHERE temp_original_price_minor IS NOT NULL
      RETURNING id
    `);

    console.log(`✅ ${result.length} variantes actualizadas con +5%\n`);

    // -------------------------------------------------------------------------
    // 3. VERIFICACIONES POST-REVERSIÓN
    // -------------------------------------------------------------------------
    console.log('📊 Estadísticas DESPUÉS de aplicar el ajuste:');
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

    // Verificar que el incremento del 5% se aplicó correctamente
    console.log('\n🔍 Verificando incremento del 5% sobre precios originales:');
    const verification = await queryRunner.query(`
      SELECT
        COUNT(*) as total_con_precio,
        ROUND(AVG((base_price_minor::NUMERIC / NULLIF(temp_original_price_minor, 0) - 1) * 100), 2) as incremento_promedio_porcentaje,
        MIN((base_price_minor::NUMERIC / NULLIF(temp_original_price_minor, 0) - 1) * 100) as incremento_minimo,
        MAX((base_price_minor::NUMERIC / NULLIF(temp_original_price_minor, 0) - 1) * 100) as incremento_maximo
      FROM shop.product_variants
      WHERE base_price_minor IS NOT NULL AND temp_original_price_minor IS NOT NULL
    `);
    console.table(verification);

    // Mostrar ejemplos de los cambios
    console.log('\n📋 Ejemplos de precios ajustados:');
    const examples = await queryRunner.query(`
      SELECT
        id,
        temp_original_price_minor as precio_original,
        base_price_minor as precio_final,
        (base_price_minor - temp_original_price_minor) as diferencia,
        ROUND(((base_price_minor::NUMERIC / temp_original_price_minor - 1) * 100), 2) as porcentaje_incremento
      FROM shop.product_variants
      WHERE base_price_minor IS NOT NULL AND temp_original_price_minor IS NOT NULL
      LIMIT 10
    `);
    console.table(examples);

    // -------------------------------------------------------------------------
    // 4. ELIMINAR COLUMNA TEMPORAL
    // -------------------------------------------------------------------------
    console.log('\n🗑️ Eliminando columna temporal...');

    await queryRunner.query(`
      ALTER TABLE shop.product_variants
      DROP COLUMN temp_original_price_minor
    `);

    console.log('✅ Columna temporal eliminada\n');

    // Verificar que la columna fue eliminada
    const columnStillExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'shop'
        AND table_name = 'product_variants'
        AND column_name = 'temp_original_price_minor'
    `);

    if (columnStillExists.length === 0) {
      console.log('✅ Confirmación: Columna temporal eliminada correctamente\n');
    } else {
      console.warn('⚠️ ADVERTENCIA: La columna temporal aún existe\n');
    }

    // Estadísticas finales
    console.log('📊 Estado FINAL:');
    const statsFinal = await queryRunner.query(`
      SELECT
        COUNT(*) as total_variantes,
        MIN(base_price_minor) as precio_minimo,
        MAX(base_price_minor) as precio_maximo,
        ROUND(AVG(base_price_minor)) as precio_promedio,
        COUNT(*) FILTER (WHERE base_price_minor IS NULL) as variantes_sin_precio
      FROM shop.product_variants
    `);
    console.table(statsFinal);

    console.log('\n✅ Ajuste de precios completado exitosamente!');
    console.log('✅ Los precios ahora tienen un incremento del 5% sobre el valor original\n');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '⚠️ ADVERTENCIA: No se puede revertir esta migration porque la columna temporal ya fue eliminada.',
    );
    console.log(
      '⚠️ Si necesitas volver a aplicar el incremento del 20%, ejecuta la migration ApplyTempPriceIncrease20Percent nuevamente.\n',
    );

    throw new Error(
      'No se puede revertir RevertTempPriceIncrease20Percent. ' +
        'La columna temporal ya no existe. ' +
        'Si necesitas aplicar el incremento nuevamente, ejecuta ApplyTempPriceIncrease20Percent.',
    );
  }
}
