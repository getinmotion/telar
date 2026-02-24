import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandThemesTable1768850117397
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla brand_themes
    await queryRunner.query(`
      CREATE TABLE public.brand_themes (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NULL,
        theme_id TEXT NOT NULL,
        version INTEGER NULL DEFAULT 1,
        is_active BOOLEAN NULL DEFAULT true,
        palette JSONB NOT NULL,
        style_context JSONB NULL,
        usage_rules JSONB NULL,
        preview_description TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        CONSTRAINT brand_themes_pkey PRIMARY KEY (id),
        CONSTRAINT brand_themes_theme_id_key UNIQUE (theme_id),
        CONSTRAINT brand_themes_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE
      ) TABLESPACE pg_default;
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_brand_themes_user_id 
      ON public.brand_themes USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_brand_themes_active 
      ON public.brand_themes USING btree (user_id, is_active) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_brand_themes_theme_id 
      ON public.brand_themes USING btree (theme_id) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_brand_themes_theme_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_brand_themes_active`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_brand_themes_user_id`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.brand_themes`);
  }
}
