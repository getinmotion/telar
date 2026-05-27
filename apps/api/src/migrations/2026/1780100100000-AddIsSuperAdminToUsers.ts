import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agregar columna is_super_admin a auth.users
 *
 * Indica si el usuario tiene privilegios de super administrador
 * Tipo: boolean
 * Default: false
 * NOT NULL
 */
export class AddIsSuperAdminToUsers1780100100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
      ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
      DROP COLUMN is_super_admin
    `);
  }
}
