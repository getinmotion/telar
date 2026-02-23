import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear la tabla user_roles y el enum app_role
 * Schema: auth
 */
export class CreateUserRolesTable1771817042216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear schema auth si no existe
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);

    // Crear enum app_role
    await queryRunner.query(`
      CREATE TYPE auth.app_role AS ENUM ('admin', 'user', 'artisan', 'moderator')
    `);

    // Crear tabla user_roles
    await queryRunner.query(`
      CREATE TABLE auth.user_roles (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role auth.app_role NOT NULL,
        granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        granted_by UUID NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT user_roles_pkey PRIMARY KEY (id),
        CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role),
        CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by)
          REFERENCES auth.users (id) ON DELETE SET NULL,
        CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES auth.users (id) ON DELETE CASCADE
      )
    `);

    // Crear índice en user_id
    await queryRunner.query(`
      CREATE INDEX idx_user_roles_user_id
      ON auth.user_roles USING btree (user_id)
    `);

    // Crear índice en role
    await queryRunner.query(`
      CREATE INDEX idx_user_roles_role
      ON auth.user_roles USING btree (role)
    `);

    // Nota: El trigger audit_user_role_changes se creará cuando se implemente
    // la función audit_role_changes() si es necesaria para la aplicación
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS auth.idx_user_roles_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS auth.idx_user_roles_user_id`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS auth.user_roles`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE IF EXISTS auth.app_role`);
  }
}
