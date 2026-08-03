/**
 * Script de Registro Masivo: Todos los Artesanos
 *
 * Este script registra todos los artesanos del archivo artisans-data.ts
 *
 * Flujo por cada artesano:
 * 1. Crear usuario en auth.users
 * 2. Crear perfil en artesanos.artisan_profile
 * 3. Clonar artisans_identity_profile del registro de referencia
 * 4. Crear tienda en shop.artisan_shops
 * 5. Crear store en store.stores
 *
 * Total: 15 artesanos
 */

import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ARTISANS, ArtisanData } from './artisans-data';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const REFERENCE_PROFILE_ID = '620fd05f-7dc9-4ebe-b3e5-8283e5d7f96a';
const DEFAULT_PASSWORD = 'Telar123!';

// IDs fijos para todos los artesanos
const AGREEMENT_ID = 'b7a6d812-5dd7-4d7b-bec4-687d65234f4f';
const COUNTRY_ID = '07e824e4-03fc-4c0f-aa69-954df424b0aa';

// ============================================================================
// CONEXIÓN A BASE DE DATOS
// ============================================================================

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST_DB || 'localhost',
  port: parseInt(process.env.PORT_DB || '5432'),
  username: process.env.USER_DB || 'admin',
  password: process.env.PASS_DB || 'admin',
  database: process.env.NAME_DB || 'telar_1707_1',
  synchronize: false,
  logging: false, // Desactivar logging para no saturar la consola
  ssl: { rejectUnauthorized: false },
});

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

async function getRequiredIds(queryRunner: QueryRunner) {
  return {
    idTypeId: 'cc',
    agreementId: AGREEMENT_ID,
    countryId: COUNTRY_ID,
  };
}

async function getReferenceProfileData(queryRunner: QueryRunner) {
  const profile = await queryRunner.query(
    `SELECT * FROM artisans_knowledge.artisans_identity_profile WHERE id = $1`,
    [REFERENCE_PROFILE_ID],
  );

  if (!profile[0]) {
    throw new Error('❌ No se encontró el perfil de referencia');
  }

  const identityOne = await queryRunner.query(
    `SELECT * FROM artisans_knowledge.artisans_identity_one WHERE id = $1`,
    [profile[0].artisans_identity_id],
  );

  const commercialTwo = await queryRunner.query(
    `SELECT * FROM artisans_knowledge.artisans_commercial_two WHERE id = $1`,
    [profile[0].artisans_commercial_id],
  );

  const clientMarketThree = await queryRunner.query(
    `SELECT * FROM artisans_knowledge.artisans_client_market_three WHERE id = $1`,
    [profile[0].artisans_client_market_id],
  );

  const operationGrowthFour = await queryRunner.query(
    `SELECT * FROM artisans_knowledge.artisans_operation_growth_four WHERE id = $1`,
    [profile[0].artisans_operation_growth_id],
  );

  return {
    profile: profile[0],
    identityOne: identityOne[0],
    commercialTwo: commercialTwo[0],
    clientMarketThree: clientMarketThree[0],
    operationGrowthFour: operationGrowthFour[0],
  };
}

// ============================================================================
// PASO 1: CREAR USUARIO EN auth.users
// ============================================================================

async function createUser(
  queryRunner: QueryRunner,
  artisan: ArtisanData,
  requiredIds: any,
): Promise<string> {
  const hashedPassword =
    '$2b$10$36NIeu0ANGvicJOmVJSvKeODCuolg1c2kYc1nemIekBlCnQ/P1jta';

  const result = await queryRunner.query(
    `
    INSERT INTO auth.users (
      email, encrypted_password, phone, role, 
      email_confirmed_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, 'user', NOW(), NOW(), NOW()
    )
    RETURNING id
  `,
    [artisan.email.toLowerCase(), hashedPassword, artisan.phone],
  );

  return result[0].id;
}

// ============================================================================
// PASO 2: CREAR PERFIL EN artesanos.artisan_profile
// ============================================================================

async function createUserProfile(
  queryRunner: QueryRunner,
  userId: string,
  artisan: ArtisanData,
  requiredIds: any,
): Promise<void> {
  await queryRunner.query(
    `
    INSERT INTO artesanos.artisan_profile (
      user_id, first_name, last_name, full_name, whatsapp_e164,
      id_type, id_number, department, city, dane_city,
      country_id, agreement_id, rut_pendiente, newsletter_opt_in,
      account_type, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, '0000000000', 'Pendiente', 'Pendiente', 
      11001, $7, $8, true, false, 'artisan', NOW(), NOW()
    )
  `,
    [
      userId,
      artisan.firstName,
      artisan.lastName,
      `${artisan.firstName} ${artisan.lastName}`,
      artisan.phone,
      requiredIds.idTypeId,
      requiredIds.countryId,
      requiredIds.agreementId,
    ],
  );
}

// ============================================================================
// PASO 3: CLONAR artisans_identity_profile
// ============================================================================

async function cloneIdentityProfile(
  queryRunner: QueryRunner,
  userId: string,
  artisan: ArtisanData,
  referenceData: any,
): Promise<void> {
  // 3.1 Crear Identity One
  const identityOneResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_identity_one (
      name_shop, artisan_history, age_experience, shop_history,
      shop_description, shop_definition, shop_categories_id,
      shop_special_definition_one, shop_special_definition_two,
      shop_special_definition_three, shop_born_special_definition_one,
      shop_born_special_definition_two, shop_born_special_definition_three,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    )
    RETURNING id
  `,
    [
      artisan.shopName,
      referenceData.identityOne.artisan_history,
      referenceData.identityOne.age_experience,
      referenceData.identityOne.shop_history,
      referenceData.identityOne.shop_description,
      referenceData.identityOne.shop_definition,
      referenceData.identityOne.shop_categories_id,
      referenceData.identityOne.shop_special_definition_one,
      referenceData.identityOne.shop_special_definition_two,
      referenceData.identityOne.shop_special_definition_three,
      referenceData.identityOne.shop_born_special_definition_one,
      referenceData.identityOne.shop_born_special_definition_two,
      referenceData.identityOne.shop_born_special_definition_three,
    ],
  );
  const identityOneId = identityOneResult[0].id;

  // 3.2 Crear Commercial Two
  const commercialTwoResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_commercial_two (
      shop_range_payment, shop_knowledge_cost, shop_knowledge_define_cost,
      shop_knowledge_is_profitable, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, NOW(), NOW()
    )
    RETURNING id
  `,
    [
      referenceData.commercialTwo.shop_range_payment,
      referenceData.commercialTwo.shop_knowledge_cost,
      referenceData.commercialTwo.shop_knowledge_define_cost,
      referenceData.commercialTwo.shop_knowledge_is_profitable,
    ],
  );
  const commercialTwoId = commercialTwoResult[0].id;

  // 3.3 Crear Client Market Three
  const clientMarketThreeResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_client_market_three (
      shop_knowledge_main_buyer_one, shop_knowledge_main_buyer_two,
      shop_knowledge_main_buyer_three, shop_knowledge_digital_presence,
      shop_knowledge_where_sale_one, shop_knowledge_where_sale_two,
      shop_knowledge_where_sale_three, shop_knowledge_sales_activity,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
    )
    RETURNING id
  `,
    [
      referenceData.clientMarketThree.shop_knowledge_main_buyer_one,
      referenceData.clientMarketThree.shop_knowledge_main_buyer_two,
      referenceData.clientMarketThree.shop_knowledge_main_buyer_three,
      referenceData.clientMarketThree.shop_knowledge_digital_presence,
      referenceData.clientMarketThree.shop_knowledge_where_sale_one,
      referenceData.clientMarketThree.shop_knowledge_where_sale_two,
      referenceData.clientMarketThree.shop_knowledge_where_sale_three,
      referenceData.clientMarketThree.shop_knowledge_sales_activity,
    ],
  );
  const clientMarketThreeId = clientMarketThreeResult[0].id;

  // 3.4 Crear Operation Growth Four
  const operationGrowthFourResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_operation_growth_four (
      shop_knowledge_products_make_month, shop_knowledge_limit_today_one,
      shop_knowledge_limit_today_two, shop_knowledge_limit_today_three,
      shop_many_workers, shop_first_solving_telar, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, NOW(), NOW()
    )
    RETURNING id
  `,
    [
      referenceData.operationGrowthFour.shop_knowledge_products_make_month,
      referenceData.operationGrowthFour.shop_knowledge_limit_today_one,
      referenceData.operationGrowthFour.shop_knowledge_limit_today_two,
      referenceData.operationGrowthFour.shop_knowledge_limit_today_three,
      referenceData.operationGrowthFour.shop_many_workers,
      referenceData.operationGrowthFour.shop_first_solving_telar,
    ],
  );
  const operationGrowthFourId = operationGrowthFourResult[0].id;

  // 3.5 Crear el perfil principal
  await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_identity_profile (
      user_id, artisans_identity_id, artisans_commercial_id,
      artisans_client_market_id, artisans_operation_growth_id,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, NOW(), NOW()
    )
  `,
    [
      userId,
      identityOneId,
      commercialTwoId,
      clientMarketThreeId,
      operationGrowthFourId,
    ],
  );
}

// ============================================================================
// PASO 4 y 5: CREAR TIENDAS EN shop.artisan_shops Y store.stores
// ============================================================================

async function createArtisanShop(
  queryRunner: QueryRunner,
  userId: string,
  artisan: ArtisanData,
): Promise<void> {
  // Generar slug base
  const shopSlugBase = artisan.shopName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // 1. Crear en shop.artisan_shops
  await queryRunner.query(
    `
    INSERT INTO shop.artisan_shops (
      user_id, shop_name, shop_slug, description, craft_type, contact_info,
      active, featured, servientrega_coverage, creation_status, creation_step,
      publish_status, marketplace_approved, bank_data_status,
      marketplace_approval_status, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, 'Artesanía', $5, true, false, false, 
      'complete', 4, 'pending_publish', false, 'not_set', 'pending', NOW(), NOW()
    )
  `,
    [
      userId,
      artisan.shopName,
      shopSlugBase,
      `Tienda artesanal de ${artisan.firstName} ${artisan.lastName}`,
      JSON.stringify({
        email: artisan.email,
        phone: artisan.phone,
        whatsapp: artisan.phone,
      }),
    ],
  );

  // 2. Crear en store.stores con slug random
  const randomString = Math.random().toString(36).substring(2, 8);
  const storeSlug = `${shopSlugBase}-${randomString}`;

  await queryRunner.query(
    `
    INSERT INTO store.stores (
      user_id, name, slug, story, legacy_id, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, NULL, NOW(), NOW()
    )
  `,
    [
      userId,
      artisan.shopName,
      storeSlug,
      `Tienda artesanal de ${artisan.firstName} ${artisan.lastName}`,
    ],
  );
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function registerArtisan(
  artisan: ArtisanData,
  index: number,
  total: number,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  console.log(
    `\n[${index + 1}/${total}] 🎨 ${artisan.firstName} ${artisan.lastName} (${artisan.email})`,
  );

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const requiredIds = await getRequiredIds(queryRunner);
    const referenceData = await getReferenceProfileData(queryRunner);

    const userId = await createUser(queryRunner, artisan, requiredIds);
    await createUserProfile(queryRunner, userId, artisan, requiredIds);
    await cloneIdentityProfile(queryRunner, userId, artisan, referenceData);
    await createArtisanShop(queryRunner, userId, artisan);

    await queryRunner.commitTransaction();

    console.log(`   ✅ Registrado exitosamente (User ID: ${userId})`);
    return { success: true, userId };
  } catch (error: any) {
    await queryRunner.rollbackTransaction();

    // Verificar si es un error de duplicado
    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        console.log(`   ⚠️  Email ya existe - OMITIDO`);
        return { success: false, error: 'Email duplicado' };
      } else if (error.constraint === 'users_phone_key') {
        console.log(`   ⚠️  Teléfono ya existe - OMITIDO`);
        return { success: false, error: 'Teléfono duplicado' };
      }
    }

    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await queryRunner.release();
  }
}

// ============================================================================
// EJECUTAR SCRIPT
// ============================================================================

async function main() {
  console.log('🚀 REGISTRO MASIVO DE ARTESANOS');
  console.log('='.repeat(70));
  console.log(`📊 Total de artesanos a registrar: ${ARTISANS.length}`);
  console.log(`🔑 Contraseña para todos: ${DEFAULT_PASSWORD}`);
  console.log('='.repeat(70));

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const results = {
      total: ARTISANS.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    };

    // Registrar cada artesano
    for (let i = 0; i < ARTISANS.length; i++) {
      const result = await registerArtisan(ARTISANS[i], i, ARTISANS.length);

      if (result.success) {
        results.success++;
      } else if (result.error?.includes('duplicado')) {
        results.skipped++;
      } else {
        results.failed++;
      }

      results.details.push({
        artisan: ARTISANS[i],
        ...result,
      });
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`✅ Exitosos: ${results.success}/${results.total}`);
    console.log(
      `⚠️  Omitidos (duplicados): ${results.skipped}/${results.total}`,
    );
    console.log(`❌ Fallidos: ${results.failed}/${results.total}`);
    console.log('='.repeat(70));

    // Mostrar detalles de fallidos
    if (results.failed > 0) {
      console.log('\n❌ ARTESANOS CON ERROR:');
      results.details
        .filter((d) => !d.success && !d.error?.includes('duplicado'))
        .forEach((d) => {
          console.log(`   - ${d.artisan.email}: ${d.error}`);
        });
    }

    await AppDataSource.destroy();
    console.log('\n✅ Proceso completado\n');

    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Ejecutar
main();
