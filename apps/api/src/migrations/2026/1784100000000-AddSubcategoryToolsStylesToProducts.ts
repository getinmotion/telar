import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Campos que el wizard captura pero no se persistían:
 * - subcategoría (categories con parent_id) en products_core
 * - herramientas usadas (paso 3) en product_production
 * - estilos múltiples (paso 2) en product_artisanal_identity
 *   (la columna `style` legacy conserva el primero)
 */
export class AddSubcategoryToolsStylesToProducts1784100000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ADD COLUMN IF NOT EXISTS subcategory_id UUID
        `);
        await queryRunner.query(`
            ALTER TABLE shop.product_production
            ADD COLUMN IF NOT EXISTS tools TEXT[]
        `);
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            ADD COLUMN IF NOT EXISTS styles TEXT[]
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP COLUMN IF EXISTS subcategory_id
        `);
        await queryRunner.query(`
            ALTER TABLE shop.product_production
            DROP COLUMN IF EXISTS tools
        `);
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            DROP COLUMN IF EXISTS styles
        `);
    }

}
