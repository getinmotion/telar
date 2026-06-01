import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanMediaFamilyTable1776969255691 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_media_family
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_media_family (
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
            COMMENT ON TABLE artesanos.artisan_media_family IS 'Medios (fotos, videos) de la familia del artesano - Espejo de shop.product_media';
        `);

        // PASO 3: Agregar FK constraint para artisan_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_family
            ADD CONSTRAINT fk_artisan_media_family_artisan
            FOREIGN KEY (artisan_id)
            REFERENCES artesanos.artisan_profile(id)
            ON DELETE CASCADE;
        `);

        // PASO 4: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_family_artisan_id
            ON artesanos.artisan_media_family(artisan_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_family_media_type
            ON artesanos.artisan_media_family(media_type);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_family_is_primary
            ON artesanos.artisan_media_family(is_primary);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_media_family_created_at
            ON artesanos.artisan_media_family(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_family_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_family_is_primary;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_family_media_type;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_media_family_artisan_id;
        `);

        // Eliminar FK constraint
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_media_family
            DROP CONSTRAINT IF EXISTS fk_artisan_media_family_artisan;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_media_family;
        `);
    }

}
