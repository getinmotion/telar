import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanTerritorialTable1776970940108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_territorial
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_territorial (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                territorial_id UUID NOT NULL,
                territorial_importance TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // PASO 2: Agregar comentario a la tabla
        await queryRunner.query(`
            COMMENT ON TABLE artesanos.artisan_territorial IS 'Relación entre artesanos y territorios con importancia territorial';
        `);

        // PASO 3: Agregar FK constraint para territorial_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_territorial
            ADD CONSTRAINT fk_artisan_territorial_territory
            FOREIGN KEY (territorial_id)
            REFERENCES taxonomy.territories(id)
            ON DELETE CASCADE;
        `);

        // PASO 4: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_territorial_territorial_id
            ON artesanos.artisan_territorial(territorial_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_territorial_created_at
            ON artesanos.artisan_territorial(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_territorial_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_territorial_territorial_id;
        `);

        // Eliminar FK constraint
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_territorial
            DROP CONSTRAINT IF EXISTS fk_artisan_territorial_territory;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_territorial;
        `);
    }

}
