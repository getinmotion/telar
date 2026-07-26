import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariantOptionsToShopProductVariants1783980000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_variants
            ADD COLUMN IF NOT EXISTS variant_name TEXT,
            ADD COLUMN IF NOT EXISTS option_values JSONB NOT NULL DEFAULT '{}'::jsonb,
            ADD COLUMN IF NOT EXISTS min_stock INTEGER NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_variants
            DROP COLUMN IF EXISTS variant_name,
            DROP COLUMN IF EXISTS option_values,
            DROP COLUMN IF EXISTS min_stock
        `);
    }

}
