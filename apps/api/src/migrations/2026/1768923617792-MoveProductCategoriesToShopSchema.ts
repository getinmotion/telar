import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveProductCategoriesToShopSchema1768923617792
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar las FKs existentes que apuntan a product_categories
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    `);

    await queryRunner.query(`
      ALTER TABLE public.product_categories 
      DROP CONSTRAINT IF EXISTS product_categories_parent_id_fkey;
    `);

    // 2. Eliminar índices en public
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_product_categories_slug;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_product_categories_parent_id;
    `);

    // 3. Mover la tabla de public a shop
    await queryRunner.query(`
      ALTER TABLE public.product_categories 
      SET SCHEMA shop;
    `);

    // 4. Recrear la FK self-referencial en shop.product_categories
    await queryRunner.query(`
      ALTER TABLE shop.product_categories 
      ADD CONSTRAINT product_categories_parent_id_fkey 
      FOREIGN KEY (parent_id) 
      REFERENCES shop.product_categories (id) 
      ON DELETE CASCADE;
    `);

    // 5. Recrear la FK de products a product_categories en shop
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD CONSTRAINT products_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES shop.product_categories (id) 
      ON DELETE SET NULL;
    `);

    // 6. Recrear los índices en shop
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id 
      ON shop.product_categories USING btree (parent_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_categories_slug 
      ON shop.product_categories USING btree (slug) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar las FKs en shop
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    `);

    await queryRunner.query(`
      ALTER TABLE shop.product_categories 
      DROP CONSTRAINT IF EXISTS product_categories_parent_id_fkey;
    `);

    // 2. Eliminar índices en shop
    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_product_categories_slug;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_product_categories_parent_id;
    `);

    // 3. Mover la tabla de shop a public
    await queryRunner.query(`
      ALTER TABLE shop.product_categories 
      SET SCHEMA public;
    `);

    // 4. Recrear la FK self-referencial en public.product_categories
    await queryRunner.query(`
      ALTER TABLE public.product_categories 
      ADD CONSTRAINT product_categories_parent_id_fkey 
      FOREIGN KEY (parent_id) 
      REFERENCES public.product_categories (id) 
      ON DELETE CASCADE;
    `);

    // 5. Recrear la FK de products a product_categories en public
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD CONSTRAINT products_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES public.product_categories (id) 
      ON DELETE SET NULL;
    `);

    // 6. Recrear los índices en public
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id 
      ON public.product_categories USING btree (parent_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_categories_slug 
      ON public.product_categories USING btree (slug) 
      TABLESPACE pg_default;
    `);
  }
}
