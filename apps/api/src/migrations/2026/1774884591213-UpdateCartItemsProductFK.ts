import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCartItemsProductFK1774884591213 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Actualizando FK de cart_items de products a products_core...');

        // 1. Verificar cuántos registros hay en cart_items
        const countResult = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM payments.cart_items
        `);
        console.log(`📊 Registros en cart_items: ${countResult[0].count}`);

        // 2. Eliminar la FK antigua a public.products PRIMERO
        console.log('🗑️  Eliminando FK antigua...');
        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            DROP CONSTRAINT IF EXISTS "cart_items_product_id_fkey"
        `);

        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            DROP CONSTRAINT IF EXISTS "FK_9e59bf0c88a2138a7b7b82dc52b"
        `);

        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            DROP CONSTRAINT IF EXISTS "fk_cart_items_product_id"
        `);

        // 3. Actualizar product_id para que apunte a los IDs de products_core
        // usando legacy_product_id como mapeo
        if (countResult[0].count > 0) {
            console.log('🔄 Mapeando product_id a products_core...');

            const updateResult = await queryRunner.query(`
                UPDATE payments.cart_items ci
                SET product_id = pc.id
                FROM shop.products_core pc
                WHERE pc.legacy_product_id = ci.product_id
            `);

            console.log(`✅ ${updateResult[1]} registros actualizados`);

            // Verificar si quedaron registros sin mapear
            const unmappedResult = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM payments.cart_items ci
                LEFT JOIN shop.products_core pc ON pc.id = ci.product_id
                WHERE pc.id IS NULL
            `);

            if (unmappedResult[0].count > 0) {
                console.warn(`⚠️  ${unmappedResult[0].count} registros no pudieron ser mapeados`);

                // Mostrar algunos registros problemáticos
                const problematicRecords = await queryRunner.query(`
                    SELECT ci.id, ci.product_id
                    FROM payments.cart_items ci
                    LEFT JOIN shop.products_core pc ON pc.id = ci.product_id
                    WHERE pc.id IS NULL
                    LIMIT 5
                `);
                console.log('📋 Registros problemáticos:', problematicRecords);
            }
        }

        // 4. Crear la nueva FK apuntando a shop.products_core
        console.log('✨ Creando nueva FK a shop.products_core...');
        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            ADD CONSTRAINT fk_cart_items_products_core
            FOREIGN KEY (product_id) REFERENCES shop.products_core(id)
            ON DELETE RESTRICT
        `);

        console.log('🎉 Migración completada exitosamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo cambios en cart_items...');

        // 1. Eliminar la FK a products_core
        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            DROP CONSTRAINT IF EXISTS fk_cart_items_products_core
        `);

        // 2. Restaurar la FK a public.products
        await queryRunner.query(`
            ALTER TABLE payments.cart_items
            ADD CONSTRAINT "FK_9e59bf0c88a2138a7b7b82dc52b"
            FOREIGN KEY (product_id) REFERENCES public.products(id)
            ON DELETE RESTRICT
        `);

        // 3. Revertir el mapeo de product_id (de products_core a products)
        // usando legacy_product_id
        await queryRunner.query(`
            UPDATE payments.cart_items ci
            SET product_id = pc.legacy_product_id
            FROM shop.products_core pc
            WHERE pc.id = ci.product_id
              AND pc.legacy_product_id IS NOT NULL
        `);

        console.log('✅ Rollback completado');
    }

}
