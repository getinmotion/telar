import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsEventsTable1769449895945
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID si no está habilitada
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    // Crear tabla analytics_events
    await queryRunner.query(`
      CREATE TABLE public.analytics_events (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NULL,
        event_type TEXT NOT NULL,
        event_data JSONB NULL DEFAULT '{}'::jsonb,
        session_id TEXT NULL,
        success BOOLEAN NULL DEFAULT true,
        duration_ms INTEGER NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
        CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
      ON public.analytics_events USING btree (user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at 
      ON public.analytics_events USING btree (created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type 
      ON public.analytics_events USING btree (event_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_analytics_events_event_type`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_analytics_events_created_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_analytics_events_user_id`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.analytics_events`);
  }
}
