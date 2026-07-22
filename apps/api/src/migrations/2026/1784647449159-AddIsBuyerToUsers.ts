import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsBuyerToUsers1784647449159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
      ADD COLUMN is_buyer BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth.users
      DROP COLUMN is_buyer
    `);
  }
}
