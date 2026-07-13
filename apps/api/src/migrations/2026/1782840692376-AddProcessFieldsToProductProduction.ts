import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProcessFieldsToProductProduction1782840692376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_production
            ADD COLUMN IF NOT EXISTS process_description TEXT,
            ADD COLUMN IF NOT EXISTS process_evidence_urls JSONB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_production
            DROP COLUMN IF EXISTS process_description,
            DROP COLUMN IF EXISTS process_evidence_urls
        `);
    }

}
