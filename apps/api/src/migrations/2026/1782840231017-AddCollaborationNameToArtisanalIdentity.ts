import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollaborationNameToArtisanalIdentity1782840231017 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            ADD COLUMN IF NOT EXISTS collaboration_name TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            DROP COLUMN IF EXISTS collaboration_name
        `);
    }

}
