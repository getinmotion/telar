import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateArtisanShops() {
  const logger = new MigrationLogger('artisan-shops');

  try {
    logger.log('📊 Contando tiendas artesanas en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.artisan_shops
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de tiendas artesanas a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay tiendas artesanas para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer tiendas de Supabase
    logger.log('📖 Leyendo tiendas artesanas de Supabase...');
    const shops = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        shop_name,
        shop_slug,
        description,
        story,
        logo_url,
        banner_url,
        craft_type,
        region,
        certifications,
        contact_info,
        social_links,
        active,
        featured,
        seo_data,
        created_at,
        updated_at,
        privacy_level,
        data_classification,
        public_profile,
        creation_status,
        creation_step,
        primary_colors,
        secondary_colors,
        brand_claim,
        hero_config,
        about_content,
        contact_config,
        active_theme_id,
        publish_status,
        marketplace_approved,
        marketplace_approved_at,
        marketplace_approved_by,
        id_contraparty,
        artisan_profile,
        artisan_profile_completed,
        bank_data_status,
        marketplace_approval_status,
        department,
        municipality
      FROM public.artisan_shops
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Tiendas leídas: ${shops.length}\n`);

    // 3. Migrar tiendas
    logger.log('💾 Migrando tiendas artesanas a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, shop] of shops.entries()) {
      try {
        // Mapear bank_data_status: 'pending' | 'approved' → 'complete'
        let bankDataStatus = shop.bank_data_status || 'not_set';
        if (bankDataStatus === 'pending' || bankDataStatus === 'approved') {
          bankDataStatus = 'complete';
        }

        // servientrega_coverage no existe en Supabase, default a false
        const servientregaCoverage = false;

        // Sanitizar campos JSONB: convertir '' o valores inválidos a null
        // IMPORTANTE: Devolver JSON STRING, no objeto, para compatibilidad con TypeORM raw queries
        const sanitizeJson = (value: any, columnName: string): string | null => {
          // Si es null, undefined o string vacío → null
          if (value === null || value === undefined || value === '') {
            return null;
          }

          // Si es un string, validar que es JSON válido y devolverlo como string
          if (typeof value === 'string') {
            try {
              // Parsear para validar que es JSON válido
              const parsed = JSON.parse(value);
              // Volver a stringificar para normalizar el formato
              return JSON.stringify(parsed);
            } catch (e) {
              logger.log(`⚠️  ${shop.shop_name} - ${columnName}: JSON inválido, usando null`);
              return null;
            }
          }

          // Si ya es un objeto, stringificarlo
          try {
            return JSON.stringify(value);
          } catch (e) {
            logger.log(`⚠️  ${shop.shop_name} - ${columnName}: Objeto no serializable, usando null`);
            return null;
          }
        };

        // Función para transformar URLs de Supabase a paths relativos de S3
        const transformSupabaseUrlToS3Path = (url: string | null): string | null => {
          if (!url || url.trim() === '') return null;
          if (!url.includes('ylooqmqmoufqtxvetxuj.supabase.co')) {
            logger.log(`⚠️  ${shop.shop_name} - URL externa detectada: ${url}`);
            return url; // Mantener URLs externas sin cambios
          }
          try {
            const match = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
            if (!match) {
              logger.log(`⚠️  ${shop.shop_name} - Formato de URL Supabase inválido: ${url}`);
              return null;
            }
            return `/${match[1]}`;
          } catch (error) {
            logger.log(`❌ ${shop.shop_name} - Error transformando URL: ${url}`);
            return null;
          }
        };

        // Función para transformar JSONB con imágenes anidadas
        const transformNestedImages = (jsonbString: string | null): string | null => {
          if (!jsonbString) return null;
          try {
            const parsed = JSON.parse(jsonbString);

            // Transform hero_config.slides[].imageUrl (not 'image')
            if (parsed.slides && Array.isArray(parsed.slides)) {
              parsed.slides = parsed.slides.map((slide: any) => ({
                ...slide,
                imageUrl: transformSupabaseUrlToS3Path(slide.imageUrl),
              }));
            }

            // Transform artisan_profile single image
            if (parsed.artisanPhoto) {
              parsed.artisanPhoto = transformSupabaseUrlToS3Path(parsed.artisanPhoto);
            }

            // Transform artisan_profile image arrays
            if (parsed.familyPhotos && Array.isArray(parsed.familyPhotos)) {
              parsed.familyPhotos = parsed.familyPhotos.map(transformSupabaseUrlToS3Path);
            }
            if (parsed.workingPhotos && Array.isArray(parsed.workingPhotos)) {
              parsed.workingPhotos = parsed.workingPhotos.map(transformSupabaseUrlToS3Path);
            }
            if (parsed.workshopPhotos && Array.isArray(parsed.workshopPhotos)) {
              parsed.workshopPhotos = parsed.workshopPhotos.map(transformSupabaseUrlToS3Path);
            }
            if (parsed.communityPhotos && Array.isArray(parsed.communityPhotos)) {
              parsed.communityPhotos = parsed.communityPhotos.map(transformSupabaseUrlToS3Path);
            }

            return JSON.stringify(parsed);
          } catch {
            return jsonbString; // Mantener original si hay error
          }
        };

        const certifications = sanitizeJson(shop.certifications, 'certifications');
        const contactInfo = sanitizeJson(shop.contact_info, 'contact_info');
        const socialLinks = sanitizeJson(shop.social_links, 'social_links');
        const seoData = sanitizeJson(shop.seo_data, 'seo_data');
        const dataClassification = sanitizeJson(shop.data_classification, 'data_classification');
        const publicProfile = sanitizeJson(shop.public_profile, 'public_profile');
        const primaryColors = sanitizeJson(shop.primary_colors, 'primary_colors');
        const secondaryColors = sanitizeJson(shop.secondary_colors, 'secondary_colors');
        const heroConfig = transformNestedImages(sanitizeJson(shop.hero_config, 'hero_config'));
        const aboutContent = sanitizeJson(shop.about_content, 'about_content');
        const contactConfig = sanitizeJson(shop.contact_config, 'contact_config');
        const artisanProfile = transformNestedImages(sanitizeJson(shop.artisan_profile, 'artisan_profile'));

        // Transformar URLs de logo y banner
        const logoPath = transformSupabaseUrlToS3Path(shop.logo_url);
        const bannerPath = transformSupabaseUrlToS3Path(shop.banner_url);

        // Insertar en producción (schema shop)
        await productionConnection.query(
          `
          INSERT INTO shop.artisan_shops (
            id,
            user_id,
            shop_name,
            shop_slug,
            description,
            story,
            logo_url,
            banner_url,
            craft_type,
            region,
            certifications,
            contact_info,
            social_links,
            active,
            featured,
            seo_data,
            created_at,
            updated_at,
            privacy_level,
            data_classification,
            public_profile,
            creation_status,
            creation_step,
            primary_colors,
            secondary_colors,
            brand_claim,
            hero_config,
            about_content,
            contact_config,
            active_theme_id,
            publish_status,
            marketplace_approved,
            marketplace_approved_at,
            marketplace_approved_by,
            id_contraparty,
            artisan_profile,
            artisan_profile_completed,
            bank_data_status,
            marketplace_approval_status,
            department,
            municipality,
            servientrega_coverage
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
            $41, $42
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            shop_name = EXCLUDED.shop_name,
            shop_slug = EXCLUDED.shop_slug,
            description = EXCLUDED.description,
            story = EXCLUDED.story,
            logo_url = EXCLUDED.logo_url,
            banner_url = EXCLUDED.banner_url,
            craft_type = EXCLUDED.craft_type,
            region = EXCLUDED.region,
            certifications = EXCLUDED.certifications,
            contact_info = EXCLUDED.contact_info,
            social_links = EXCLUDED.social_links,
            active = EXCLUDED.active,
            featured = EXCLUDED.featured,
            seo_data = EXCLUDED.seo_data,
            updated_at = EXCLUDED.updated_at,
            privacy_level = EXCLUDED.privacy_level,
            data_classification = EXCLUDED.data_classification,
            public_profile = EXCLUDED.public_profile,
            creation_status = EXCLUDED.creation_status,
            creation_step = EXCLUDED.creation_step,
            primary_colors = EXCLUDED.primary_colors,
            secondary_colors = EXCLUDED.secondary_colors,
            brand_claim = EXCLUDED.brand_claim,
            hero_config = EXCLUDED.hero_config,
            about_content = EXCLUDED.about_content,
            contact_config = EXCLUDED.contact_config,
            active_theme_id = EXCLUDED.active_theme_id,
            publish_status = EXCLUDED.publish_status,
            marketplace_approved = EXCLUDED.marketplace_approved,
            marketplace_approved_at = EXCLUDED.marketplace_approved_at,
            marketplace_approved_by = EXCLUDED.marketplace_approved_by,
            id_contraparty = EXCLUDED.id_contraparty,
            artisan_profile = EXCLUDED.artisan_profile,
            artisan_profile_completed = EXCLUDED.artisan_profile_completed,
            bank_data_status = EXCLUDED.bank_data_status,
            marketplace_approval_status = EXCLUDED.marketplace_approval_status,
            department = EXCLUDED.department,
            municipality = EXCLUDED.municipality,
            servientrega_coverage = EXCLUDED.servientrega_coverage
        `,
          [
            shop.id,
            shop.user_id,
            shop.shop_name,
            shop.shop_slug,
            shop.description,
            shop.story,
            logoPath, // Transformado a path relativo S3
            bannerPath, // Transformado a path relativo S3
            shop.craft_type,
            shop.region,
            certifications, // Sanitizado
            contactInfo, // Sanitizado
            socialLinks, // Sanitizado
            shop.active,
            shop.featured,
            seoData, // Sanitizado
            shop.created_at,
            shop.updated_at,
            shop.privacy_level,
            dataClassification, // Sanitizado
            publicProfile, // Sanitizado
            shop.creation_status,
            shop.creation_step,
            primaryColors, // Sanitizado
            secondaryColors, // Sanitizado
            shop.brand_claim,
            heroConfig, // Sanitizado
            aboutContent, // Sanitizado
            contactConfig, // Sanitizado
            shop.active_theme_id,
            shop.publish_status,
            shop.marketplace_approved,
            shop.marketplace_approved_at,
            shop.marketplace_approved_by,
            shop.id_contraparty,
            artisanProfile, // Sanitizado
            shop.artisan_profile_completed,
            bankDataStatus, // Valor mapeado
            shop.marketplace_approval_status,
            shop.department,
            shop.municipality,
            servientregaCoverage, // Nuevo campo
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando tienda ${shop.shop_name || shop.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de tiendas artesanas', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateArtisanShops();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
