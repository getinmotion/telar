import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanMediaWorkingTable1776970160998 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_media_working
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_media_working (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                artisan_id UUID NOT NULL,
                media_url TEXT NOT NULL,
                media_type TEXT NULL,
                is_primary BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // PASO 2: Agregar comentario a la tabla
        await queryRunner.query(`
            COMMENT ON TABLE artesanos.artisan_media_working IS 'Medios (fotos, videos) del trabajo/proceso del artesano - Espejo de shop.product_media';
        `);

        // PASO 3: Agregar FK constraint para artisan_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_working
            ADD CONSTRAINT fk_artisan_media_working_artisan
            FOREIGN KEY (artisan_id)
            REFERENCES artesanos.artisan_profile(id)
            ON DELETE CASCADE;
        `);

        // PASO 4: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_working_artisan_id
            ON artesanos.artisan_media_working(artisan_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_working_media_type
            ON artesanos.artisan_media_working(media_type);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_working_is_primary
            ON artesanos.artisan_media_working(is_primary);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_working_created_at
            ON artesanos.artisan_media_working(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_working_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_working_is_primary;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_working_media_type;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_working_artisan_id;
        `);

        // Eliminar FK constraint
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_working
            DROP CONSTRAINT IF EXISTS fk_artisan_media_working_artisan;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_media_working;
        `);
    }

}
