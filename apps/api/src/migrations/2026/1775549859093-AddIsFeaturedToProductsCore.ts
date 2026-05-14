import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsFeaturedToProductsCore1775549859093 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Agregando columna is_featured a shop.products_core...\n');

        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
        `);

        console.log('✅ shop.products_core - Columna is_featured agregada');
        console.log('🎉 Migración completada: La tabla products_core ahora tiene el campo is_featured');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo: Eliminando columna is_featured de shop.products_core...\n');

        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP COLUMN IF EXISTS is_featured;
        `);

        console.log('✅ shop.products_core - Columna is_featured eliminada');
        console.log('🔄 Rollback completado');
    }

}
