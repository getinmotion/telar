import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserMaturityActionsTable1768855142126
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla user_maturity_actions
    await queryRunner.query(`
      CREATE TABLE public.user_maturity_actions (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        action_type TEXT NOT NULL,
        category TEXT NOT NULL,
        points INTEGER NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        CONSTRAINT user_maturity_actions_pkey PRIMARY KEY (id),
        CONSTRAINT user_maturity_actions_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT user_maturity_actions_action_type_check CHECK (
          action_type = ANY (ARRAY[
            'sale'::text,
            'agent_use'::text,
            'task_completed'::text,
            'customer_interaction'::text,
            'milestone'::text,
            'increment'::text
          ])
        ),
        CONSTRAINT user_maturity_actions_category_check CHECK (
          category = ANY (ARRAY[
            'ideaValidation'::text,
            'userExperience'::text,
            'marketFit'::text,
            'monetization'::text
          ])
        ),
        CONSTRAINT user_maturity_actions_points_check CHECK (
          (points >= 0) AND (points <= 100)
        )
      ) TABLESPACE pg_default;
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_user_id 
      ON public.user_maturity_actions USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_created_at 
      ON public.user_maturity_actions USING btree (created_at DESC) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_actions_category 
      ON public.user_maturity_actions USING btree (category) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_actions_category`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_actions_created_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_actions_user_id`,
    );

    // Eliminar tabla
    await queryRunner.query(
      `DROP TABLE IF EXISTS public.user_maturity_actions`,
    );
  }
}
