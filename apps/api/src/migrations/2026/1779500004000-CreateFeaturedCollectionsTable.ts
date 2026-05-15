import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeaturedCollectionsTable1779500004000 implements MigrationInterface {
  name = 'CreateFeaturedCollectionsTable1779500004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE marketplace.featured_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        marketplace_key TEXT NOT NULL CHECK (marketplace_key IN ('premium', 'regional', 'sponsor', 'hotel', 'design')),
        product_ids JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        display_order INTEGER NOT NULL DEFAULT 0,
        curated_by UUID,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_featured_collections_marketplace ON marketplace.featured_collections (marketplace_key, display_order)
      WHERE is_active = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS marketplace.featured_collections`);
  }
}
