import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCategoriesTable1768856424865
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla product_categories
    await queryRunner.query(`
      CREATE TABLE public.product_categories (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NULL,
        parent_id UUID NULL,
        display_order INTEGER NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        image_url TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT product_categories_pkey PRIMARY KEY (id),
        CONSTRAINT product_categories_slug_key UNIQUE (slug),
        CONSTRAINT product_categories_parent_id_fkey FOREIGN KEY (parent_id) 
          REFERENCES product_categories (id) ON DELETE CASCADE
      ) TABLESPACE pg_default;
    `);

    // Crear índices
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_product_categories_slug`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_product_categories_parent_id`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.product_categories`);
  }
}
