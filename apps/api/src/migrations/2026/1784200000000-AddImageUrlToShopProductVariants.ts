import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToShopProductVariants1784200000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_variants
            ADD COLUMN IF NOT EXISTS image_url TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_variants
            DROP COLUMN IF EXISTS image_url
        `);
    }

}
