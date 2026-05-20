import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanOriginTable1776896197349 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_origin (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                origin_story TEXT NULL,
                cultural_story TEXT NULL,
                main_story TEXT NULL,
                cultural_meaning TEXT NULL,
                learned_from_detail TEXT NULL,
                ancestral_knowledge TEXT NULL,
                learned_from TEXT NULL,
                start_age SMALLINT NULL,
                ethnic_relation TEXT NULL,
                artisan_quote TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Agregar comentario a la tabla
        await queryRunner.query(`
            COMMENT ON TABLE artesanos.artisan_origin IS 'Información sobre el origen, historia cultural y relatos del artesano';
        `);

        // Agregar índice en created_at para ordenamiento
        await queryRunner.query(`
            CREATE INDEX idx_artisan_origin_created_at ON artesanos.artisan_origin(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS artesanos.idx_artisan_origin_created_at;`);
        await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_origin;`);
    }

}
