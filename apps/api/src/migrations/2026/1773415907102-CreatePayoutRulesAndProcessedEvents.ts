import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayoutRulesAndProcessedEvents1773415907102 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. CREAR TABLA: payments.payout_rules
        // ============================================
        // Reglas de dispersión por tienda o regla global

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS payments.payout_rules (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                shop_id UUID NULL REFERENCES shop.stores(id) ON DELETE CASCADE,
                trigger_event TEXT NOT NULL DEFAULT 'checkout_paid'
                    CHECK (trigger_event IN ('checkout_paid', 'order_delivered', 'manual')),
                percentage NUMERIC(5,2) NOT NULL DEFAULT 50.00
                    CHECK (percentage > 0 AND percentage <= 100),
                delay_hours INTEGER NOT NULL DEFAULT 0
                    CHECK (delay_hours >= 0),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // ============================================
        // 2. CREAR ÍNDICE PARCIAL PARA BÚSQUEDAS
        // ============================================
        // Índice optimizado para búsquedas de reglas activas

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_payout_rules_lookup
                ON payments.payout_rules (shop_id, trigger_event, is_active)
                WHERE is_active = true
        `);

        // ============================================
        // 3. CREAR TABLA: payments.processed_events
        // ============================================
        // Tabla de idempotencia para evitar procesar eventos duplicados

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS payments.processed_events (
                event_id TEXT PRIMARY KEY,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // ============================================
        // 4. CREAR ÍNDICE PARA BÚSQUEDA DE EVENTOS
        // ============================================

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_processed_events_created_at
                ON payments.processed_events (created_at)
        `);

        // ============================================
        // 5. CREAR TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA
        // ============================================

        await queryRunner.query(`
            CREATE TRIGGER handle_updated_at_payout_rules
                BEFORE UPDATE ON payments.payout_rules
                FOR EACH ROW
                EXECUTE PROCEDURE moddatetime(updated_at)
        `);

        // ============================================
        // 6. INSERTAR REGLA GLOBAL POR DEFECTO
        // ============================================
        // Regla global: 50% de dispersión inmediata al confirmar pago

        await queryRunner.query(`
            INSERT INTO payments.payout_rules (shop_id, trigger_event, percentage, delay_hours, is_active)
            VALUES (NULL, 'checkout_paid', 50.00, 0, true)
            ON CONFLICT DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. ELIMINAR TRIGGER
        // ============================================

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS handle_updated_at_payout_rules ON payments.payout_rules
        `);

        // ============================================
        // 2. ELIMINAR ÍNDICES
        // ============================================

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_processed_events_created_at
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_payout_rules_lookup
        `);

        // ============================================
        // 3. ELIMINAR TABLAS
        // ============================================

        await queryRunner.query(`
            DROP TABLE IF EXISTS payments.processed_events CASCADE
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS payments.payout_rules CASCADE
        `);
    }

}
