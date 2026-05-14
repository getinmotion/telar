import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisanMaterialsTable1776954680419 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASO 1: Crear la tabla artisan_materials
        await queryRunner.query(`
            CREATE TABLE artesanos.artisan_materials (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                artisan_id UUID NOT NULL,
                material_id UUID NOT NULL,
                is_primary BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // PASO 2: Agregar comentario a la tabla
        await queryRunner.query(`
            COMMENT ON TABLE artesanos.artisan_materials IS 'Tabla intermedia (many-to-many) entre artisan_profile y materials';
        `);

        // PASO 3: Agregar FK constraint para artisan_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            ADD CONSTRAINT fk_artisan_materials_artisan
            FOREIGN KEY (artisan_id)
            REFERENCES artesanos.artisan_profile(id)
            ON DELETE CASCADE;
        `);

        // PASO 4: Agregar FK constraint para material_id
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            ADD CONSTRAINT fk_artisan_materials_material
            FOREIGN KEY (material_id)
            REFERENCES taxonomy.materials(id)
            ON DELETE CASCADE;
        `);

        // PASO 5: Agregar UNIQUE constraint para evitar duplicados
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            ADD CONSTRAINT uq_artisan_materials_artisan_material
            UNIQUE (artisan_id, material_id);
        `);

        // PASO 6: Crear índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX idx_artisan_materials_artisan_id
            ON artesanos.artisan_materials(artisan_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_materials_material_id
            ON artesanos.artisan_materials(material_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_materials_is_primary
            ON artesanos.artisan_materials(is_primary);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_artisan_materials_created_at
            ON artesanos.artisan_materials(created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_materials_created_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_materials_is_primary;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_materials_material_id;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_materials_artisan_id;
        `);

        // Eliminar UNIQUE constraint
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            DROP CONSTRAINT IF EXISTS uq_artisan_materials_artisan_material;
        `);

        // Eliminar FK constraints
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            DROP CONSTRAINT IF EXISTS fk_artisan_materials_material;
        `);

        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_materials
            DROP CONSTRAINT IF EXISTS fk_artisan_materials_artisan;
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS artesanos.artisan_materials;
        `);
    }

}
