import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductModerationHistoryTable1772227275939 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla product_moderation_history
    await queryRunner.query(`
            CREATE TABLE public.product_moderation_history (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                product_id uuid NOT NULL,
                previous_status text NULL,
                new_status text NOT NULL,
                moderator_id uuid NULL,
                artisan_id uuid NULL,
                comment text NULL,
                edits_made jsonb NULL DEFAULT '{}'::jsonb,
                created_at timestamp with time zone NULL DEFAULT now(),
                CONSTRAINT product_moderation_history_pkey PRIMARY KEY (id),
                CONSTRAINT product_moderation_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES shop.products(id) ON DELETE CASCADE
            );
        `);

    // Crear índice en product_id
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_moderation_history_product_id
            ON public.product_moderation_history USING btree (product_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`
            DROP INDEX IF EXISTS public.idx_product_moderation_history_product_id;
        `);

    // Eliminar tabla
    await queryRunner.query(`
            DROP TABLE IF EXISTS public.product_moderation_history;
        `);
  }
}
