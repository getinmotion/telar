import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPiezaUnicaToProductAvailability1789445310819
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE product_availability ADD VALUE IF NOT EXISTS 'pieza_unica'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE shop.product_production
      SET availability_type = 'edicion_limitada'
      WHERE availability_type = 'pieza_unica'
    `);
  }
}
