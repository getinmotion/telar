import { supabaseConnection, productionConnection } from '../config';

/**
 * Migración de product_moderation_history desde Supabase a Producción
 *
 * NOTA: Esta tabla fue creada recientemente, por lo que probablemente no haya
 * datos existentes en Supabase. Esta migración está preparada por si acaso
 * existen registros históricos.
 */
export async function migrateProductModerationHistory(): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  console.log('=== Iniciando migración de Product Moderation History ===');

  try {
    // Verificar si la tabla existe en Supabase
    const tableExistsResult = await supabaseConnection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'product_moderation_history'
      ) as exists
    `);

    const tableExists = tableExistsResult[0]?.exists;

    if (!tableExists) {
      console.log(
        'ℹ La tabla product_moderation_history no existe en Supabase.',
      );
      console.log('✓ Esta es una tabla nueva, no hay datos que migrar.\n');
      return { success: 0, failed: 0, total: 0 };
    }

    // Obtener datos desde Supabase
    console.log(
      'Obteniendo registros de product_moderation_history desde Supabase...',
    );
    const supabaseHistory = await supabaseConnection.query(
      `SELECT
        id,
        product_id,
        previous_status,
        new_status,
        moderator_id,
        artisan_id,
        comment,
        edits_made,
        created_at
      FROM public.product_moderation_history
      ORDER BY created_at ASC`,
    );

    console.log(
      `✓ ${supabaseHistory.length} registros encontrados en Supabase`,
    );

    if (supabaseHistory.length === 0) {
      console.log('No hay registros de moderación para migrar.');
      console.log('✓ La tabla está lista para recibir nuevos datos.\n');
      return { success: 0, failed: 0, total: 0 };
    }

    // Verificar cuántos ya existen en producción
    const existingHistory = await productionConnection.query(
      `SELECT id FROM public.product_moderation_history`,
    );
    console.log(
      `ℹ ${existingHistory.length} registros ya existen en Producción`,
    );

    // Preparar datos para inserción
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const existingIds = new Set(existingHistory.map((h) => h.id));

    for (const history of supabaseHistory) {
      // Saltar si ya existe
      if (existingIds.has(history.id)) {
        skippedCount++;
        successCount++; // Contar como exitoso porque ya existe
        continue;
      }

      try {
        // Sanitizar edits_made (JSONB)
        let editsMade = history.edits_made;
        if (editsMade === null || editsMade === undefined || editsMade === '') {
          editsMade = {};
        } else if (typeof editsMade === 'string') {
          try {
            editsMade = JSON.parse(editsMade);
          } catch {
            editsMade = {};
          }
        }

        await productionConnection.query(
          `INSERT INTO public.product_moderation_history (
            id,
            product_id,
            previous_status,
            new_status,
            moderator_id,
            artisan_id,
            comment,
            edits_made,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            history.id,
            history.product_id,
            history.previous_status || null,
            history.new_status,
            history.moderator_id || null,
            history.artisan_id || null,
            history.comment || null,
            JSON.stringify(editsMade),
            history.created_at,
          ],
        );

        successCount++;

        if (successCount % 100 === 0) {
          console.log(
            `  → ${successCount} registros de moderación procesados...`,
          );
        }
      } catch (error) {
        failedCount++;
        console.error(
          `✗ Error insertando registro ${history.id}:`,
          error.message,
        );
      }
    }

    const insertedCount = successCount - skippedCount;

    console.log('\n=== Resumen de migración de Product Moderation History ===');
    console.log(`Total en Supabase: ${supabaseHistory.length}`);
    console.log(`Insertados: ${insertedCount}`);
    console.log(`Omitidos (ya existían): ${skippedCount}`);
    console.log(`Fallidos: ${failedCount}`);
    console.log('✓ Migración de product_moderation_history completada\n');

    return {
      success: successCount,
      failed: failedCount,
      total: supabaseHistory.length,
    };
  } catch (error) {
    console.error('✗ Error en migración de product_moderation_history:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateProductModerationHistory();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
