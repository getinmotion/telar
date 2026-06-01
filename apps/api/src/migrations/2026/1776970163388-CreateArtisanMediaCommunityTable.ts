import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanMediaCommunityTable1776970163388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_media_community
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_media_community (
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
            COMMENT ON TABLE artesanos.artisan_media_community IS 'Medios (fotos, videos) de la comunidad del artesano - Espejo de shop.product_media';
        `);

        // PASO 3: Agregar FK constraint para artisan_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_community
            ADD CONSTRAINT fk_artisan_media_community_artisan
            FOREIGN KEY (artisan_id)
            REFERENCES artesanos.artisan_profile(id)
            ON DELETE CASCADE;
        `);

        // PASO 4: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_community_artisan_id
            ON artesanos.artisan_media_community(artisan_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_community_media_type
            ON artesanos.artisan_media_community(media_type);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_community_is_primary
            ON artesanos.artisan_media_community(is_primary);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_community_created_at
            ON artesanos.artisan_media_community(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_community_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_community_is_primary;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_community_media_type;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_community_artisan_id;
        `);

        // Eliminar FK constraint
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_community
            DROP CONSTRAINT IF EXISTS fk_artisan_media_community_artisan;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_media_community;
        `);
    }

}
