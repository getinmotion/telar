import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserMasterContextTable1768854803518
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla user_master_context
    await queryRunner.query(`
      CREATE TABLE public.user_master_context (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        business_context JSONB NULL DEFAULT '{}'::jsonb,
        preferences JSONB NULL DEFAULT '{}'::jsonb,
        conversation_insights JSONB NULL DEFAULT '{}'::jsonb,
        technical_details JSONB NULL DEFAULT '{}'::jsonb,
        goals_and_objectives JSONB NULL DEFAULT '{}'::jsonb,
        context_version INTEGER NULL DEFAULT 1,
        last_updated TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        business_profile JSONB NULL DEFAULT '{}'::jsonb,
        task_generation_context JSONB NULL DEFAULT '{}'::jsonb,
        language_preference TEXT NULL DEFAULT 'es'::text,
        last_assessment_date TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        CONSTRAINT user_master_context_pkey PRIMARY KEY (id),
        CONSTRAINT user_master_context_user_id_key UNIQUE (user_id),
        CONSTRAINT user_master_context_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE
      ) TABLESPACE pg_default;
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_master_context_assessment_date 
      ON public.user_master_context USING btree (user_id, last_assessment_date DESC) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_master_context_language 
      ON public.user_master_context USING btree (user_id, language_preference) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_master_context_language`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_master_context_assessment_date`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.user_master_context`);
  }
}
