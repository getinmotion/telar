import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUsers() {
  const logger = new MigrationLogger('users');

  try {
    logger.log('📊 Contando usuarios en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM auth.users
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de usuarios a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay usuarios para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer usuarios de Supabase con TODAS las columnas
    logger.log('📖 Leyendo usuarios de Supabase...');
    const users = await supabaseConnection.query(`
      SELECT
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
      FROM auth.users
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Usuarios leídos: ${users.length}\n`);

    // 3. Migrar usuarios
    logger.log('💾 Migrando usuarios a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, user] of users.entries()) {
      try {
        // Insertar en producción con TODAS las columnas
        // Nota: confirmed_at es una columna generada, no se inserta manualmente
        await productionConnection.query(
          `
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at,
            is_anonymous
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34
          )
          ON CONFLICT (id) DO UPDATE SET
            instance_id = EXCLUDED.instance_id,
            aud = EXCLUDED.aud,
            role = EXCLUDED.role,
            email = EXCLUDED.email,
            encrypted_password = EXCLUDED.encrypted_password,
            email_confirmed_at = EXCLUDED.email_confirmed_at,
            invited_at = EXCLUDED.invited_at,
            confirmation_token = EXCLUDED.confirmation_token,
            confirmation_sent_at = EXCLUDED.confirmation_sent_at,
            recovery_token = EXCLUDED.recovery_token,
            recovery_sent_at = EXCLUDED.recovery_sent_at,
            email_change_token_new = EXCLUDED.email_change_token_new,
            email_change = EXCLUDED.email_change,
            email_change_sent_at = EXCLUDED.email_change_sent_at,
            last_sign_in_at = EXCLUDED.last_sign_in_at,
            raw_app_meta_data = EXCLUDED.raw_app_meta_data,
            raw_user_meta_data = EXCLUDED.raw_user_meta_data,
            is_super_admin = EXCLUDED.is_super_admin,
            updated_at = EXCLUDED.updated_at,
            phone = EXCLUDED.phone,
            phone_confirmed_at = EXCLUDED.phone_confirmed_at,
            phone_change = EXCLUDED.phone_change,
            phone_change_token = EXCLUDED.phone_change_token,
            phone_change_sent_at = EXCLUDED.phone_change_sent_at,
            email_change_token_current = EXCLUDED.email_change_token_current,
            email_change_confirm_status = EXCLUDED.email_change_confirm_status,
            banned_until = EXCLUDED.banned_until,
            reauthentication_token = EXCLUDED.reauthentication_token,
            reauthentication_sent_at = EXCLUDED.reauthentication_sent_at,
            is_sso_user = EXCLUDED.is_sso_user,
            deleted_at = EXCLUDED.deleted_at,
            is_anonymous = EXCLUDED.is_anonymous
        `,
          [
            user.instance_id,
            user.id,
            user.aud,
            user.role,
            user.email,
            user.encrypted_password,
            user.email_confirmed_at,
            user.invited_at,
            user.confirmation_token,
            user.confirmation_sent_at,
            user.recovery_token,
            user.recovery_sent_at,
            user.email_change_token_new,
            user.email_change,
            user.email_change_sent_at,
            user.last_sign_in_at,
            user.raw_app_meta_data,
            user.raw_user_meta_data,
            user.is_super_admin,
            user.created_at,
            user.updated_at,
            user.phone,
            user.phone_confirmed_at,
            user.phone_change,
            user.phone_change_token,
            user.phone_change_sent_at,
            user.email_change_token_current,
            user.email_change_confirm_status,
            user.banned_until,
            user.reauthentication_token,
            user.reauthentication_sent_at,
            user.is_sso_user,
            user.deleted_at,
            user.is_anonymous,
          ],
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
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de usuarios', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUsers();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
