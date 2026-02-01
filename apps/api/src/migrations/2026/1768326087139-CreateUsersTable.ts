import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1768326087139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el schema auth si no existe
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);

    // Habilitar la extensión uuid-ossp para generar UUIDs
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear la tabla users en el schema auth
    await queryRunner.query(`
            CREATE TABLE auth.users (
                instance_id UUID NULL,
                id UUID NOT NULL DEFAULT uuid_generate_v4(),
                aud VARCHAR(255) NULL,
                role VARCHAR(255) NULL,
                email VARCHAR(255) NULL,
                encrypted_password VARCHAR(255) NULL,
                email_confirmed_at TIMESTAMP WITH TIME ZONE NULL,
                invited_at TIMESTAMP WITH TIME ZONE NULL,
                confirmation_token VARCHAR(255) NULL,
                confirmation_sent_at TIMESTAMP WITH TIME ZONE NULL,
                recovery_token VARCHAR(255) NULL,
                recovery_sent_at TIMESTAMP WITH TIME ZONE NULL,
                email_change_token_new VARCHAR(255) NULL,
                email_change VARCHAR(255) NULL,
                email_change_sent_at TIMESTAMP WITH TIME ZONE NULL,
                last_sign_in_at TIMESTAMP WITH TIME ZONE NULL,
                raw_app_meta_data JSONB NULL,
                raw_user_meta_data JSONB NULL,
                is_super_admin BOOLEAN NULL,
                created_at TIMESTAMP WITH TIME ZONE NULL,
                updated_at TIMESTAMP WITH TIME ZONE NULL,
                phone TEXT NULL DEFAULT NULL,
                phone_confirmed_at TIMESTAMP WITH TIME ZONE NULL,
                phone_change TEXT NULL DEFAULT '',
                phone_change_token VARCHAR(255) NULL DEFAULT '',
                phone_change_sent_at TIMESTAMP WITH TIME ZONE NULL,
                confirmed_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED NULL,
                email_change_token_current VARCHAR(255) NULL DEFAULT '',
                email_change_confirm_status SMALLINT NULL DEFAULT 0,
                banned_until TIMESTAMP WITH TIME ZONE NULL,
                reauthentication_token VARCHAR(255) NULL DEFAULT '',
                reauthentication_sent_at TIMESTAMP WITH TIME ZONE NULL,
                is_sso_user BOOLEAN NOT NULL DEFAULT false,
                deleted_at TIMESTAMP WITH TIME ZONE NULL,
                is_anonymous BOOLEAN NOT NULL DEFAULT false,
                CONSTRAINT users_pkey PRIMARY KEY (id),
                CONSTRAINT users_phone_key UNIQUE (phone),
                CONSTRAINT users_email_change_confirm_status_check CHECK (
                    (email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)
                )
            )
        `);

    // Crear índices
    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS confirmation_token_idx 
            ON auth.users USING btree (confirmation_token)
            WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS email_change_token_current_idx 
            ON auth.users USING btree (email_change_token_current)
            WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS email_change_token_new_idx 
            ON auth.users USING btree (email_change_token_new)
            WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS reauthentication_token_idx 
            ON auth.users USING btree (reauthentication_token)
            WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS recovery_token_idx 
            ON auth.users USING btree (recovery_token)
            WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS users_email_partial_key 
            ON auth.users USING btree (email)
            WHERE (is_sso_user = false)
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS users_instance_id_email_idx 
            ON auth.users USING btree (instance_id, lower((email)::text))
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS users_instance_id_idx 
            ON auth.users USING btree (instance_id)
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS users_is_anonymous_idx 
            ON auth.users USING btree (is_anonymous)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS auth.users_is_anonymous_idx`);
    await queryRunner.query(`DROP INDEX IF EXISTS auth.users_instance_id_idx`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS auth.users_instance_id_email_idx`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS auth.users_email_partial_key`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS auth.recovery_token_idx`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS auth.reauthentication_token_idx`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS auth.email_change_token_new_idx`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS auth.email_change_token_current_idx`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS auth.confirmation_token_idx`);

    // Eliminar la tabla
    await queryRunner.query(`DROP TABLE IF EXISTS auth.users`);

    // Nota: No eliminamos la extensión uuid-ossp ni el schema auth porque podrían ser usados por otras tablas
    // Si quieres eliminarlos, descomenta las siguientes líneas:
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    // await queryRunner.query(`DROP SCHEMA IF EXISTS auth CASCADE`);
  }
}
