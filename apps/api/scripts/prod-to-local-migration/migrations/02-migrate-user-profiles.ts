import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserProfiles() {
  const logger = new MigrationLogger('user-profiles');

  try {
    logger.log('📊 Contando perfiles de usuario en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM artesanos.user_profiles
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de perfiles a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay perfiles de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo perfiles de usuario de producción...');
    const profiles = await productionConnection.query(`
      SELECT * FROM artesanos.user_profiles ORDER BY created_at ASC
    `);

    logger.log(`✅ Perfiles leídos: ${profiles.length}\n`);
    logger.log('💾 Migrando perfiles a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, profile] of profiles.entries()) {
      try {
        const columns = Object.keys(profile);
        const values = Object.values(profile);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO artesanos.user_profiles (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando perfil ${profile.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de perfiles', error);
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
      await migrateUserProfiles();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
