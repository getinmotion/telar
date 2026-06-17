import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSuggestProductsDraftTable1781545912448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla suggest_products_draft en el schema agents
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS agents.suggest_products_draft (
                id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                product_id              UUID NOT NULL,
                suggest_agent_step_1_2  JSONB DEFAULT '{}',
                suggest_agent_step_3_4  JSONB DEFAULT '{}',
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                -- Foreign key a shop.products_core
                CONSTRAINT fk_suggest_products_draft_product
                    FOREIGN KEY (product_id)
                    REFERENCES shop.products_core(id)
                    ON DELETE CASCADE
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_suggest_products_draft_product_id
            ON agents.suggest_products_draft (product_id)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_suggest_products_draft_created_at
            ON agents.suggest_products_draft (created_at DESC)
        `);

        // Trigger para actualizar updated_at automáticamente
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_suggest_products_draft_updated_at
            ON agents.suggest_products_draft
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_suggest_products_draft_updated_at
                BEFORE UPDATE ON agents.suggest_products_draft
                FOR EACH ROW
                EXECUTE FUNCTION agents.set_updated_at()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_suggest_products_draft_updated_at
            ON agents.suggest_products_draft CASCADE
        `);

        // Eliminar tabla
        await queryRunner.query(`
            DROP TABLE IF EXISTS agents.suggest_products_draft CASCADE
        `);
    }

}
