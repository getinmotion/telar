import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketplaceAssignmentsTable1779500003000 implements MigrationInterface {
  name = 'CreateMarketplaceAssignmentsTable1779500003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS marketplace`);

    await queryRunner.query(`
      CREATE TABLE marketplace.marketplace_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        marketplace_key TEXT NOT NULL CHECK (marketplace_key IN ('premium', 'regional', 'sponsor', 'hotel', 'design')),
        assigned_by UUID,
        assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        removed_at TIMESTAMP WITH TIME ZONE,
        removal_reason TEXT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_marketplace_assignments_product ON marketplace.marketplace_assignments (product_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_marketplace_assignments_key ON marketplace.marketplace_assignments (marketplace_key)
      WHERE removed_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS marketplace.marketplace_assignments`);
  }
}
