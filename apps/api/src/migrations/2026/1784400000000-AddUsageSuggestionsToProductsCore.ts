import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsageSuggestionsToProductsCore1784400000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ADD COLUMN IF NOT EXISTS usage_suggestions TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP COLUMN IF EXISTS usage_suggestions
        `);
    }

}
