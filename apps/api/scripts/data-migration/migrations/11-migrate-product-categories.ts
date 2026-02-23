import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductCategories() {
  const logger = new MigrationLogger('product-categories');

  try {
    logger.log('📊 Contando categorías de productos en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.product_categories
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de categorías a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay categorías de productos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer categorías de Supabase
    logger.log('📖 Leyendo categorías de productos de Supabase...');
    const categories = await supabaseConnection.query(`
      SELECT
        id,
        name,
        slug,
        description,
        parent_id,
        display_order,
        is_active,
        image_url,
        created_at,
        updated_at
      FROM public.product_categories
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Categorías leídas: ${categories.length}\n`);

    // 3. Migrar categorías
    logger.log('💾 Migrando categorías de productos a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, category] of categories.entries()) {
      try {
        // Insertar en producción (schema shop)
        await productionConnection.query(
          `
          INSERT INTO shop.product_categories (
            id,
            name,
            slug,
            description,
            parent_id,
            display_order,
            is_active,
            image_url,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            description = EXCLUDED.description,
            parent_id = EXCLUDED.parent_id,
            display_order = EXCLUDED.display_order,
            is_active = EXCLUDED.is_active,
            image_url = EXCLUDED.image_url,
            updated_at = EXCLUDED.updated_at
        `,
          [
            category.id,
            category.name,
            category.slug,
            category.description,
            category.parent_id,
            category.display_order,
            category.is_active,
            category.image_url,
            category.created_at,
            category.updated_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando categoría ${category.name || category.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de categorías de productos', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateProductCategories();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
