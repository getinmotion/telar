import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductAttributeValues() {
  const logger = new MigrationLogger('product-attribute-values');

  try {
    logger.log('📊 Contando valores de atributos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_attribute_values
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de valores a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay valores de atributos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo valores de producción...');
    const values = await productionConnection.query(`
      SELECT * FROM shop.product_attribute_values ORDER BY created_at ASC
    `);

    logger.log(`✅ Valores leídos: ${values.length}\n`);
    logger.log('💾 Migrando valores a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, value] of values.entries()) {
      try {
        const columns = Object.keys(value);
        const vals = Object.values(value);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_attribute_values (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          vals
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando valor ${value.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de valores de atributos', error);
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
      await migrateProductAttributeValues();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
