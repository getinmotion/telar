import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStyleIdToProductArtisanalIdentity1780200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.product_artisanal_identity
        ADD COLUMN IF NOT EXISTS style_id UUID
          REFERENCES taxonomy.styles(id) ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_artisanal_identity_style_id
        ON shop.product_artisanal_identity (style_id)
        WHERE style_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_product_artisanal_identity_style_id;
    `);
    await queryRunner.query(`
      ALTER TABLE shop.product_artisanal_identity DROP COLUMN IF EXISTS style_id;
    `);
  }
}
