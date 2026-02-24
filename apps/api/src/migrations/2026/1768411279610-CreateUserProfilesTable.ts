import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfilesTable1768411279610
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el schema artesanos si no existe
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS artesanos`);

    // Habilitar la extensión uuid-ossp si no está habilitada
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear el tipo ENUM user_type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE public.user_type AS ENUM ('regular', 'premium', 'enterprise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear el tipo ENUM account_type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE public.account_type AS ENUM ('buyer', 'seller', 'both');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear la tabla user_profiles en el schema artesanos
    await queryRunner.query(`
      CREATE TABLE artesanos.user_profiles (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        full_name TEXT NULL,
        avatar_url TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        business_description TEXT NULL,
        brand_name TEXT NULL,
        business_type TEXT NULL,
        target_market TEXT NULL,
        current_stage TEXT NULL,
        business_goals TEXT[] NULL,
        monthly_revenue_goal INTEGER NULL,
        time_availability TEXT NULL,
        team_size TEXT NULL,
        current_challenges TEXT[] NULL,
        sales_channels TEXT[] NULL,
        social_media_presence JSONB NULL DEFAULT '{}'::jsonb,
        business_location TEXT NULL,
        years_in_business INTEGER NULL,
        initial_investment_range TEXT NULL,
        primary_skills TEXT[] NULL,
        language_preference TEXT NULL DEFAULT 'es'::text,
        user_type public.user_type NULL DEFAULT 'regular'::public.user_type,
        first_name TEXT NULL,
        last_name TEXT NULL,
        whatsapp_e164 TEXT NULL,
        department TEXT NULL,
        city TEXT NULL,
        rut TEXT NULL,
        rut_pendiente BOOLEAN NULL DEFAULT false,
        newsletter_opt_in BOOLEAN NULL DEFAULT false,
        account_type public.account_type NULL DEFAULT 'buyer'::public.account_type,
        dane_city INTEGER NULL,
        CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
        CONSTRAINT user_profiles_user_id_key UNIQUE (user_id),
        CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES auth.users (id) ON DELETE CASCADE
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_language 
      ON artesanos.user_profiles USING btree (language_preference)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type 
      ON artesanos.user_profiles USING btree (account_type)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type 
      ON artesanos.user_profiles USING btree (user_type)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_rut_pendiente 
      ON artesanos.user_profiles USING btree (rut_pendiente)
      WHERE (rut_pendiente = true)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_department 
      ON artesanos.user_profiles USING btree (department)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_profiles_department`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_profiles_rut_pendiente`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_profiles_user_type`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_profiles_account_type`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS artesanos.idx_user_profiles_language`,
    );

    // Eliminar la tabla
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.user_profiles`);

    // Eliminar los tipos ENUM (solo si no son usados por otras tablas)
    // await queryRunner.query(`DROP TYPE IF EXISTS public.account_type`);
    // await queryRunner.query(`DROP TYPE IF EXISTS public.user_type`);

    // Nota: No eliminamos el schema artesanos porque puede tener otras tablas
    // await queryRunner.query(`DROP SCHEMA IF EXISTS artesanos CASCADE`);
  }
}
