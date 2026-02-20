import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentTasksTable1769108645141
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar extensión UUID
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // 2. Crear tabla agent_tasks
    await queryRunner.query(`
      CREATE TABLE public.agent_tasks (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        agent_id TEXT NOT NULL,
        conversation_id UUID NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        relevance TEXT NOT NULL DEFAULT 'medium',
        progress_percentage INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER NOT NULL DEFAULT 3,
        due_date TIMESTAMP WITH TIME ZONE NULL,
        completed_at TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        subtasks JSONB NULL DEFAULT '[]'::jsonb,
        notes TEXT NULL DEFAULT '',
        steps_completed JSONB NULL DEFAULT '{}'::jsonb,
        resources JSONB NULL DEFAULT '[]'::jsonb,
        time_spent INTEGER NULL DEFAULT 0,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        environment TEXT NOT NULL DEFAULT 'production',
        deliverable_type TEXT NULL,
        milestone_category TEXT NULL,
        CONSTRAINT agent_tasks_pkey PRIMARY KEY (id),
        CONSTRAINT unique_user_agent_task UNIQUE (user_id, agent_id),
        CONSTRAINT agent_tasks_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT agent_tasks_progress_percentage_check CHECK (
          (progress_percentage >= 0) AND (progress_percentage <= 100)
        ),
        CONSTRAINT agent_tasks_environment_check CHECK (
          environment = ANY (ARRAY['production'::text, 'staging'::text])
        ),
        CONSTRAINT agent_tasks_status_check CHECK (
          status = ANY (
            ARRAY[
              'pending'::text,
              'in_progress'::text,
              'completed'::text,
              'cancelled'::text
            ]
          )
        ),
        CONSTRAINT check_milestone_category CHECK (
          (milestone_category IS NULL) OR (
            milestone_category = ANY (
              ARRAY[
                'formalization'::text,
                'brand'::text,
                'shop'::text,
                'sales'::text,
                'community'::text
              ]
            )
          )
        ),
        CONSTRAINT agent_tasks_relevance_check CHECK (
          relevance = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])
        ),
        CONSTRAINT agent_tasks_priority_check CHECK (
          (priority >= 1) AND (priority <= 5)
        )
      ) TABLESPACE pg_default;
    `);

    // 3. Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_steps_completed 
      ON public.agent_tasks USING gin (steps_completed) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_subtasks 
      ON public.agent_tasks USING gin (subtasks) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_status 
      ON public.agent_tasks USING btree (user_id, status) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_agent 
      ON public.agent_tasks USING btree (user_id, agent_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_status 
      ON public.agent_tasks USING btree (status) 
      TABLESPACE pg_default 
      WHERE (NOT is_archived);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_validation_check 
      ON public.agent_tasks USING btree (user_id, status, is_archived) 
      TABLESPACE pg_default 
      WHERE (
        (status = ANY (ARRAY['pending'::text, 'in_progress'::text])) 
        AND (is_archived = false)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_cleanup 
      ON public.agent_tasks USING btree (status, created_at, is_archived) 
      TABLESPACE pg_default 
      WHERE (is_archived = false);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_is_archived 
      ON public.agent_tasks USING btree (is_archived) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_deliverable_type 
      ON public.agent_tasks USING btree (deliverable_type) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_environment 
      ON public.agent_tasks USING btree (environment, user_id) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_milestone_category 
      ON public.agent_tasks USING btree (milestone_category) 
      TABLESPACE pg_default;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_milestone 
      ON public.agent_tasks USING btree (user_id, milestone_category) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_user_milestone;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_milestone_category;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_environment;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_deliverable_type;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_is_archived;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_cleanup;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_validation_check;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_status;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_user_agent;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_user_status;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_subtasks;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_tasks_steps_completed;`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.agent_tasks;`);
  }
}
