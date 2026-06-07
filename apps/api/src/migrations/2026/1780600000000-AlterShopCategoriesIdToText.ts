import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterShopCategoriesIdToText1780600000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop FK constraint on shop_categories_id (auto-named by Postgres)
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            DROP CONSTRAINT IF EXISTS artisans_identity_one_shop_categories_id_fkey
        `);

        // Change shop_categories_id from UUID to TEXT (comma-separated UUIDs)
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN shop_categories_id TYPE TEXT,
            ALTER COLUMN shop_categories_id DROP NOT NULL
        `);

        // Make remaining identity fields nullable (they are optional in the form)
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN shop_history DROP NOT NULL,
            ALTER COLUMN shop_description DROP NOT NULL,
            ALTER COLUMN shop_definition DROP NOT NULL,
            ALTER COLUMN shop_special_definition_one DROP NOT NULL,
            ALTER COLUMN shop_born_special_definition_one DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN shop_history SET NOT NULL,
            ALTER COLUMN shop_description SET NOT NULL,
            ALTER COLUMN shop_definition SET NOT NULL,
            ALTER COLUMN shop_special_definition_one SET NOT NULL,
            ALTER COLUMN shop_born_special_definition_one SET NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN shop_categories_id SET NOT NULL,
            ALTER COLUMN shop_categories_id TYPE UUID USING shop_categories_id::UUID
        `);

        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ADD CONSTRAINT artisans_identity_one_shop_categories_id_fkey
            FOREIGN KEY (shop_categories_id) REFERENCES taxonomy.categories(id)
        `);
    }
}
