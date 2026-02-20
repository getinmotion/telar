import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAchievementsTable1769530711724
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla user_achievements
    await queryRunner.query(`
      CREATE TABLE public.user_achievements (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        achievement_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'trophy',
        unlocked_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
        CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id)
      )
    `);

    // Crear foreign key a auth.users
    await queryRunner.query(`
      ALTER TABLE public.user_achievements
      ADD CONSTRAINT user_achievements_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    `);

    // Crear índice para user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
      ON public.user_achievements USING btree (user_id)
    `);

    // Crear índice para achievement_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id 
      ON public.user_achievements USING btree (achievement_id)
    `);

    // Crear índice para deleted_at (soft delete)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_deleted_at 
      ON public.user_achievements (deleted_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_achievements_deleted_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_achievements_achievement_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_user_achievements_user_id`,
    );

    // Eliminar foreign key
    await queryRunner.query(
      `ALTER TABLE public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS public.user_achievements`);
  }
}
