import { initConnections, closeConnections } from './config';
import { migrateUsers } from './migrations/01-migrate-users';
import { migrateUserProfiles } from './migrations/02-migrate-user-profiles';
import { migrateUserProgress } from './migrations/03-migrate-user-progress';
import { migrateAgentTasks } from './migrations/04-migrate-agent-tasks';
import { migrateEmailVerifications } from './migrations/05-migrate-email-verifications';
import { migrateMasterCoordinatorContext } from './migrations/06-migrate-master-coordinator-context';
import { migrateUserAchievements } from './migrations/07-migrate-user-achievements';
import { migrateUserMasterContext } from './migrations/08-migrate-user-master-context';
import { migrateUserMaturityScores } from './migrations/09-migrate-user-maturity-scores';
import { migrateArtisanShops } from './migrations/10-migrate-artisan-shops';
import { migrateProductCategories } from './migrations/11-migrate-product-categories';
import { migrateProducts } from './migrations/12-migrate-products';
import { migrateUserRoles } from './migrations/13-migrate-user-roles';
// Importar otras migraciones cuando las crees

interface MigrationResult {
  name: string;
  description: string;
  fn: () => Promise<{ success: number; failed: number; total: number }>;
  result?: { success: number; failed: number; total: number };
  error?: string;
  status: 'success' | 'failed';
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Migración de Datos Supabase → Producción  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const startTime = Date.now();

  try {
    // Conectar a ambas bases de datos
    await initConnections();

    // Definir las migraciones a ejecutar
    const migrations = [
      {
        name: 'Usuarios',
        description: 'Migrar usuarios de auth.users a auth.users',
        fn: migrateUsers,
      },
      {
        name: 'Perfiles de Usuario',
        description: 'Migrar perfiles de public.user_profiles a artesanos.user_profiles',
        fn: migrateUserProfiles,
      },
      {
        name: 'Progreso de Usuario',
        description: 'Migrar progreso de public.user_progress a artesanos.user_progress',
        fn: migrateUserProgress,
      },
      {
        name: 'Tareas de Agentes',
        description: 'Migrar tareas de public.agent_tasks a public.agent_tasks',
        fn: migrateAgentTasks,
      },
      {
        name: 'Verificaciones de Email',
        description: 'Migrar verificaciones de public.email_verifications a public.email_verifications',
        fn: migrateEmailVerifications,
      },
      {
        name: 'Contexto Coordinador Maestro',
        description: 'Migrar contexto de public.master_coordinator_context a public.master_coordinator_context',
        fn: migrateMasterCoordinatorContext,
      },
      {
        name: 'Logros de Usuario',
        description: 'Migrar logros de public.user_achievements a public.user_achievements',
        fn: migrateUserAchievements,
      },
      {
        name: 'Contexto Maestro de Usuario',
        description: 'Migrar contexto de public.user_master_context a public.user_master_context',
        fn: migrateUserMasterContext,
      },
      {
        name: 'Puntuaciones de Madurez',
        description: 'Migrar puntuaciones de public.user_maturity_scores a public.user_maturity_scores',
        fn: migrateUserMaturityScores,
      },
      {
        name: 'Tiendas Artesanas',
        description: 'Migrar tiendas de public.artisan_shops a shop.artisan_shops',
        fn: migrateArtisanShops,
      },
      {
        name: 'Categorías de Productos',
        description: 'Migrar categorías de public.product_categories a shop.product_categories',
        fn: migrateProductCategories,
      },
      {
        name: 'Productos',
        description: 'Migrar productos de public.products a shop.products',
        fn: migrateProducts,
      },
      {
        name: 'Roles de Usuario',
        description: 'Migrar roles de public.user_roles a auth.user_roles',
        fn: migrateUserRoles,
      },
      // Agregar más migraciones aquí
    ];

    const results: MigrationResult[] = [];

    // Ejecutar cada migración
    for (const [index, migration] of migrations.entries()) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📦 Migración ${index + 1}/${migrations.length}: ${migration.name}`);
      console.log(`📝 ${migration.description}`);
      console.log('='.repeat(50) + '\n');

      try {
        const result = await migration.fn();
        results.push({
          ...migration,
          result,
          status: 'success',
        });
      } catch (error) {
        console.error(`\n❌ FALLO CRÍTICO en migración de ${migration.name}`);
        console.error(error);

        results.push({
          ...migration,
          error: error instanceof Error ? error.message : String(error),
          status: 'failed',
        });

        // Decidir si continuar con las siguientes migraciones o detener
        const continueOnError = process.env.CONTINUE_ON_ERROR === 'true';

        if (!continueOnError) {
          console.log('\n⛔ Deteniendo migración debido a error');
          break;
        }
      }
    }

    // Resumen final
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Resumen de Migraciones             ║');
    console.log('╚════════════════════════════════════════════╝\n');

    let totalSuccess = 0;
    let totalFailed = 0;
    let totalRecords = 0;

    results.forEach((r) => {
      const status = r.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${r.name}`);

      if (r.result) {
        console.log(
          `   Exitosos: ${r.result.success}, Fallidos: ${r.result.failed}, Total: ${r.result.total}`,
        );
        totalSuccess += r.result.success;
        totalFailed += r.result.failed;
        totalRecords += r.result.total;
      } else if (r.error) {
        console.log(`   Error: ${r.error}`);
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const successRate =
      totalRecords > 0 ? ((totalSuccess / totalRecords) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Total de registros procesados: ${totalRecords}`);
    console.log(`✅ Exitosos: ${totalSuccess} (${successRate}%)`);
    console.log(`❌ Fallidos: ${totalFailed}`);
    console.log(`⏱️  Tiempo total: ${duration}s`);
    console.log('='.repeat(50) + '\n');

    const allSuccessful = results.every((r) => r.status === 'success');

    if (allSuccessful) {
      console.log('🎉 ¡Migración completada exitosamente!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Migración completada con errores. Revisa los logs.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Error fatal en el proceso de migración:');
    console.error(error);
    process.exit(1);
  } finally {
    // Cerrar conexiones
    await closeConnections();
  }
}

// Ejecutar migración
main().catch((error) => {
  console.error('Error no manejado:', error);
  process.exit(1);
});
