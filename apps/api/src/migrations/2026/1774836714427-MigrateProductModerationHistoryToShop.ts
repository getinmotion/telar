import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateProductModerationHistoryToShop1774836714427 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Paso 1: Crear la nueva tabla en el schema shop
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS shop.product_moderation_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id UUID NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                moderator_id UUID,
                artisan_id UUID,
                comment TEXT,
                edits_made JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT fk_product_moderation_history_product
                    FOREIGN KEY (product_id)
                    REFERENCES shop.products_core(id)
                    ON DELETE CASCADE
            );
        `);

        // Paso 2: Crear índices
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_moderation_history_product_id
            ON shop.product_moderation_history(product_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_product_moderation_history_created_at
            ON shop.product_moderation_history(created_at);
        `);

        // Paso 3: Migrar datos de public.product_moderation_history a shop.product_moderation_history
        // Usamos el mapeo legacy_product_id → id de products_core
        await queryRunner.query(`
            INSERT INTO shop.product_moderation_history (
                id,
                product_id,
                previous_status,
                new_status,
                moderator_id,
                artisan_id,
                comment,
                edits_made,
                created_at
            )
            SELECT
                pmh.id,
                pc.id AS product_id,  -- Nuevo ID del producto en products_core
                pmh.previous_status,
                pmh.new_status,
                pmh.moderator_id,
                pmh.artisan_id,
                pmh.comment,
                pmh.edits_made,
                pmh.created_at
            FROM public.product_moderation_history pmh
            INNER JOIN shop.products_core pc
                ON pc.legacy_product_id = pmh.product_id  -- Mapeo usando legacy_product_id
            WHERE pmh.product_id IS NOT NULL
            ON CONFLICT (id) DO NOTHING;  -- Evitar duplicados si se ejecuta múltiples veces
        `);

        // Paso 4: Registrar cuántos registros se migraron
        const result = await queryRunner.query(`
            SELECT COUNT(*) as total FROM shop.product_moderation_history;
        `);
        console.log(`✅ Migrados ${result[0].total} registros de moderación a shop.product_moderation_history`);

        // Nota: NO eliminamos la tabla public.product_moderation_history por seguridad
        // Puedes eliminarla manualmente después de verificar que todo está correcto
        console.log(`⚠️  La tabla public.product_moderation_history aún existe como backup`);
        console.log(`   Verifica los datos y elimínala manualmente si es necesario con:`);
        console.log(`   DROP TABLE public.product_moderation_history CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback: Eliminar la tabla creada en shop
        await queryRunner.query(`
            DROP TABLE IF EXISTS shop.product_moderation_history CASCADE;
        `);

        console.log(`✅ Tabla shop.product_moderation_history eliminada`);
        console.log(`⚠️  Los datos siguen en public.product_moderation_history (tabla original)`);
    }

}
