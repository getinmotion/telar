import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterCoordinatorContextTable1769110776908
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar extensión UUID
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // 2. Crear tabla master_coordinator_context
    await queryRunner.query(`
      CREATE TABLE public.master_coordinator_context (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
        last_interaction TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        ai_memory JSONB NULL DEFAULT '[]'::jsonb,
        context_version INTEGER NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        CONSTRAINT master_coordinator_context_pkey PRIMARY KEY (id),
        CONSTRAINT master_coordinator_context_user_id_key UNIQUE (user_id),
        CONSTRAINT master_coordinator_context_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE
      ) TABLESPACE pg_default;
    `);

    // 3. Crear índice en user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_master_context_user 
      ON public.master_coordinator_context USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    // 4. Crear índice en last_interaction
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_master_context_last_interaction 
      ON public.master_coordinator_context USING btree (last_interaction) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_master_context_last_interaction;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_master_context_user;`,
    );

    // Eliminar tabla
    await queryRunner.query(
      `DROP TABLE IF EXISTS public.master_coordinator_context;`,
    );
  }
}
