import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLegacyProductSupportForBatchMigration1773320699876 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. COLUMNA: shop.products_core.legacy_product_id
        // ============================================
        // Almacena el UUID del producto legacy (shop.products.id) del cual fue
        // migrado. Permite tracking preciso y evitar duplicados en batch.

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'shop'
                      AND table_name   = 'products_core'
                      AND column_name  = 'legacy_product_id'
                ) THEN
                    ALTER TABLE shop.products_core
                    ADD COLUMN legacy_product_id UUID;

                    COMMENT ON COLUMN shop.products_core.legacy_product_id IS
                        'FK logica a shop.products(id). Tracking del producto legacy original.';
                END IF;
            END $$;
        `);

        // Índice parcial para búsquedas rápidas de "ya fue migrado?"
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_products_core_legacy_id
                ON shop.products_core(legacy_product_id)
                WHERE legacy_product_id IS NOT NULL
        `);

        // ============================================
        // 2. RELAJAR CHECK CONSTRAINTS
        // ============================================
        // El schema original usa CHECK (> 0) pero la migración batch necesita
        // poder insertar 0 (desconocido). Se relajan a CHECK (>= 0).
        // NULL sigue siendo válido y semánticamente significa "no aplica".

        // 2.1 product_production.production_time_days: de > 0 a >= 0
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.check_constraints cc
                    JOIN information_schema.constraint_column_usage ccu
                        ON cc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_schema = 'shop'
                      AND ccu.table_name   = 'product_production'
                      AND ccu.column_name  = 'production_time_days'
                      AND cc.check_clause LIKE '%> 0%'
                      AND cc.check_clause NOT LIKE '%>= 0%'
                ) THEN
                    ALTER TABLE shop.product_production
                        DROP CONSTRAINT IF EXISTS product_production_production_time_days_check;
                    ALTER TABLE shop.product_production
                        ADD CONSTRAINT product_production_production_time_days_check
                        CHECK (production_time_days >= 0);
                END IF;
            END $$;
        `);

        // 2.2 product_production.monthly_capacity: de > 0 a >= 0
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.check_constraints cc
                    JOIN information_schema.constraint_column_usage ccu
                        ON cc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_schema = 'shop'
                      AND ccu.table_name   = 'product_production'
                      AND ccu.column_name  = 'monthly_capacity'
                      AND cc.check_clause LIKE '%> 0%'
                      AND cc.check_clause NOT LIKE '%>= 0%'
                ) THEN
                    ALTER TABLE shop.product_production
                        DROP CONSTRAINT IF EXISTS product_production_monthly_capacity_check;
                    ALTER TABLE shop.product_production
                        ADD CONSTRAINT product_production_monthly_capacity_check
                        CHECK (monthly_capacity >= 0);
                END IF;
            END $$;
        `);

        // 2.3 product_physical_specs.real_weight_kg: de > 0 a >= 0
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.check_constraints cc
                    JOIN information_schema.constraint_column_usage ccu
                        ON cc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_schema = 'shop'
                      AND ccu.table_name   = 'product_physical_specs'
                      AND ccu.column_name  = 'real_weight_kg'
                      AND cc.check_clause LIKE '%> 0%'
                      AND cc.check_clause NOT LIKE '%>= 0%'
                ) THEN
                    ALTER TABLE shop.product_physical_specs
                        DROP CONSTRAINT IF EXISTS product_physical_specs_real_weight_kg_check;
                    ALTER TABLE shop.product_physical_specs
                        ADD CONSTRAINT product_physical_specs_real_weight_kg_check
                        CHECK (real_weight_kg >= 0);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. ELIMINAR ÍNDICE
        // ============================================

        await queryRunner.query(`
            DROP INDEX IF EXISTS shop.idx_products_core_legacy_id
        `);

        // ============================================
        // 2. ELIMINAR COLUMNA legacy_product_id
        // ============================================

        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP COLUMN IF EXISTS legacy_product_id
        `);

        // ============================================
        // 3. REVERTIR CHECK CONSTRAINTS A > 0
        // ============================================

        // 3.1 product_production.production_time_days: de >= 0 a > 0
        await queryRunner.query(`
            ALTER TABLE shop.product_production
                DROP CONSTRAINT IF EXISTS product_production_production_time_days_check;
            ALTER TABLE shop.product_production
                ADD CONSTRAINT product_production_production_time_days_check
                CHECK (production_time_days > 0);
        `);

        // 3.2 product_production.monthly_capacity: de >= 0 a > 0
        await queryRunner.query(`
            ALTER TABLE shop.product_production
                DROP CONSTRAINT IF EXISTS product_production_monthly_capacity_check;
            ALTER TABLE shop.product_production
                ADD CONSTRAINT product_production_monthly_capacity_check
                CHECK (monthly_capacity > 0);
        `);

        // 3.3 product_physical_specs.real_weight_kg: de >= 0 a > 0
        await queryRunner.query(`
            ALTER TABLE shop.product_physical_specs
                DROP CONSTRAINT IF EXISTS product_physical_specs_real_weight_kg_check;
            ALTER TABLE shop.product_physical_specs
                ADD CONSTRAINT product_physical_specs_real_weight_kg_check
                CHECK (real_weight_kg > 0);
        `);
    }

}
