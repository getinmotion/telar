import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterIdentityOneFieldsNullable1780600001000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }
}
