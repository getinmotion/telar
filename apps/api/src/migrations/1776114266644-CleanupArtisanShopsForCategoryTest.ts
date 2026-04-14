import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupArtisanShopsForCategoryTest1776114266644 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando limpieza de artisan_shops para pruebas de categoría...\n');

        // PASO 1: Obtener los store_id únicos de los productos que quedaron
        console.log('🔍 Identificando tiendas que tienen productos...');
        const storesWithProducts = await queryRunner.query(`
            SELECT DISTINCT store_id
            FROM shop.products_core
            WHERE store_id IS NOT NULL
        `);

        const storeIdsToKeep = storesWithProducts.map((s: any) => s.store_id);

        if (storeIdsToKeep.length === 0) {
            console.log('⚠️  No hay tiendas con productos. No se eliminará nada.');
            return;
        }

        console.log(`✅ Se mantendrán ${storeIdsToKeep.length} tiendas que tienen productos`);

        // PASO 2: Obtener IDs de tiendas a eliminar (las que NO tienen productos)
        console.log('\n🔍 Identificando tiendas a eliminar...');
        const shopsToDelete = await queryRunner.query(`
            SELECT id FROM shop.artisan_shops
            WHERE id != ALL($1::uuid[])
        `, [storeIdsToKeep]);

        const shopIdsToDelete = shopsToDelete.map((s: any) => s.id);

        if (shopIdsToDelete.length === 0) {
            console.log('✅ No hay tiendas para eliminar');
            return;
        }

        console.log(`🗑️  Se eliminarán ${shopIdsToDelete.length} tiendas sin productos y sus relaciones`);

        // PASO 3: Eliminar registros de tablas relacionadas
        // Eliminar en orden para respetar las dependencias

        console.log('\n🗑️  Eliminando store_artisanal_profiles...');
        await queryRunner.query(`
            DELETE FROM shop.store_artisanal_profiles
            WHERE store_id = ANY($1::uuid[])
        `, [shopIdsToDelete]);

        console.log('🗑️  Eliminando store_contacts...');
        await queryRunner.query(`
            DELETE FROM shop.store_contacts
            WHERE store_id = ANY($1::uuid[])
        `, [shopIdsToDelete]);

        console.log('🗑️  Eliminando store_awards...');
        await queryRunner.query(`
            DELETE FROM shop.store_awards
            WHERE store_id = ANY($1::uuid[])
        `, [shopIdsToDelete]);

        console.log('🗑️  Eliminando store_badges...');
        await queryRunner.query(`
            DELETE FROM shop.store_badges
            WHERE store_id = ANY($1::uuid[])
        `, [shopIdsToDelete]);

        // PASO 4: Finalmente eliminar las tiendas principales
        console.log('🗑️  Eliminando artisan_shops...');
        await queryRunner.query(`
            DELETE FROM shop.artisan_shops
            WHERE id = ANY($1::uuid[])
        `, [shopIdsToDelete]);

        console.log(`\n🎉 Limpieza de tiendas completada:`);
        console.log(`   ✅ ${storeIdsToKeep.length} tiendas conservadas (tienen productos)`);
        console.log(`   ✅ ${shopIdsToDelete.length} tiendas eliminadas (sin productos)`);
        console.log(`   ℹ️  Solo quedan tiendas con productos activos`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  ADVERTENCIA: Esta migración no es reversible');
        console.log('⚠️  Los datos eliminados no pueden ser restaurados automáticamente');
        console.log('⚠️  Si necesitas revertir, restaura desde un backup de la base de datos');

        // No se puede revertir porque no guardamos los datos eliminados
        // Esta es una migración de limpieza para pruebas
    }

}
