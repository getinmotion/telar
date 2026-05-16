import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminRole1779400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE auth.app_role ADD VALUE IF NOT EXISTS 'super_admin'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL no permite eliminar valores de un enum sin recrearlo.
    // El rollback elimina los registros con ese rol y deja el valor en el enum.
    await queryRunner.query(`
      DELETE FROM auth.user_roles WHERE role = 'super_admin'
    `);
  }
}
