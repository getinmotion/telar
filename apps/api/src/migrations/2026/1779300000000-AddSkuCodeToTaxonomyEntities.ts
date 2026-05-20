import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkuCodeToTaxonomyEntities1779300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE taxonomy.categories
        ADD COLUMN IF NOT EXISTS sku_code VARCHAR(5) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE taxonomy.territories
        ADD COLUMN IF NOT EXISTS sku_code VARCHAR(5) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE taxonomy.techniques
        ADD COLUMN IF NOT EXISTS sku_code VARCHAR(5) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE taxonomy.techniques DROP COLUMN IF EXISTS sku_code;`);
    await queryRunner.query(`ALTER TABLE taxonomy.territories DROP COLUMN IF EXISTS sku_code;`);
    await queryRunner.query(`ALTER TABLE taxonomy.categories DROP COLUMN IF EXISTS sku_code;`);
  }
}
