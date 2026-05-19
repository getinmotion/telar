import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaxonomyAliasesTable1779500002000 implements MigrationInterface {
  name = 'CreateTaxonomyAliasesTable1779500002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE taxonomy.taxonomy_aliases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_id UUID NOT NULL,
        canonical_type TEXT NOT NULL CHECK (canonical_type IN ('material', 'craft', 'technique', 'style')),
        alias_name TEXT NOT NULL,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_taxonomy_aliases_canonical ON taxonomy.taxonomy_aliases (canonical_id, canonical_type)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_taxonomy_aliases_name ON taxonomy.taxonomy_aliases (alias_name)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.taxonomy_aliases`);
  }
}
