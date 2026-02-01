import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtisanShopsTable1768850135588
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla artisan_shops
    await queryRunner.query(`
      CREATE TABLE public.artisan_shops (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        shop_name TEXT NOT NULL,
        shop_slug TEXT NOT NULL,
        description TEXT NULL,
        story TEXT NULL,
        logo_url TEXT NULL,
        banner_url TEXT NULL,
        craft_type TEXT NULL,
        region TEXT NULL,
        certifications JSONB NULL DEFAULT '[]'::jsonb,
        contact_info JSONB NULL DEFAULT '{}'::jsonb,
        social_links JSONB NULL DEFAULT '{}'::jsonb,
        active BOOLEAN NOT NULL DEFAULT true,
        featured BOOLEAN NOT NULL DEFAULT false,
        seo_data JSONB NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        privacy_level TEXT NULL DEFAULT 'public'::text,
        data_classification JSONB NULL DEFAULT '{"contact": "sensitive", "analytics": "restricted", "strategies": "confidential"}'::jsonb,
        public_profile JSONB NULL,
        creation_status TEXT NULL DEFAULT 'complete'::text,
        creation_step INTEGER NULL DEFAULT 0,
        primary_colors JSONB NULL DEFAULT '[]'::jsonb,
        secondary_colors JSONB NULL DEFAULT '[]'::jsonb,
        brand_claim TEXT NULL,
        hero_config JSONB NULL DEFAULT '{"slides": [], "autoplay": true, "duration": 5000}'::jsonb,
        about_content JSONB NULL DEFAULT '{"story": "", "title": "", "values": [], "vision": "", "mission": ""}'::jsonb,
        contact_config JSONB NULL DEFAULT '{"email": "", "hours": "", "phone": "", "address": "", "whatsapp": "", "map_embed": ""}'::jsonb,
        active_theme_id TEXT NULL,
        publish_status TEXT NULL DEFAULT 'pending_publish'::text,
        marketplace_approved BOOLEAN NULL DEFAULT false,
        marketplace_approved_at TIMESTAMP WITH TIME ZONE NULL,
        marketplace_approved_by UUID NULL,
        id_contraparty TEXT NULL,
        artisan_profile JSONB NULL,
        artisan_profile_completed BOOLEAN NULL DEFAULT false,
        bank_data_status TEXT NULL DEFAULT 'not_set'::text,
        marketplace_approval_status TEXT NULL DEFAULT 'pending'::text,
        department TEXT NULL,
        municipality TEXT NULL,
        CONSTRAINT artisan_shops_pkey PRIMARY KEY (id),
        CONSTRAINT artisan_shops_shop_slug_key UNIQUE (shop_slug),
        CONSTRAINT unique_user_shop UNIQUE (user_id),
        CONSTRAINT artisan_shops_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT artisan_shops_active_theme_id_fkey FOREIGN KEY (active_theme_id) 
          REFERENCES brand_themes (theme_id),
        CONSTRAINT artisan_shops_privacy_level_check CHECK (
          privacy_level = ANY (ARRAY['public'::text, 'limited'::text, 'private'::text])
        ),
        CONSTRAINT artisan_shops_creation_status_check CHECK (
          creation_status = ANY (ARRAY['draft'::text, 'incomplete'::text, 'complete'::text])
        ),
        CONSTRAINT artisan_shops_publish_status_check CHECK (
          publish_status = ANY (ARRAY['pending_publish'::text, 'published'::text])
        ),
        CONSTRAINT artisan_shops_bank_data_status_check CHECK (
          bank_data_status = ANY (ARRAY['not_set'::text, 'pending'::text, 'approved'::text])
        ),
        CONSTRAINT artisan_shops_marketplace_approval_status_check CHECK (
          marketplace_approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])
        )
      ) TABLESPACE pg_default;
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_user_id 
      ON public.artisan_shops USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_slug 
      ON public.artisan_shops USING btree (shop_slug) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_active_theme 
      ON public.artisan_shops USING btree (active_theme_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_artisan_shops_profile_completed 
      ON public.artisan_shops USING btree (artisan_profile_completed) 
      TABLESPACE pg_default 
      WHERE (artisan_profile_completed = true);
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_municipality`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_department`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_profile_completed`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_active_theme`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_slug`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_artisan_shops_user_id`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.artisan_shops`);
  }
}
