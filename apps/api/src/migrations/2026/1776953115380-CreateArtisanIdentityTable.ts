import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanIdentityTable1776953115380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_identity
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_identity (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                technique_primary_id UUID NULL,
                technique_secondary_id UUID NULL,
                craft_message TEXT NULL,
                motivation TEXT NULL,
                uniqueness TEXT NULL,
                average_time TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // PASO 2: Agregar comentario a la tabla
        await queryRunner.query(`
            COMMENT ON TABLE artesanos.artisan_identity IS 'Información sobre la identidad artesanal, técnicas y mensajes del artesano';
        `);

        // PASO 3: Agregar FK constraint para technique_primary_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_identity
            ADD CONSTRAINT fk_artisan_identity_technique_primary
            FOREIGN KEY (technique_primary_id)
            REFERENCES taxonomy.techniques(id)
            ON DELETE SET NULL;
        `);

        // PASO 4: Agregar FK constraint para technique_secondary_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_identity
            ADD CONSTRAINT fk_artisan_identity_technique_secondary
            FOREIGN KEY (technique_secondary_id)
            REFERENCES taxonomy.techniques(id)
            ON DELETE SET NULL;
        `);

        // PASO 5: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_identity_technique_primary
            ON artesanos.artisan_identity(technique_primary_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_identity_technique_secondary
            ON artesanos.artisan_identity(technique_secondary_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_identity_created_at
            ON artesanos.artisan_identity(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_identity_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_identity_technique_secondary;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_identity_technique_primary;
        `);

        // Eliminar FK constraints
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_identity
            DROP CONSTRAINT IF EXISTS fk_artisan_identity_technique_secondary;
        `);

        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_identity
            DROP CONSTRAINT IF EXISTS fk_artisan_identity_technique_primary;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_identity;
        `);
    }

}
