import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUsers() {
  const logger = new MigrationLogger('users');

  try {
    logger.log('📊 Contando usuarios en producción...');

    // 1. Contar registros
    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM auth.users
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de usuarios a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay usuarios para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer usuarios de producción con TODAS las columnas
    logger.log('📖 Leyendo usuarios de producción...');
    const users = await productionConnection.query(`
      SELECT * FROM auth.users ORDER BY created_at ASC
    `);

    logger.log(`✅ Usuarios leídos: ${users.length}\n`);

    // 3. Migrar usuarios a local
    logger.log('💾 Migrando usuarios a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, user] of users.entries()) {
      try {
        const columns = Object.keys(user);
        const values = Object.values(user);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO auth.users (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando usuario ${user.email || user.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    const summary = {
      success,
      failed,
      total,
    };

    logger.success(
      `✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`,
    );
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de usuarios', error);
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
      await migrateUsers();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
