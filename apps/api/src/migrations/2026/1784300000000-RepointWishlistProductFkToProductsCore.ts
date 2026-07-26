import { MigrationInterface, QueryRunner } from "typeorm";

export class RepointWishlistProductFkToProductsCore1784300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // El marketplace usa shop.products_core; la FK a la tabla legacy
        // shop.products impedía guardar cualquier producto en favoritos.
        await queryRunner.query(`
            ALTER TABLE shop.wishlist
            DROP CONSTRAINT IF EXISTS fk_wishlist_product
        `);
        await queryRunner.query(`
            ALTER TABLE shop.wishlist
            ADD CONSTRAINT fk_wishlist_product
            FOREIGN KEY (product_id) REFERENCES shop.products_core(id)
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE shop.wishlist
            DROP CONSTRAINT IF EXISTS fk_wishlist_product
        `);
        await queryRunner.query(`
            ALTER TABLE shop.wishlist
            ADD CONSTRAINT fk_wishlist_product
            FOREIGN KEY (product_id) REFERENCES shop.products(id)
            ON DELETE CASCADE
        `);
    }

}
