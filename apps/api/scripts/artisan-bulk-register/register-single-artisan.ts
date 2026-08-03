/**
 * Script de Prueba: Registro de UN Solo Artesano
 *
 * Este script registra un artesano de prueba para validar el flujo completo:
 * 1. Crear usuario en auth.users
 * 2. Crear perfil en artesanos.user_profile (artisan_profile)
 * 3. Clonar artisans_identity_profile del registro de referencia
 * 4. Crear tienda en shop.artisan_shops
 *
 * Artesano de prueba: Angela Ivonne Velasquez
 */

import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

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
const ID_TYPE_CC = '79c8d5f9-6217-444d-8dfd-39d0ea55407d'; // Se consultará el UUID

interface ArtisanData {
  email: string;
  firstName: string;
  lastName: string;
  shopName: string;
  phone: string;
}

// Artesano de prueba
const TEST_ARTISAN: ArtisanData = {
  email: 'montalvotalaiguaarelys@gmail.com',
  firstName: 'Arelys',
  lastName: 'Montalvo',
  shopName: 'Taller de tejeduría en caña flecha',
  phone: '+573024846623',
};

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
  logging: true,
  ssl: { rejectUnauthorized: false },
});

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Genera un string aleatorio para el slug
 */
function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getRequiredIds(queryRunner: QueryRunner) {
  console.log('📋 Obteniendo ID del tipo de documento CC...');

  return {
    idTypeId: 'cc',
    agreementId: AGREEMENT_ID,
    countryId: COUNTRY_ID,
  };
}

async function getReferenceProfileData(queryRunner: QueryRunner) {
  console.log('📋 Obteniendo datos del perfil de referencia...');

  // Obtener el perfil principal
  const profile = await queryRunner.query(
    `
    SELECT * FROM artisans_knowledge.artisans_identity_profile 
    WHERE id = $1
  `,
    [REFERENCE_PROFILE_ID],
  );

  if (!profile[0]) {
    throw new Error('❌ No se encontró el perfil de referencia');
  }

  // Obtener las tablas relacionadas
  const identityOne = await queryRunner.query(
    `
    SELECT * FROM artisans_knowledge.artisans_identity_one 
    WHERE id = $1
  `,
    [profile[0].artisans_identity_id],
  );

  const commercialTwo = await queryRunner.query(
    `
    SELECT * FROM artisans_knowledge.artisans_commercial_two 
    WHERE id = $1
  `,
    [profile[0].artisans_commercial_id],
  );

  const clientMarketThree = await queryRunner.query(
    `
    SELECT * FROM artisans_knowledge.artisans_client_market_three 
    WHERE id = $1
  `,
    [profile[0].artisans_client_market_id],
  );

  const operationGrowthFour = await queryRunner.query(
    `
    SELECT * FROM artisans_knowledge.artisans_operation_growth_four 
    WHERE id = $1
  `,
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
  console.log('👤 Creando usuario en auth.users...');

  // Hash de la contraseña
  const hashedPassword =
    '$2b$10$36NIeu0ANGvicJOmVJSvKeODCuolg1c2kYc1nemIekBlCnQ/P1jta';

  const result = await queryRunner.query(
    `
    INSERT INTO auth.users (
      email,
      encrypted_password,
      phone,
      role,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, 'user', NOW(), NOW(), NOW()
    )
    RETURNING id
  `,
    [artisan.email.toLowerCase(), hashedPassword, artisan.phone],
  );

  const userId = result[0].id;
  console.log(`✅ Usuario creado con ID: ${userId}`);
  return userId;
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
  console.log('👤 Creando perfil en artesanos.artisan_profile...');

  await queryRunner.query(
    `
    INSERT INTO artesanos.artisan_profile (
      user_id,
      first_name,
      last_name,
      full_name,
      whatsapp_e164,
      id_type,
      id_number,
      department,
      city,
      dane_city,
      country_id,
      agreement_id,
      rut_pendiente,
      newsletter_opt_in,
      account_type,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, '0000000000', 'Pendiente', 'Pendiente', 11001, $7, $8, true, false, 'artisan', NOW(), NOW()
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

  console.log('✅ Perfil de usuario creado');
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
  console.log('🔄 Clonando artisans_identity_profile...');

  // 3.1 Crear Identity One
  console.log('  📝 Creando artisans_identity_one...');
  const identityOneResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_identity_one (
      name_shop,
      artisan_history,
      age_experience,
      shop_history,
      shop_description,
      shop_definition,
      shop_categories_id,
      shop_special_definition_one,
      shop_special_definition_two,
      shop_special_definition_three,
      shop_born_special_definition_one,
      shop_born_special_definition_two,
      shop_born_special_definition_three,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    )
    RETURNING id
  `,
    [
      artisan.shopName, // name_shop personalizado
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
  console.log(`  ✅ Identity One creado: ${identityOneId}`);

  // 3.2 Crear Commercial Two
  console.log('  📝 Creando artisans_commercial_two...');
  const commercialTwoResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_commercial_two (
      shop_range_payment,
      shop_knowledge_cost,
      shop_knowledge_define_cost,
      shop_knowledge_is_profitable,
      created_at,
      updated_at
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
  console.log(`  ✅ Commercial Two creado: ${commercialTwoId}`);

  // 3.3 Crear Client Market Three
  console.log('  📝 Creando artisans_client_market_three...');
  const clientMarketThreeResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_client_market_three (
      shop_knowledge_main_buyer_one,
      shop_knowledge_main_buyer_two,
      shop_knowledge_main_buyer_three,
      shop_knowledge_digital_presence,
      shop_knowledge_where_sale_one,
      shop_knowledge_where_sale_two,
      shop_knowledge_where_sale_three,
      shop_knowledge_sales_activity,
      created_at,
      updated_at
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
  console.log(`  ✅ Client Market Three creado: ${clientMarketThreeId}`);

  // 3.4 Crear Operation Growth Four
  console.log('  📝 Creando artisans_operation_growth_four...');
  const operationGrowthFourResult = await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_operation_growth_four (
      shop_knowledge_products_make_month,
      shop_knowledge_limit_today_one,
      shop_knowledge_limit_today_two,
      shop_knowledge_limit_today_three,
      shop_many_workers,
      shop_first_solving_telar,
      created_at,
      updated_at
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
  console.log(`  ✅ Operation Growth Four creado: ${operationGrowthFourId}`);

  // 3.5 Crear el perfil principal que conecta todo
  console.log('  📝 Creando artisans_identity_profile principal...');
  await queryRunner.query(
    `
    INSERT INTO artisans_knowledge.artisans_identity_profile (
      user_id,
      artisans_identity_id,
      artisans_commercial_id,
      artisans_client_market_id,
      artisans_operation_growth_id,
      created_at,
      updated_at
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

  console.log('✅ Identity Profile completo creado');
}

// ============================================================================
// PASO 4: CREAR TIENDA EN shop.artisan_shops
// ============================================================================

// ============================================================================
// PASO 4: CREAR TIENDA EN store.stores
// ============================================================================

async function createArtisanShop(
  queryRunner: QueryRunner,
  userId: string,
  artisan: ArtisanData,
): Promise<void> {
  console.log('🏪 Creando tienda en shop.artisan_shops...');

  // Generar slug base a partir del nombre de la tienda
  const shopSlugBase = artisan.shopName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/fin

  // 1. Crear tienda en shop.artisan_shops
  await queryRunner.query(
    `
    INSERT INTO shop.artisan_shops (
      user_id,
      shop_name,
      shop_slug,
      description,
      craft_type,
      contact_info,
      active,
      featured,
      servientrega_coverage,
      creation_status,
      creation_step,
      publish_status,
      marketplace_approved,
      bank_data_status,
      marketplace_approval_status,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, 'Artesanía', $5, true, false, false, 'complete', 4, 'pending_publish', false, 'not_set', 'pending', NOW(), NOW()
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

  console.log(
    `✅ Tienda en artisan_shops creada: ${artisan.shopName} (${shopSlugBase})`,
  );

  // 2. Crear tienda en store.stores con slug que incluye random string
  const randomString = Math.random().toString(36).substring(2, 8); // 6 caracteres aleatorios
  const storeSlug = `${shopSlugBase}-${randomString}`;

  await queryRunner.query(
    `
    INSERT INTO store.stores (
      user_id,
      name,
      slug,
      story,
      legacy_id,
      created_at,
      updated_at
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

  console.log(
    `✅ Tienda en store.stores creada: ${artisan.shopName} (${storeSlug})`,
  );
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function registerArtisan(artisan: ArtisanData): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(
    `🎨 REGISTRANDO ARTESANO: ${artisan.firstName} ${artisan.lastName}`,
  );
  console.log('='.repeat(70) + '\n');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Obtener IDs requeridos
    const requiredIds = await getRequiredIds(queryRunner);
    console.log('✅ IDs requeridos obtenidos\n');

    // Obtener datos del perfil de referencia
    const referenceData = await getReferenceProfileData(queryRunner);
    console.log('✅ Datos de referencia obtenidos\n');

    // Paso 1: Crear usuario
    const userId = await createUser(queryRunner, artisan, requiredIds);
    console.log('');

    // Paso 2: Crear perfil de usuario
    await createUserProfile(queryRunner, userId, artisan, requiredIds);
    console.log('');

    // Paso 3: Clonar identity profile
    await cloneIdentityProfile(queryRunner, userId, artisan, referenceData);
    console.log('');

    // Paso 4: Crear tienda
    await createArtisanShop(queryRunner, userId, artisan);
    console.log('');

    // Confirmar transacción
    await queryRunner.commitTransaction();

    console.log('='.repeat(70));
    console.log('✅ REGISTRO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(70));
    console.log(`📧 Email: ${artisan.email}`);
    console.log(`🔑 Password: ${DEFAULT_PASSWORD}`);
    console.log(`👤 User ID: ${userId}`);
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    // Rollback en caso de error
    await queryRunner.rollbackTransaction();
    console.error('\n❌ ERROR EN EL REGISTRO:');
    console.error(error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// ============================================================================
// EJECUTAR SCRIPT
// ============================================================================

async function main() {
  try {
    console.log('🚀 Iniciando script de registro de artesano...\n');
    console.log('📊 Configuración de BD:');
    console.log(`   Host: ${process.env.HOST_DB}`);
    console.log(`   Port: ${process.env.PORT_DB}`);
    console.log(`   Database: ${process.env.NAME_DB}`);
    console.log(`   User: ${process.env.USER_DB}\n`);

    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Registrar el artesano de prueba
    await registerArtisan(TEST_ARTISAN);

    // Cerrar conexión
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada\n');
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
