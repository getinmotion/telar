import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSkuConsecutiveSequence1779300001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS shop.sku_consecutive_seq
        START WITH 1
        INCREMENT BY 1
        NO MAXVALUE
        CACHE 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS shop.sku_consecutive_seq;`);
  }
}
