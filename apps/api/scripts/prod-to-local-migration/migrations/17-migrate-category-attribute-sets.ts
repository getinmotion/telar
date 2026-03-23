import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateCategoryAttributeSets() {
  const logger = new MigrationLogger('category-attribute-sets');

  try {
    logger.log('📊 Contando conjuntos de atributos de categorías en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.category_attribute_sets
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de conjuntos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay conjuntos de atributos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo conjuntos de producción...');
    const sets = await productionConnection.query(`
      SELECT * FROM shop.category_attribute_sets ORDER BY created_at ASC
    `);

    logger.log(`✅ Conjuntos leídos: ${sets.length}\n`);
    logger.log('💾 Migrando conjuntos a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, set] of sets.entries()) {
      try {
        const columns = Object.keys(set);
        const values = Object.values(set);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.category_attribute_sets (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando conjunto ${set.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de conjuntos de atributos', error);
    const summary = { success: 0, failed: 0, total: 0 };
    logger.finish(summary);
    throw error;
  }
}

// Ejecutar standalone
if (require.main === module) {
  (async () => {
    try {
      await initConnections();
      await migrateCategoryAttributeSets();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
