import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUniqueTechniquesConstraint1781215524658 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el constraint antiguo que no permite ambos NULL
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            DROP CONSTRAINT IF EXISTS check_unique_techniques_product
        `);

        // Crear el nuevo constraint que permite ambos NULL o asegura que sean diferentes
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            ADD CONSTRAINT check_unique_techniques_product CHECK (
                primary_technique_id IS NULL
                OR secondary_technique_id IS NULL
                OR primary_technique_id <> secondary_technique_id
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el constraint nuevo
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            DROP CONSTRAINT IF EXISTS check_unique_techniques_product
        `);

        // Restaurar el constraint original (que no permitía ambos NULL)
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            ADD CONSTRAINT check_unique_techniques_product CHECK (
                primary_technique_id IS DISTINCT FROM secondary_technique_id
            )
        `);
    }

}
