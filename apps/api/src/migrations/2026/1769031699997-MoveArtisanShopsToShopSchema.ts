import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveArtisanShopsToShopSchema1769031699997
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar FKs que apuntan a artisan_shops (products -> artisan_shops)
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP CONSTRAINT IF EXISTS products_shop_id_fkey;
    `);

    // 2. Eliminar FKs de artisan_shops hacia otras tablas
    await queryRunner.query(`
      ALTER TABLE public.artisan_shops 
      DROP CONSTRAINT IF EXISTS artisan_shops_user_id_fkey;
    `);

    await queryRunner.query(`
      ALTER TABLE public.artisan_shops 
      DROP CONSTRAINT IF EXISTS artisan_shops_active_theme_id_fkey;
    `);

    // 3. Eliminar índices en public
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_user_id;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_shop_slug;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_department;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_municipality;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_active;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_artisan_shops_featured;
    `);

    // 4. Mover la tabla de public a shop
    await queryRunner.query(`
      ALTER TABLE public.artisan_shops 
      SET SCHEMA shop;
    `);

    // 5. Recrear FK de artisan_shops hacia auth.users
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops 
      ADD CONSTRAINT artisan_shops_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users (id) 
      ON DELETE CASCADE;
    `);

    // 6. Recrear FK de artisan_shops hacia public.brand_themes
    // NOTA: Omitida temporalmente porque active_theme_id es TEXT y brand_themes.id es UUID
    // Este problema debe corregirse en una migración separada:
    // 1. ALTER COLUMN active_theme_id TYPE UUID USING active_theme_id::UUID
    // 2. Luego agregar la FK
    /* 
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops 
      ADD CONSTRAINT artisan_shops_active_theme_id_fkey 
      FOREIGN KEY (active_theme_id) 
      REFERENCES public.brand_themes (id) 
      ON DELETE SET NULL;
    `);
    */

    // 7. Recrear FK de products hacia artisan_shops (ahora en shop)
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD CONSTRAINT products_shop_id_fkey 
      FOREIGN KEY (shop_id) 
      REFERENCES shop.artisan_shops (id) 
      ON DELETE CASCADE;
    `);

    // 8. Recrear los índices en shop
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_user_id 
      ON shop.artisan_shops USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_artisan_shops_shop_slug 
      ON shop.artisan_shops USING btree (shop_slug) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_department 
      ON shop.artisan_shops USING btree (department) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_municipality 
      ON shop.artisan_shops USING btree (municipality) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_active 
      ON shop.artisan_shops USING btree (active) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_featured 
      ON shop.artisan_shops USING btree (featured) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar FK de products a artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP CONSTRAINT IF EXISTS products_shop_id_fkey;
    `);

    // 2. Eliminar FKs de artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops 
      DROP CONSTRAINT IF EXISTS artisan_shops_user_id_fkey;
    `);

    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops 
      DROP CONSTRAINT IF EXISTS artisan_shops_active_theme_id_fkey;
    `);

    // 3. Eliminar índices en shop
    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_featured;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_active;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_municipality;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_department;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_shop_slug;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_artisan_shops_user_id;
    `);

    // 4. Mover la tabla de shop a public
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops 
      SET SCHEMA public;
    `);

    // 5. Recrear FK de artisan_shops hacia auth.users
    await queryRunner.query(`
      ALTER TABLE public.artisan_shops 
      ADD CONSTRAINT artisan_shops_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users (id) 
      ON DELETE CASCADE;
    `);

    // 6. Recrear FK de artisan_shops hacia public.brand_themes
    // NOTA: Omitida porque active_theme_id es TEXT (problema de diseño original)
    /*
    await queryRunner.query(`
      ALTER TABLE public.artisan_shops 
      ADD CONSTRAINT artisan_shops_active_theme_id_fkey 
      FOREIGN KEY (active_theme_id) 
      REFERENCES public.brand_themes (id) 
      ON DELETE SET NULL;
    `);
    */

    // 7. Recrear FK de products hacia artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD CONSTRAINT products_shop_id_fkey 
      FOREIGN KEY (shop_id) 
      REFERENCES public.artisan_shops (id) 
      ON DELETE CASCADE;
    `);

    // 8. Recrear los índices en public
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_user_id 
      ON public.artisan_shops USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_artisan_shops_shop_slug 
      ON public.artisan_shops USING btree (shop_slug) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_department 
      ON public.artisan_shops USING btree (department) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_municipality 
      ON public.artisan_shops USING btree (municipality) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_active 
      ON public.artisan_shops USING btree (active) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_featured 
      ON public.artisan_shops USING btree (featured) 
      TABLESPACE pg_default;
    `);
  }
}
