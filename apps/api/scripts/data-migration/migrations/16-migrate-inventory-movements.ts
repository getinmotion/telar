import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

interface InventoryMovement {
  id: string;
  product_variant_id: string;
  type: string;
  qty: number;
  reason: string | null;
  ref_id: string | null;
  created_by: string | null;
  created_at: Date;
}

export async function migrateInventoryMovements() {
  const logger = new MigrationLogger('inventory_movements');

  try {
    logger.log(
      '========== Iniciando migración: inventory_movements ==========',
    );

    // 1. Verificar si la tabla existe en Supabase
    logger.log('🔍 Verificando existencia de tabla en Supabase...');
    const tableCheck = await supabaseConnection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'inventory_movements'
      ) as exists
    `);

    if (!tableCheck[0]?.exists) {
      logger.log(
        '⚠️  ADVERTENCIA: La tabla inventory_movements no existe en Supabase. Saltando migración...',
      );
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Contar movimientos en Supabase
    logger.log('📊 Contando movimientos en Supabase...');
    const countResult = await supabaseConnection.query(
      'SELECT COUNT(*) FROM public.inventory_movements',
    );
    const total = parseInt(countResult[0].count);
    logger.log(`📊 Total de movimientos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('✅ No hay movimientos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 3. Leer movimientos de Supabase
    logger.log('📖 Leyendo movimientos de Supabase...');
    const movements: InventoryMovement[] = await supabaseConnection.query(`
      SELECT
        id,
        product_variant_id,
        type,
        qty,
        reason,
        ref_id,
        created_by,
        created_at
      FROM public.inventory_movements
      ORDER BY created_at ASC
    `);
    logger.log(`✅ Movimientos leídos: ${movements.length}\n`);

    // 4. Migrar a producción
    logger.log('💾 Migrando movimientos a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, movement] of movements.entries()) {
      try {
        // Validar que la variante de producto existe en producción
        const variantCheck = await productionConnection.query(
          `SELECT id FROM public.product_variants WHERE id = $1`,
          [movement.product_variant_id],
        );

        if (variantCheck.length === 0) {
          logger.log(
            `⚠️  Variante ${movement.product_variant_id} no existe para movimiento ${movement.id}. Saltando...`,
          );
          failed++;
          progress.update(index + 1);
          continue;
        }

        // Validar que el usuario existe si created_by está presente
        if (movement.created_by) {
          const userCheck = await productionConnection.query(
            `SELECT id FROM auth.users WHERE id = $1`,
            [movement.created_by],
          );

          if (userCheck.length === 0) {
            logger.log(
              `⚠️  Usuario ${movement.created_by} no existe para movimiento ${movement.id}. Estableciendo created_by como null...`,
            );
            movement.created_by = null;
          }
        }

        // Insertar en producción con ON CONFLICT para actualizar si ya existe
        await productionConnection.query(
          `
          INSERT INTO public.inventory_movements (
            id,
            product_variant_id,
            type,
            qty,
            reason,
            ref_id,
            created_by,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            product_variant_id = EXCLUDED.product_variant_id,
            type = EXCLUDED.type,
            qty = EXCLUDED.qty,
            reason = EXCLUDED.reason,
            ref_id = EXCLUDED.ref_id,
            created_by = EXCLUDED.created_by,
            created_at = EXCLUDED.created_at
        `,
          [
            movement.id,
            movement.product_variant_id,
            movement.type,
            movement.qty,
            movement.reason,
            movement.ref_id,
            movement.created_by,
            movement.created_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando movimiento ${movement.id}`, error);
      }

      progress.update(index + 1);
    }

    logger.log(
      `\n✅ Migración completada: ${success} exitosos, ${failed} fallidos`,
    );
    return { success, failed, total };
  } catch (error) {
    logger.error('Error en la migración de inventory_movements', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateInventoryMovements();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
