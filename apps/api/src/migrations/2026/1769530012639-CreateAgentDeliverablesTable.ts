import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentDeliverablesTable1769530012639
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear función para actualizar updated_at si no existe
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Crear tabla agent_deliverables
    await queryRunner.query(`
      CREATE TABLE public.agent_deliverables (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        agent_id TEXT NOT NULL,
        conversation_id UUID NULL,
        task_id UUID NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        file_type TEXT NOT NULL DEFAULT 'text',
        content TEXT NULL,
        file_url TEXT NULL,
        metadata JSONB NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT agent_deliverables_pkey PRIMARY KEY (id)
      )
    `);

    // Crear foreign key a auth.users
    await queryRunner.query(`
      ALTER TABLE public.agent_deliverables
      ADD CONSTRAINT agent_deliverables_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    `);

    // Crear foreign key a agent_tasks
    await queryRunner.query(`
      ALTER TABLE public.agent_deliverables
      ADD CONSTRAINT agent_deliverables_task_id_fkey
      FOREIGN KEY (task_id) REFERENCES public.agent_tasks(id) ON DELETE SET NULL
    `);

    // Crear índice compuesto para user_id y agent_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_deliverables_user_agent 
      ON public.agent_deliverables USING btree (user_id, agent_id)
    `);

    // Crear índice para deleted_at (soft delete)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_deliverables_deleted_at 
      ON public.agent_deliverables (deleted_at)
    `);

    // Crear trigger para updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_agent_deliverables_updated_at
      BEFORE UPDATE ON public.agent_deliverables
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_agent_deliverables_updated_at ON public.agent_deliverables`,
    );

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_deliverables_deleted_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_agent_deliverables_user_agent`,
    );

    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE public.agent_deliverables DROP CONSTRAINT IF EXISTS agent_deliverables_task_id_fkey`,
    );
    await queryRunner.query(
      `ALTER TABLE public.agent_deliverables DROP CONSTRAINT IF EXISTS agent_deliverables_user_id_fkey`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.agent_deliverables`);

    // No eliminamos la función update_updated_at_column porque puede ser usada por otras tablas
  }
}
