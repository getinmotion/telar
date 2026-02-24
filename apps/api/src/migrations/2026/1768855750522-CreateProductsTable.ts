import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1768855750522 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear schema shop si no existe
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS shop`);

    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Habilitar extensión pgvector para embeddings
    // NOTA: pgvector no está instalado, usando TEXT como alternativa temporal
    // Para habilitar: instalar pgvector y descomentar la línea siguiente
    // await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Crear tabla products
    await queryRunner.query(`
      CREATE TABLE shop.products (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        shop_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT NULL,
        short_description TEXT NULL,
        price NUMERIC(10, 2) NOT NULL,
        compare_price NUMERIC(10, 2) NULL,
        images JSONB NULL DEFAULT '[]'::jsonb,
        category TEXT NULL,
        subcategory TEXT NULL,
        tags JSONB NULL DEFAULT '[]'::jsonb,
        inventory INTEGER NULL DEFAULT 0,
        sku TEXT NULL,
        weight NUMERIC(8, 2) NULL,
        dimensions JSONB NULL,
        materials JSONB NULL DEFAULT '[]'::jsonb,
        techniques JSONB NULL DEFAULT '[]'::jsonb,
        production_time TEXT NULL,
        customizable BOOLEAN NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        featured BOOLEAN NOT NULL DEFAULT false,
        seo_data JSONB NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        category_id UUID NULL,
        made_to_order BOOLEAN NULL DEFAULT false,
        lead_time_days INTEGER NULL DEFAULT 7,
        production_time_hours NUMERIC(5, 2) NULL DEFAULT 0,
        requires_customization BOOLEAN NULL DEFAULT false,
        marketplace_links JSONB NULL DEFAULT '{}'::jsonb,
        embedding TEXT NULL,
        moderation_status TEXT NULL DEFAULT 'draft'::text,
        shipping_data_complete BOOLEAN NULL DEFAULT false,
        ready_for_checkout BOOLEAN NULL DEFAULT false,
        allows_local_pickup BOOLEAN NULL DEFAULT false,
        CONSTRAINT products_pkey PRIMARY KEY (id),
        CONSTRAINT products_shop_id_fkey FOREIGN KEY (shop_id) 
          REFERENCES public.artisan_shops (id) ON DELETE CASCADE,
        CONSTRAINT products_moderation_status_check CHECK (
          moderation_status = ANY (ARRAY[
            'draft'::text,
            'pending_moderation'::text,
            'approved'::text,
            'approved_with_edits'::text,
            'changes_requested'::text,
            'rejected'::text,
            'archived'::text
          ])
        )
      ) TABLESPACE pg_default;
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_shop_id 
      ON shop.products USING btree (shop_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category 
      ON shop.products USING btree (category) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_id 
      ON shop.products USING btree (category_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_moderation_status 
      ON shop.products USING btree (moderation_status) 
      TABLESPACE pg_default;
    `);

    // Índices GIN para campos JSONB
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_marketplace_links 
      ON shop.products USING gin (marketplace_links) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS products_tags_idx 
      ON shop.products USING gin (tags) 
      TABLESPACE pg_default;
    `);

    // Índice IVFFlat para búsquedas vectoriales (embedding)
    // NOTA: Deshabilitado hasta instalar pgvector
    // Para habilitar: instalar pgvector, cambiar tipo de columna a vector, y descomentar
    /*
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS products_embedding_idx 
      ON shop.products USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100) 
      TABLESPACE pg_default;
    `);
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    // await queryRunner.query(`DROP INDEX IF EXISTS shop.products_embedding_idx`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.products_tags_idx`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_products_marketplace_links`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_products_moderation_status`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_products_category_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_products_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_products_shop_id`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS shop.products`);

    // Nota: No eliminamos el schema ni las extensiones porque pueden ser usadas por otras tablas
  }
}
