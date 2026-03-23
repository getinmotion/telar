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
import { migrateProductModerationHistory } from './migrations/14-migrate-product-moderation-history';
import { migrateProductVariants } from './migrations/15-migrate-product-variants';
import { migrateInventoryMovements} from './migrations/16-migrate-inventory-movements';
import { migrateCategoryAttributeSets } from './migrations/17-migrate-category-attribute-sets';
import { migrateProductArtisanalIdentity } from './migrations/18-migrate-product-artisanal-identity';
import { migrateProductAttributeValues } from './migrations/19-migrate-product-attribute-values';
import { migrateProductBadges } from './migrations/20-migrate-product-badges';
import { migrateProductCareTags } from './migrations/21-migrate-product-care-tags';
import { migrateProductLogistics } from './migrations/22-migrate-product-logistics';
import { migrateProductMaterialsLink } from './migrations/23-migrate-product-materials-link';
import { migrateProductMedia } from './migrations/24-migrate-product-media';
import { migrateProductPhysicalSpecs } from './migrations/25-migrate-product-physical-specs';
import { migrateProductProduction } from './migrations/26-migrate-product-production';
import { migrateProductsCore } from './migrations/27-migrate-products-core';

interface MigrationResult {
  name: string;
  success: number;
  failed: number;
  total: number;
  duration: number;
}

const CONTINUE_ON_ERROR = process.env.CONTINUE_ON_ERROR === 'true';

async function runAllMigrations() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  🚀 MIGRACIÓN DE DATOS: PRODUCCIÓN → LOCAL');
  console.log('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();
  const results: MigrationResult[] = [];

  try {
    // Inicializar conexiones
    await initConnections();

    // Definir migraciones en orden (respetar dependencias)
    const migrations = [
      { name: '01-users', fn: migrateUsers },
      { name: '02-user-profiles', fn: migrateUserProfiles },
      { name: '03-user-progress', fn: migrateUserProgress },
      { name: '04-agent-tasks', fn: migrateAgentTasks },
      { name: '05-email-verifications', fn: migrateEmailVerifications },
      { name: '06-master-coordinator-context', fn: migrateMasterCoordinatorContext },
      { name: '07-user-achievements', fn: migrateUserAchievements },
      { name: '08-user-master-context', fn: migrateUserMasterContext },
      { name: '09-user-maturity-scores', fn: migrateUserMaturityScores },
      { name: '10-artisan-shops', fn: migrateArtisanShops },
      { name: '11-product-categories', fn: migrateProductCategories },
      { name: '12-products', fn: migrateProducts },
      { name: '13-user-roles', fn: migrateUserRoles },
      { name: '14-product-moderation-history', fn: migrateProductModerationHistory },
      { name: '15-product-variants', fn: migrateProductVariants },
      { name: '16-inventory-movements', fn: migrateInventoryMovements },
      { name: '17-category-attribute-sets', fn: migrateCategoryAttributeSets },
      { name: '18-product-artisanal-identity', fn: migrateProductArtisanalIdentity },
      { name: '19-product-attribute-values', fn: migrateProductAttributeValues },
      { name: '20-product-badges', fn: migrateProductBadges },
      { name: '21-product-care-tags', fn: migrateProductCareTags },
      { name: '22-product-logistics', fn: migrateProductLogistics },
      { name: '23-product-materials-link', fn: migrateProductMaterialsLink },
      { name: '24-product-media', fn: migrateProductMedia },
      { name: '25-product-physical-specs', fn: migrateProductPhysicalSpecs },
      { name: '26-product-production', fn: migrateProductProduction },
      { name: '27-products-core', fn: migrateProductsCore },
    ];

    // Ejecutar cada migración
    for (const migration of migrations) {
      console.log(`\n────────────────────────────────────────────────────────────`);
      console.log(`📦 Ejecutando: ${migration.name}`);
      console.log(`────────────────────────────────────────────────────────────\n`);

      const migrationStart = Date.now();

      try {
        const result = await migration.fn();
        const duration = Date.now() - migrationStart;

        results.push({
          name: migration.name,
          success: result.success,
          failed: result.failed,
          total: result.total,
          duration,
        });

        console.log(`\n✅ ${migration.name} completada en ${(duration / 1000).toFixed(2)}s`);
      } catch (error: any) {
        const duration = Date.now() - migrationStart;
        console.error(`\n❌ ${migration.name} falló: ${error.message}`);

        results.push({
          name: migration.name,
          success: 0,
          failed: 0,
          total: 0,
          duration,
        });

        if (!CONTINUE_ON_ERROR) {
          console.error('\n⛔ Deteniendo migraciones (CONTINUE_ON_ERROR=false)');
          break;
        }
      }
    }

    // Cerrar conexiones
    await closeConnections();

    // Mostrar resumen
    const totalDuration = Date.now() - startTime;
    printSummary(results, totalDuration);

    // Determinar exit code
    const hasFailures = results.some(r => r.failed > 0);
    process.exit(hasFailures ? 1 : 0);
  } catch (error: any) {
    console.error('\n❌ Error fatal:', error.message);
    await closeConnections();
    process.exit(1);
  }
}

function printSummary(results: MigrationResult[], totalDuration: number) {
  console.log('\n\n════════════════════════════════════════════════════════════');
  console.log('  📊 RESUMEN DE MIGRACIÓN');
  console.log('════════════════════════════════════════════════════════════\n');

  console.table(
    results.map((r) => ({
      Migración: r.name,
      Total: r.total,
      Exitosos: r.success,
      Fallidos: r.failed,
      'Duración (s)': (r.duration / 1000).toFixed(2),
    }))
  );

  const totalSuccess = results.reduce((acc, r) => acc + r.success, 0);
  const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);
  const totalRecords = results.reduce((acc, r) => acc + r.total, 0);

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`Total de registros: ${totalRecords}`);
  console.log(`Exitosos: ${totalSuccess} (${((totalSuccess / totalRecords) * 100).toFixed(1)}%)`);
  console.log(`Fallidos: ${totalFailed} (${((totalFailed / totalRecords) * 100).toFixed(1)}%)`);
  console.log(`Duración total: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('════════════════════════════════════════════════════════════\n');
}

// Ejecutar
runAllMigrations();
