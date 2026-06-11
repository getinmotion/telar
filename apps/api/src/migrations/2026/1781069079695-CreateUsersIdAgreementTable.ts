import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersIdAgreementTable1781069079695 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla users_id_agreement en el schema auth
        await queryRunner.query(`
            CREATE TABLE auth.users_id_agreement (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                id_type UUID NOT NULL REFERENCES taxonomy.id_type_user(id),
                num_id TEXT NOT NULL,
                agreement_id UUID NOT NULL REFERENCES taxonomy.agreements(id),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL
            )
        `);

        // Crear índices para mejorar rendimiento
        await queryRunner.query(`CREATE INDEX idx_users_id_agreement_id_type ON auth.users_id_agreement(id_type)`);
        await queryRunner.query(`CREATE INDEX idx_users_id_agreement_agreement ON auth.users_id_agreement(agreement_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar tabla
        await queryRunner.query(`DROP TABLE IF EXISTS auth.users_id_agreement CASCADE`);
    }

}
