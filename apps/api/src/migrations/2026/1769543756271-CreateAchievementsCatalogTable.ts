import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAchievementsCatalogTable1769543756271
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión para UUID si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear schema artesanos si no existe
    await queryRunner.query(
      `CREATE SCHEMA IF NOT EXISTS artesanos`,
    );

    // Crear tabla achievements_catalog
    await queryRunner.query(`
      CREATE TABLE artesanos.achievements_catalog (
        id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'trophy',
        unlock_criteria JSONB NOT NULL DEFAULT '{}',
        category TEXT NULL,
        tier TEXT NULL DEFAULT 'bronze',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT achievements_catalog_pkey PRIMARY KEY (id)
      )
    `);

    // Crear índice para categoría
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_achievements_catalog_category 
      ON artesanos.achievements_catalog (category)
    `);

    // Crear índice para tier
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_achievements_catalog_tier 
      ON artesanos.achievements_catalog (tier)
    `);

    // Insertar logros iniciales del sistema
    await queryRunner.query(`
      INSERT INTO artesanos.achievements_catalog (id, title, description, icon, unlock_criteria, category, tier) VALUES
      ('first_mission', 'Primera Misión', 'Completaste tu primera misión empresarial', 'star', '{"type": "missions_completed", "count": 1}', 'missions', 'bronze'),
      ('five_missions', 'Emprendedor Activo', 'Completaste 5 misiones', 'fire', '{"type": "missions_completed", "count": 5}', 'missions', 'silver'),
      ('ten_missions', 'Emprendedor Dedicado', 'Completaste 10 misiones', 'rocket', '{"type": "missions_completed", "count": 10}', 'missions', 'gold'),
      ('level_5', 'Nivel 5 Alcanzado', 'Alcanzaste el nivel 5', 'medal', '{"type": "level_reached", "level": 5}', 'leveling', 'bronze'),
      ('level_10', 'Nivel 10 Alcanzado', 'Alcanzaste el nivel 10', 'trophy', '{"type": "level_reached", "level": 10}', 'leveling', 'silver'),
      ('streak_3', 'Racha de 3 días', 'Mantuviste actividad por 3 días consecutivos', 'flame', '{"type": "streak_reached", "days": 3}', 'streaks', 'bronze'),
      ('streak_7', 'Racha de 7 días', 'Mantuviste actividad por 7 días consecutivos', 'fire', '{"type": "streak_reached", "days": 7}', 'streaks', 'silver'),
      ('streak_30', 'Racha de 30 días', 'Mantuviste actividad por 30 días consecutivos', 'rocket', '{"type": "streak_reached", "days": 30}', 'streaks', 'gold'),
      ('onboarding_complete', 'Bienvenido a GetInMotion', 'Completaste el onboarding inicial', 'wave', '{"type": "onboarding_complete"}', 'milestones', 'bronze')
      ON CONFLICT (id) DO NOTHING
    `);

    // Crear función para actualizar racha de usuario
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
      RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER) AS $$
      DECLARE
        v_last_activity DATE;
        v_current_streak INTEGER;
        v_longest_streak INTEGER;
        v_today DATE := CURRENT_DATE;
      BEGIN
        -- Obtener datos actuales
        SELECT 
          last_activity_date,
          user_progress.current_streak,
          user_progress.longest_streak
        INTO 
          v_last_activity,
          v_current_streak,
          v_longest_streak
        FROM artesanos.user_progress
        WHERE user_id = p_user_id;

        -- Si no hay actividad previa, inicializar racha
        IF v_last_activity IS NULL THEN
          v_current_streak := 1;
        -- Si la última actividad fue ayer, incrementar racha
        ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
          v_current_streak := v_current_streak + 1;
        -- Si la última actividad fue hoy, mantener racha
        ELSIF v_last_activity = v_today THEN
          -- No cambiar nada
          v_current_streak := v_current_streak;
        -- Si pasó más de un día, reiniciar racha
        ELSE
          v_current_streak := 1;
        END IF;

        -- Actualizar longest_streak si es necesario
        IF v_current_streak > v_longest_streak THEN
          v_longest_streak := v_current_streak;
        END IF;

        -- Actualizar la tabla
        UPDATE artesanos.user_progress
        SET 
          current_streak = v_current_streak,
          longest_streak = v_longest_streak,
          last_activity_date = v_today,
          updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Retornar valores actualizados
        RETURN QUERY SELECT v_current_streak, v_longest_streak;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar función
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_user_streak(UUID)`);

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_achievements_catalog_tier`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_achievements_catalog_category`,
    );

    // Eliminar tabla
    await queryRunner.query(
      `DROP TABLE IF EXISTS artesanos.achievements_catalog`,
    );
  }
}
