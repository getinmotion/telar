import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskStepsTable1769539472714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Verificar que existe la función update_updated_at_column
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Crear tabla task_steps
    await queryRunner.query(`
      CREATE TABLE public.task_steps (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        task_id UUID NOT NULL,
        step_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        input_type TEXT NOT NULL DEFAULT 'text',
        validation_criteria JSONB NULL DEFAULT '{}',
        ai_context_prompt TEXT NULL,
        completion_status TEXT NOT NULL DEFAULT 'pending',
        user_input_data JSONB NULL DEFAULT '{}',
        ai_assistance_log JSONB NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT task_steps_pkey PRIMARY KEY (id)
      )
    `);

    // Crear foreign key a agent_tasks
    await queryRunner.query(`
      ALTER TABLE public.task_steps
      ADD CONSTRAINT task_steps_task_id_fkey
      FOREIGN KEY (task_id) REFERENCES public.agent_tasks(id) ON DELETE CASCADE
    `);

    // Crear índice para task_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_task_steps_task_id 
      ON public.task_steps USING btree (task_id)
    `);

    // Crear índice compuesto para task_id y step_number
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_task_steps_step_number 
      ON public.task_steps USING btree (task_id, step_number)
    `);

    // Crear índice para deleted_at (soft delete)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_task_steps_deleted_at 
      ON public.task_steps (deleted_at)
    `);

    // Crear trigger para updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_task_steps_updated_at
      BEFORE UPDATE ON public.task_steps
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_task_steps_updated_at ON public.task_steps`,
    );

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_task_steps_deleted_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_task_steps_step_number`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_task_steps_task_id`,
    );

    // Eliminar foreign key
    await queryRunner.query(
      `ALTER TABLE public.task_steps DROP CONSTRAINT IF EXISTS task_steps_task_id_fkey`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.task_steps`);
  }
}
