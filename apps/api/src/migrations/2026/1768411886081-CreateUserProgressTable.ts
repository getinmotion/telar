import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProgressTable1768411886081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear la función del trigger para actualizar updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear la tabla user_progress en el schema artesanos
    await queryRunner.query(`
      CREATE TABLE artesanos.user_progress (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        experience_points INTEGER NOT NULL DEFAULT 0,
        next_level_xp INTEGER NOT NULL DEFAULT 100,
        completed_missions INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_activity_date DATE NULL DEFAULT CURRENT_DATE,
        total_time_spent INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT user_progress_pkey PRIMARY KEY (id),
        CONSTRAINT user_progress_user_id_key UNIQUE (user_id),
        CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES artesanos.user_profiles (user_id) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
      ON artesanos.user_progress USING btree (user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_level 
      ON artesanos.user_progress USING btree (level)
    `);

    // Crear trigger para actualizar updated_at automáticamente
    await queryRunner.query(`
      CREATE TRIGGER update_user_progress_updated_at 
      BEFORE UPDATE ON artesanos.user_progress 
      FOR EACH ROW 
      EXECUTE FUNCTION update_user_progress_timestamp()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_user_progress_updated_at ON artesanos.user_progress`,
    );

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_progress_level`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_progress_user_id`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.user_progress`);

    // Eliminar función del trigger
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_user_progress_timestamp()`,
    );
  }
}
