import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para transferir productos restantes de shop.products a shop.products_core
 * y todas sus tablas relacionadas (variants, media, physical_specs, production, logistics)
 */
export class MigrateRemainingProducts1774931690000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla temporal para mapear IDs viejos a nuevos
    await queryRunner.query(`
      CREATE TEMP TABLE IF NOT EXISTS new_products_map (
        id UUID,
        legacy_product_id UUID
      );
    `);

    // 1. Insertar en shop.products_core
    await queryRunner.query(`
      INSERT INTO new_products_map (id, legacy_product_id)
      SELECT
        gen_random_uuid() as id,
        p.id as legacy_product_id
      FROM shop.products p
      WHERE NOT EXISTS (
        SELECT 1 FROM shop.products_core pc
        WHERE pc.legacy_product_id = p.id
      );
    `);

    await queryRunner.query(`
      INSERT INTO shop.products_core (
        id,
        store_id,
        category_id,
        legacy_product_id,
        name,
        short_description,
        history,
        care_notes,
        status,
        created_at,
        updated_at
      )
      SELECT
        npm.id,
        p.shop_id as store_id,
        p.category_id,
        p.id as legacy_product_id,
        p.name,
        COALESCE(p.short_description, p.description, '') as short_description,
        NULL as history,
        NULL as care_notes,
        CASE
          WHEN p.moderation_status = 'approved' THEN 'approved'
          WHEN p.moderation_status = 'approved_with_edits' THEN 'approved_with_edits'
          WHEN p.moderation_status = 'pending_moderation' THEN 'pending_moderation'
          WHEN p.moderation_status = 'changes_requested' THEN 'changes_requested'
          WHEN p.moderation_status = 'rejected' THEN 'rejected'
          WHEN p.moderation_status = 'draft' THEN 'draft'
          WHEN p.active = false THEN 'rejected'
          ELSE 'draft'
        END as status,
        p.created_at,
        p.updated_at
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id;
    `);

    // 2. Insertar variantes en shop.product_variants
    await queryRunner.query(`
      INSERT INTO shop.product_variants (
        product_id,
        sku,
        stock_quantity,
        base_price_minor,
        currency,
        real_weight_kg,
        dim_height_cm,
        dim_width_cm,
        dim_length_cm,
        is_active,
        created_at
      )
      SELECT
        npm.id as product_id,
        p.sku,
        COALESCE(p.inventory, 0) as stock_quantity,
        (p.price * 100)::bigint as base_price_minor,
        'COP' as currency,
        p.weight as real_weight_kg,
        (p.dimensions->>'height')::numeric as dim_height_cm,
        (p.dimensions->>'width')::numeric as dim_width_cm,
        COALESCE((p.dimensions->>'length')::numeric, (p.dimensions->>'diameter')::numeric) as dim_length_cm,
        p.active as is_active,
        p.created_at
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id;
    `);

    // 3. Insertar media en shop.product_media
    await queryRunner.query(`
      INSERT INTO shop.product_media (
        product_id,
        media_url,
        media_type,
        is_primary,
        display_order
      )
      SELECT
        npm.id as product_id,
        image_url as media_url,
        'image' as media_type,
        (row_number() OVER (PARTITION BY npm.id ORDER BY ordinality)) = 1 as is_primary,
        row_number() OVER (PARTITION BY npm.id ORDER BY ordinality) as display_order
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id
      CROSS JOIN LATERAL jsonb_array_elements_text(p.images) WITH ORDINALITY AS t(image_url, ordinality)
      WHERE jsonb_array_length(p.images) > 0;
    `);

    // 4. Insertar especificaciones físicas en shop.product_physical_specs
    await queryRunner.query(`
      INSERT INTO shop.product_physical_specs (
        product_id,
        height_cm,
        width_cm,
        length_or_diameter_cm,
        real_weight_kg
      )
      SELECT
        npm.id as product_id,
        (p.dimensions->>'height')::numeric as height_cm,
        (p.dimensions->>'width')::numeric as width_cm,
        COALESCE((p.dimensions->>'length')::numeric, (p.dimensions->>'diameter')::numeric) as length_or_diameter_cm,
        p.weight as real_weight_kg
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id
      WHERE p.dimensions IS NOT NULL OR p.weight IS NOT NULL;
    `);

    // 5. Insertar información de producción en shop.product_production
    await queryRunner.query(`
      INSERT INTO shop.product_production (
        product_id,
        availability_type,
        production_time_days
      )
      SELECT
        npm.id as product_id,
        (CASE
          WHEN p.made_to_order = true THEN 'bajo_pedido'
          WHEN COALESCE(p.inventory, 0) > 0 THEN 'en_stock'
          ELSE 'bajo_pedido'
        END)::product_availability as availability_type,
        p.lead_time_days as production_time_days
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id;
    `);

    // 6. Insertar información logística en shop.product_logistics
    await queryRunner.query(`
      INSERT INTO shop.product_logistics (
        product_id,
        pack_weight_kg
      )
      SELECT
        npm.id as product_id,
        p.weight as pack_weight_kg
      FROM shop.products p
      INNER JOIN new_products_map npm ON p.id = npm.legacy_product_id
      WHERE p.weight IS NOT NULL;
    `);

    // Limpiar tabla temporal
    await queryRunner.query(`DROP TABLE IF EXISTS new_products_map;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir migración: eliminar productos que fueron migrados por este script
    // IMPORTANTE: Solo elimina los que tienen legacy_product_id y fueron creados después de esta migración

    // Nota: No podemos revertir completamente porque no sabemos exactamente cuáles
    // productos fueron migrados por esta migración específica vs otras migraciones
    // Para seguridad, no hacemos nada en el down
    console.log(
      'WARNING: Down migration not implemented for safety. ' +
        'Please manually delete migrated products if needed.',
    );
  }
}
