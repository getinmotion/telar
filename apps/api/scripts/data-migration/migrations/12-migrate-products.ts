import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  images: any;
  category: string | null;
  subcategory: string | null;
  tags: any;
  inventory: number | null;
  sku: string | null;
  weight: number | null;
  dimensions: any;
  materials: any;
  techniques: any;
  production_time: string | null;
  customizable: boolean | null;
  active: boolean;
  featured: boolean;
  seo_data: any;
  created_at: Date;
  updated_at: Date;
  category_id: string | null;
  made_to_order: boolean | null;
  lead_time_days: number | null;
  production_time_hours: number | null;
  requires_customization: boolean | null;
  marketplace_links: any;
  embedding: string | null;
  moderation_status: string | null;
  shipping_data_complete: boolean | null;
  ready_for_checkout: boolean | null;
  allows_local_pickup: boolean | null;
}

export async function migrateProducts() {
  const logger = new MigrationLogger('products');

  try {
    logger.log('========== Iniciando migración: products ==========');

    // 1. Contar productos en Supabase
    logger.log('📊 Contando productos en Supabase...');
    const countResult = await supabaseConnection.query(
      'SELECT COUNT(*) FROM public.products',
    );
    const total = parseInt(countResult[0].count);
    logger.log(`📊 Total de productos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('✅ No hay productos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer productos de Supabase
    logger.log('📖 Leyendo productos de Supabase...');
    const products: Product[] = await supabaseConnection.query(`
      SELECT
        id,
        shop_id,
        name,
        description,
        short_description,
        price,
        compare_price,
        images,
        category,
        subcategory,
        tags,
        inventory,
        sku,
        weight,
        dimensions,
        materials,
        techniques,
        production_time,
        customizable,
        active,
        featured,
        seo_data,
        created_at,
        updated_at,
        category_id,
        made_to_order,
        lead_time_days,
        production_time_hours,
        requires_customization,
        marketplace_links,
        embedding,
        moderation_status,
        shipping_data_complete,
        ready_for_checkout,
        allows_local_pickup
      FROM public.products
      ORDER BY created_at ASC
    `);
    logger.log(`✅ Productos leídos: ${products.length}\n`);

    // 3. Migrar a producción
    logger.log('💾 Migrando productos a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, product] of products.entries()) {
      try {
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
              logger.log(`⚠️  ${product.name || product.id} - ${columnName}: JSON inválido, usando null`);
              return null;
            }
          }

          // Si ya es un objeto, stringificarlo
          try {
            return JSON.stringify(value);
          } catch (e) {
            logger.log(`⚠️  ${product.name || product.id} - ${columnName}: Objeto no serializable, usando null`);
            return null;
          }
        };

        // Función para transformar URLs de Supabase a paths relativos de S3
        const transformSupabaseUrlToS3Path = (url: string | null): string | null => {
          if (!url || url.trim() === '') return null;
          if (!url.includes('ylooqmqmoufqtxvetxuj.supabase.co')) {
            return url; // Mantener URLs externas sin cambios
          }
          try {
            const match = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
            if (!match) return null;
            return `/${match[1]}`;
          } catch {
            return null;
          }
        };

        // Función para transformar array de imágenes
        const transformImageArray = (jsonbString: string | null): string | null => {
          if (!jsonbString) return null;
          try {
            const parsed = JSON.parse(jsonbString);
            if (!Array.isArray(parsed)) return jsonbString;
            const transformed = parsed.map(transformSupabaseUrlToS3Path);
            return JSON.stringify(transformed);
          } catch {
            return jsonbString;
          }
        };

        const images = transformImageArray(sanitizeJson(product.images, 'images'));
        const tags = sanitizeJson(product.tags, 'tags');
        const dimensions = sanitizeJson(product.dimensions, 'dimensions');
        const materials = sanitizeJson(product.materials, 'materials');
        const techniques = sanitizeJson(product.techniques, 'techniques');
        const seoData = sanitizeJson(product.seo_data, 'seo_data');
        const marketplaceLinks = sanitizeJson(product.marketplace_links, 'marketplace_links');

        // Insertar en producción (schema shop)
        await productionConnection.query(
          `
          INSERT INTO shop.products (
            id,
            shop_id,
            name,
            description,
            short_description,
            price,
            compare_price,
            images,
            category,
            subcategory,
            tags,
            inventory,
            sku,
            weight,
            dimensions,
            materials,
            techniques,
            production_time,
            customizable,
            active,
            featured,
            seo_data,
            created_at,
            updated_at,
            category_id,
            made_to_order,
            lead_time_days,
            production_time_hours,
            requires_customization,
            marketplace_links,
            embedding,
            moderation_status,
            shipping_data_complete,
            ready_for_checkout,
            allows_local_pickup
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35
          )
          ON CONFLICT (id) DO UPDATE SET
            shop_id = EXCLUDED.shop_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            short_description = EXCLUDED.short_description,
            price = EXCLUDED.price,
            compare_price = EXCLUDED.compare_price,
            images = EXCLUDED.images,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            tags = EXCLUDED.tags,
            inventory = EXCLUDED.inventory,
            sku = EXCLUDED.sku,
            weight = EXCLUDED.weight,
            dimensions = EXCLUDED.dimensions,
            materials = EXCLUDED.materials,
            techniques = EXCLUDED.techniques,
            production_time = EXCLUDED.production_time,
            customizable = EXCLUDED.customizable,
            active = EXCLUDED.active,
            featured = EXCLUDED.featured,
            seo_data = EXCLUDED.seo_data,
            updated_at = EXCLUDED.updated_at,
            category_id = EXCLUDED.category_id,
            made_to_order = EXCLUDED.made_to_order,
            lead_time_days = EXCLUDED.lead_time_days,
            production_time_hours = EXCLUDED.production_time_hours,
            requires_customization = EXCLUDED.requires_customization,
            marketplace_links = EXCLUDED.marketplace_links,
            embedding = EXCLUDED.embedding,
            moderation_status = EXCLUDED.moderation_status,
            shipping_data_complete = EXCLUDED.shipping_data_complete,
            ready_for_checkout = EXCLUDED.ready_for_checkout,
            allows_local_pickup = EXCLUDED.allows_local_pickup
        `,
          [
            product.id,
            product.shop_id,
            product.name,
            product.description,
            product.short_description,
            product.price,
            product.compare_price,
            images, // Sanitizado
            product.category,
            product.subcategory,
            tags, // Sanitizado
            product.inventory,
            product.sku,
            product.weight,
            dimensions, // Sanitizado
            materials, // Sanitizado
            techniques, // Sanitizado
            product.production_time,
            product.customizable,
            product.active,
            product.featured,
            seoData, // Sanitizado
            product.created_at,
            product.updated_at,
            product.category_id,
            product.made_to_order,
            product.lead_time_days,
            product.production_time_hours,
            product.requires_customization,
            marketplaceLinks, // Sanitizado
            product.embedding,
            product.moderation_status,
            product.shipping_data_complete,
            product.ready_for_checkout,
            product.allows_local_pickup,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando producto ${product.name || product.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    logger.log(`\n✅ Migración completada: ${success} exitosos, ${failed} fallidos`);
    return { success, failed, total };
  } catch (error) {
    logger.error('Error en la migración de productos', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateProducts();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
