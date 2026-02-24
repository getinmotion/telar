import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserMaturityScoresTable1769109906805
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar extensión UUID
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // 2. Crear tabla user_maturity_scores
    await queryRunner.query(`
      CREATE TABLE public.user_maturity_scores (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        idea_validation INTEGER NOT NULL,
        user_experience INTEGER NOT NULL,
        market_fit INTEGER NOT NULL,
        monetization INTEGER NOT NULL,
        profile_data JSONB NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT user_maturity_scores_pkey PRIMARY KEY (id),
        CONSTRAINT user_maturity_scores_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT user_maturity_scores_idea_validation_check CHECK (
          (idea_validation >= 0) AND (idea_validation <= 100)
        ),
        CONSTRAINT user_maturity_scores_user_experience_check CHECK (
          (user_experience >= 0) AND (user_experience <= 100)
        ),
        CONSTRAINT user_maturity_scores_market_fit_check CHECK (
          (market_fit >= 0) AND (market_fit <= 100)
        ),
        CONSTRAINT user_maturity_scores_monetization_check CHECK (
          (monetization >= 0) AND (monetization <= 100)
        )
      ) TABLESPACE pg_default;
    `);

    // 3. Crear índice en user_id para mejorar consultas
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_scores_user_id 
      ON public.user_maturity_scores USING btree (user_id) 
      TABLESPACE pg_default;
    `);

    // 4. Crear índice en created_at para consultas de histórico
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_scores_created_at 
      ON public.user_maturity_scores USING btree (created_at DESC) 
      TABLESPACE pg_default;
    `);

    // 5. Crear índice compuesto para obtener el score más reciente por usuario
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_maturity_scores_user_created 
      ON public.user_maturity_scores USING btree (user_id, created_at DESC) 
      TABLESPACE pg_default;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_scores_user_created;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_scores_created_at;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_maturity_scores_user_id;`,
    );

    // Eliminar tabla
    await queryRunner.query(
      `DROP TABLE IF EXISTS public.user_maturity_scores;`,
    );
  }
}
