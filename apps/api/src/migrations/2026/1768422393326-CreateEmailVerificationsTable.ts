import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailVerificationsTable1768422393326
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla email_verifications en el schema public
    await queryRunner.query(`
      CREATE TABLE public.email_verifications (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
        CONSTRAINT email_verifications_pkey PRIMARY KEY (id),
        CONSTRAINT email_verifications_token_key UNIQUE (token),
        CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT valid_expiration CHECK (expires_at > created_at)
      )
    `);

    // Índice en token (solo tokens no usados)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_token 
      ON public.email_verifications USING btree (token) 
      WHERE (used_at IS NULL)
    `);

    // Índice en user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id 
      ON public.email_verifications USING btree (user_id)
    `);

    // Índice en expires_at (solo tokens no usados)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at 
      ON public.email_verifications USING btree (expires_at) 
      WHERE (used_at IS NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_email_verifications_expires_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_email_verifications_user_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_email_verifications_token`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.email_verifications`);
  }
}
