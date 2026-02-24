import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateEmailVerifications() {
  const logger = new MigrationLogger('email-verifications');

  try {
    logger.log('📊 Contando verificaciones de email en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.email_verifications
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de verificaciones de email a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay verificaciones de email para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer verificaciones de Supabase
    logger.log('📖 Leyendo verificaciones de email de Supabase...');
    const verifications = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        token,
        expires_at,
        used_at,
        created_at
      FROM public.email_verifications
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Verificaciones leídas: ${verifications.length}\n`);

    // 3. Migrar verificaciones
    logger.log('💾 Migrando verificaciones de email a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, verification] of verifications.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.email_verifications (
            id,
            user_id,
            token,
            expires_at,
            used_at,
            created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            token = EXCLUDED.token,
            expires_at = EXCLUDED.expires_at,
            used_at = EXCLUDED.used_at
        `,
          [
            verification.id,
            verification.user_id,
            verification.token,
            verification.expires_at,
            verification.used_at,
            verification.created_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando verificación de email ${verification.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de verificaciones de email', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateEmailVerifications();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
