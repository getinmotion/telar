import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayoutsTable1773368564717 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 0. ELIMINAR TABLA EXISTENTE (si existe)
        // ============================================

        await queryRunner.query(`
            DROP TABLE IF EXISTS payments.payouts CASCADE
        `);

        // ============================================
        // 1. CREAR TIPO ENUMERADO: payout_status
        // ============================================

        await queryRunner.query(`
            DROP TYPE IF EXISTS payments.payout_status CASCADE
        `);

        await queryRunner.query(`
            CREATE TYPE payments.payout_status AS ENUM ('initiated', 'processing', 'completed', 'failed')
        `);

        // ============================================
        // 2. CREAR TABLA: payments.payouts
        // ============================================

        await queryRunner.query(`
            CREATE TABLE payments.payouts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                checkout_id UUID NOT NULL REFERENCES payments.checkouts(id) ON DELETE RESTRICT,
                seller_shop_id UUID NOT NULL REFERENCES shop.stores(id) ON DELETE RESTRICT,
                percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
                currency CHAR(3) NOT NULL DEFAULT 'COP',
                amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
                status payments.payout_status NOT NULL DEFAULT 'initiated',
                external_movement_id TEXT UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        // ============================================
        // 3. COMENTARIOS EN LA TABLA
        // ============================================

        await queryRunner.query(`
            COMMENT ON COLUMN payments.payouts.external_movement_id IS
                'ID de movimiento externo de Cobre para tracking de dispersiones'
        `);

        // ============================================
        // 4. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
        // ============================================

        await queryRunner.query(`
            CREATE INDEX idx_payouts_checkout ON payments.payouts(checkout_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_payouts_seller_shop ON payments.payouts(seller_shop_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_payouts_status ON payments.payouts(status)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_payouts_created_at ON payments.payouts(created_at)
        `);

        // ============================================
        // 5. CREAR TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA
        // ============================================

        await queryRunner.query(`
            CREATE TRIGGER handle_updated_at_payouts
                BEFORE UPDATE ON payments.payouts
                FOR EACH ROW
                EXECUTE PROCEDURE moddatetime(updated_at)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. ELIMINAR TRIGGER
        // ============================================

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS handle_updated_at_payouts ON payments.payouts
        `);

        // ============================================
        // 2. ELIMINAR ÍNDICES
        // ============================================

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_payouts_created_at
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_payouts_status
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_payouts_seller_shop
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS payments.idx_payouts_checkout
        `);

        // ============================================
        // 3. ELIMINAR TABLA
        // ============================================

        await queryRunner.query(`
            DROP TABLE IF EXISTS payments.payouts CASCADE
        `);

        // ============================================
        // 4. ELIMINAR TIPO ENUMERADO
        // ============================================

        await queryRunner.query(`
            DROP TYPE IF EXISTS payments.payout_status CASCADE
        `);
    }

}
