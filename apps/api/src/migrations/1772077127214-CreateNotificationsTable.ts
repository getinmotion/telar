import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1772077127214
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de notificaciones
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        type text NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        metadata jsonb NULL DEFAULT '{}'::jsonb,
        read boolean NULL DEFAULT false,
        created_at timestamp with time zone NULL DEFAULT now(),
        CONSTRAINT notifications_pkey PRIMARY KEY (id)
      ) TABLESPACE pg_default;
    `);

    // Crear índice por user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id
      ON public.notifications USING btree (user_id)
      TABLESPACE pg_default;
    `);

    // Crear índice compuesto por user_id y read
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read
      ON public.notifications USING btree (user_id, read)
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_notifications_read;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_notifications_user_id;
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.notifications;
    `);
  }
}
