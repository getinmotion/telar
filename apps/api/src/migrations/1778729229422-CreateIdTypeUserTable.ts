import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIdTypeUserTable1778729229422 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create id_type_user table in taxonomy schema
        await queryRunner.query(`
            CREATE TABLE taxonomy.id_type_user (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                id_type_value VARCHAR(4) NOT NULL UNIQUE,
                type_name TEXT NOT NULL,
                countries_id UUID NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_id_type_user_country
                    FOREIGN KEY (countries_id)
                    REFERENCES taxonomy.countries(id)
                    ON DELETE RESTRICT
            );
        `);

        // Create index on countries_id for better query performance
        await queryRunner.query(`
            CREATE INDEX idx_id_type_user_countries_id
            ON taxonomy.id_type_user (countries_id);
        `);

        // Insert initial records for Colombia
        const countryId = 'cc009419-7cf8-4bea-ba7b-5bbb0ab311c6';

        const idTypes = [
            { value: 'RC', name: 'Registro civil' },
            { value: 'CC', name: 'Cédula de ciudadanía' },
            { value: 'DNI', name: 'Documento nacional de identidad' },
            { value: 'TI', name: 'Tarjeta de identidad' },
            { value: 'TE', name: 'Tarjeta de extranjería' },
            { value: 'CE', name: 'Cédula de extranjería' },
            { value: 'NIT', name: 'Número de identificación tributaria' },
            { value: 'PP', name: 'Pasaporte' },
        ];

        for (const idType of idTypes) {
            await queryRunner.query(`
                INSERT INTO taxonomy.id_type_user (id_type_value, type_name, countries_id)
                VALUES ($1, $2, $3);
            `, [idType.value, idType.name, countryId]);
        }

        console.log('✅ Created id_type_user table with 8 initial records');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`
            DROP INDEX IF EXISTS taxonomy.idx_id_type_user_countries_id;
        `);

        // Drop table
        await queryRunner.query(`
            DROP TABLE IF EXISTS taxonomy.id_type_user;
        `);

        console.log('✅ Reverted id_type_user table creation');
    }

}
