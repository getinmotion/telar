import { supabaseConnection, productionConnection } from '../config';

/**
 * Migración de user_roles desde Supabase (public.user_roles) a Producción (auth.user_roles)
 */
export async function migrateUserRoles(): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  console.log('=== Iniciando migración de User Roles ===');

  try {
    // Obtener datos desde Supabase
    console.log('Obteniendo user_roles desde Supabase...');
    const supabaseUserRoles = await supabaseConnection.query(
      `SELECT
        id,
        user_id,
        role,
        granted_at,
        granted_by,
        created_at
      FROM public.user_roles
      ORDER BY created_at ASC`,
    );

    console.log(
      `✓ ${supabaseUserRoles.length} user_roles encontrados en Supabase`,
    );

    if (supabaseUserRoles.length === 0) {
      console.log('No hay user_roles para migrar.');
      return { success: 0, failed: 0, total: 0 };
    }

    // Verificar cuántos ya existen en producción
    const existingUserRoles = await productionConnection.query(
      `SELECT id FROM auth.user_roles`,
    );
    console.log(
      `ℹ ${existingUserRoles.length} user_roles ya existen en Producción`,
    );

    // Preparar datos para inserción
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const existingIds = new Set(existingUserRoles.map((ur) => ur.id));

    for (const userRole of supabaseUserRoles) {
      // Saltar si ya existe
      if (existingIds.has(userRole.id)) {
        skippedCount++;
        successCount++; // Contar como exitoso porque ya existe
        continue;
      }

      try {
        await productionConnection.query(
          `INSERT INTO auth.user_roles (
            id,
            user_id,
            role,
            granted_at,
            granted_by,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userRole.id,
            userRole.user_id,
            userRole.role, // El enum se maneja automáticamente
            userRole.granted_at,
            userRole.granted_by,
            userRole.created_at,
          ],
        );

        successCount++;

        if (successCount % 100 === 0) {
          console.log(`  → ${successCount} user_roles procesados...`);
        }
      } catch (error) {
        failedCount++;
        console.error(
          `✗ Error insertando user_role ${userRole.id}:`,
          error.message,
        );
      }
    }

    const insertedCount = successCount - skippedCount;

    console.log('\n=== Resumen de migración de User Roles ===');
    console.log(`Total en Supabase: ${supabaseUserRoles.length}`);
    console.log(`Insertados: ${insertedCount}`);
    console.log(`Omitidos (ya existían): ${skippedCount}`);
    console.log(`Fallidos: ${failedCount}`);
    console.log('✓ Migración de user_roles completada\n');

    return {
      success: successCount,
      failed: failedCount,
      total: supabaseUserRoles.length,
    };
  } catch (error) {
    console.error('✗ Error en migración de user_roles:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserRoles();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
