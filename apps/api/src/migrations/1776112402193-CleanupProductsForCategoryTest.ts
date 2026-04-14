import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupProductsForCategoryTest1776112402193 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando limpieza de productos para pruebas de categoría...\n');

        const targetCategoryId = 'bd7ad736-f942-4ae6-a748-761e6a97c9b4';
        const productsToUpdate = [
            '8de2d5af-c4c8-4f1d-aa54-804112efd441',
            '7288f55b-02d9-40db-8600-2b8f872866db',
            '1f9973c5-2e01-4fb3-8aa9-b704897e009f'
        ];

        // PASO 1: Actualizar los 3 productos específicos a la nueva categoría
        console.log('📝 Actualizando 3 productos a la categoría objetivo...');
        await queryRunner.query(`
            UPDATE shop.products_core
            SET category_id = $1
            WHERE id = ANY($2::uuid[])
        `, [targetCategoryId, productsToUpdate]);
        console.log('✅ Productos actualizados');

        // PASO 2: Obtener IDs de productos a eliminar (los que NO tienen la categoría objetivo ni NULL)
        console.log('\n🔍 Identificando productos a eliminar...');
        const productsToDelete = await queryRunner.query(`
            SELECT id FROM shop.products_core
            WHERE category_id IS NULL
            OR category_id != $1
        `, [targetCategoryId]);

        const idsToDelete = productsToDelete.map((p: any) => p.id);

        if (idsToDelete.length === 0) {
            console.log('✅ No hay productos para eliminar');
            return;
        }

        console.log(`🗑️  Se eliminarán ${idsToDelete.length} productos y sus relaciones`);

        // PASO 3: Eliminar registros de tablas relacionadas
        // Eliminar en orden para respetar las dependencias

        // IMPORTANTE: Eliminar cart_items primero (tiene FK a products_core)
        console.log('\n🗑️  Eliminando cart_items (payments schema)...');
        await queryRunner.query(`
            DELETE FROM payments.cart_items
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_embeddings...');
        await queryRunner.query(`
            DELETE FROM shop.product_embeddings
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_media...');
        await queryRunner.query(`
            DELETE FROM shop.product_media
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_badges...');
        await queryRunner.query(`
            DELETE FROM shop.product_badges
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_materials_link...');
        await queryRunner.query(`
            DELETE FROM shop.product_materials_link
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_variants...');
        await queryRunner.query(`
            DELETE FROM shop.product_variants
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_moderation_history...');
        await queryRunner.query(`
            DELETE FROM shop.product_moderation_history
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_artisanal_identity...');
        await queryRunner.query(`
            DELETE FROM shop.product_artisanal_identity
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_physical_specs...');
        await queryRunner.query(`
            DELETE FROM shop.product_physical_specs
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_logistics...');
        await queryRunner.query(`
            DELETE FROM shop.product_logistics
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log('🗑️  Eliminando product_production...');
        await queryRunner.query(`
            DELETE FROM shop.product_production
            WHERE product_id = ANY($1::uuid[])
        `, [idsToDelete]);

        // PASO 4: Finalmente eliminar los productos principales
        console.log('🗑️  Eliminando products_core...');
        await queryRunner.query(`
            DELETE FROM shop.products_core
            WHERE id = ANY($1::uuid[])
        `, [idsToDelete]);

        console.log(`\n🎉 Limpieza completada:`);
        console.log(`   ✅ 3 productos actualizados a categoría ${targetCategoryId}`);
        console.log(`   ✅ ${idsToDelete.length} productos eliminados con sus relaciones`);
        console.log(`   ℹ️  Solo quedan productos con category_id = ${targetCategoryId} o NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  ADVERTENCIA: Esta migración no es reversible');
        console.log('⚠️  Los datos eliminados no pueden ser restaurados automáticamente');
        console.log('⚠️  Si necesitas revertir, restaura desde un backup de la base de datos');

        // No se puede revertir porque no guardamos los datos eliminados
        // Esta es una migración de limpieza para pruebas
    }

}
