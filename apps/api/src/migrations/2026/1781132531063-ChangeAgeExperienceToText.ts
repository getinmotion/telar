import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAgeExperienceToText1781132531063 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cambiar age_experience de SMALLINT a TEXT
        // PostgreSQL convertirá automáticamente los valores existentes usando ::TEXT
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN age_experience TYPE TEXT
            USING age_experience::TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir de TEXT a SMALLINT
        // Esto solo funcionará si todos los valores de TEXT son números válidos
        await queryRunner.query(`
            ALTER TABLE artisans_knowledge.artisans_identity_one
            ALTER COLUMN age_experience TYPE SMALLINT
            USING age_experience::SMALLINT
        `);
    }

}
