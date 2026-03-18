import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  option_values: any;
  price: number;
  compare_at_price: number | null;
  cost: number | null;
  stock: number | null;
  min_stock: number | null;
  weight: number | null;
  dimensions: any;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function migrateProductVariants() {
  const logger = new MigrationLogger('product_variants');

  try {
    logger.log('========== Iniciando migración: product_variants ==========');

    // 1. Verificar si la tabla existe en Supabase
    logger.log('🔍 Verificando existencia de tabla en Supabase...');
    const tableCheck = await supabaseConnection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'product_variants'
      ) as exists
    `);

    if (!tableCheck[0]?.exists) {
      logger.log('⚠️  ADVERTENCIA: La tabla product_variants no existe en Supabase. Saltando migración...');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Contar variantes en Supabase
    logger.log('📊 Contando variantes en Supabase...');
    const countResult = await supabaseConnection.query(
      'SELECT COUNT(*) FROM public.product_variants',
    );
    const total = parseInt(countResult[0].count);
    logger.log(`📊 Total de variantes a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('✅ No hay variantes para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 3. Leer variantes de Supabase
    logger.log('📖 Leyendo variantes de Supabase...');
    const variants: ProductVariant[] = await supabaseConnection.query(`
      SELECT
        id,
        product_id,
        sku,
        option_values,
        price,
        compare_at_price,
        cost,
        stock,
        min_stock,
        weight,
        dimensions,
        status,
        created_at,
        updated_at
      FROM public.product_variants
      ORDER BY created_at ASC
    `);
    logger.log(`✅ Variantes leídas: ${variants.length}\n`);

    // 4. Migrar a producción
    logger.log('💾 Migrando variantes a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, variant] of variants.entries()) {
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
              logger.log(`⚠️  ${variant.sku || variant.id} - ${columnName}: JSON inválido, usando null`);
              return null;
            }
          }

          // Si ya es un objeto, stringificarlo
          try {
            return JSON.stringify(value);
          } catch (e) {
            logger.log(`⚠️  ${variant.sku || variant.id} - ${columnName}: Objeto no serializable, usando null`);
            return null;
          }
        };

        const optionValues = sanitizeJson(variant.option_values, 'option_values');
        const dimensions = sanitizeJson(variant.dimensions, 'dimensions');

        // Validar que el producto existe en producción
        const productCheck = await productionConnection.query(
          `SELECT id FROM shop.products WHERE id = $1`,
          [variant.product_id],
        );

        if (productCheck.length === 0) {
          logger.log(`⚠️  Producto ${variant.product_id} no existe para variante ${variant.sku}. Saltando...`);
          failed++;
          progress.update(index + 1);
          continue;
        }

        // Insertar en producción con ON CONFLICT para actualizar si ya existe
        await productionConnection.query(
          `
          INSERT INTO public.product_variants (
            id,
            product_id,
            sku,
            option_values,
            price,
            compare_at_price,
            cost,
            stock,
            min_stock,
            weight,
            dimensions,
            status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            product_id = EXCLUDED.product_id,
            sku = EXCLUDED.sku,
            option_values = EXCLUDED.option_values,
            price = EXCLUDED.price,
            compare_at_price = EXCLUDED.compare_at_price,
            cost = EXCLUDED.cost,
            stock = EXCLUDED.stock,
            min_stock = EXCLUDED.min_stock,
            weight = EXCLUDED.weight,
            dimensions = EXCLUDED.dimensions,
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
        `,
          [
            variant.id,
            variant.product_id,
            variant.sku,
            optionValues,
            variant.price,
            variant.compare_at_price,
            variant.cost,
            variant.stock ?? 0,
            variant.min_stock ?? 5,
            variant.weight,
            dimensions,
            variant.status || 'active',
            variant.created_at,
            variant.updated_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando variante ${variant.sku || variant.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    logger.log(`\n✅ Migración completada: ${success} exitosos, ${failed} fallidos`);
    return { success, failed, total };
  } catch (error) {
    logger.error('Error en la migración de product_variants', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateProductVariants();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
