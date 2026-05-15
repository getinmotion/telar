import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToCrafts1779210000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE taxonomy.crafts
        ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES taxonomy.categories(id) ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_crafts_category
        ON taxonomy.crafts (category_id) WHERE category_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS taxonomy.idx_crafts_category;`);
    await queryRunner.query(`ALTER TABLE taxonomy.crafts DROP COLUMN IF EXISTS category_id;`);
  }
}
