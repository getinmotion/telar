import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInfoBuyerIdentityTable1778530766958 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create schema if not exists
        // await queryRunner.query(`
        //     CREATE SCHEMA IF NOT EXISTS "digital_identity";
        // `);

        // Create info-buyer-identity table
        await queryRunner.query(`
            CREATE TABLE "digital_identity"."info-buyer-identity" (
                "id" SERIAL PRIMARY KEY,
                "product_id" UUID NOT NULL,
                "sku_product" TEXT NOT NULL,
                "email" VARCHAR(255) NULL,
                "nombre_completo" VARCHAR(255) NULL,
                "celular" VARCHAR(50) NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create index on product_id for better query performance
        await queryRunner.query(`
            CREATE INDEX "idx_info_buyer_identity_product_id"
            ON "digital_identity"."info-buyer-identity" ("product_id");
        `);

        // Create index on sku_product
        await queryRunner.query(`
            CREATE INDEX "idx_info_buyer_identity_sku_product"
            ON "digital_identity"."info-buyer-identity" ("sku_product");
        `);

        // Insert 15 initial records
        const productId = '669011ce-b72c-4956-9857-37971f7ab753';
        const skuProduct = 'PROD-1765924410340';

        for (let i = 1; i <= 15; i++) {
            await queryRunner.query(`
                INSERT INTO "digital_identity"."info-buyer-identity"
                (product_id, sku_product, email, nombre_completo, celular)
                VALUES ($1, $2, NULL, NULL, NULL);
            `, [productId, skuProduct]);
        }

        console.log('✅ Created info-buyer-identity table with 15 initial records');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS "digital_identity"."idx_info_buyer_identity_sku_product";
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "digital_identity"."idx_info_buyer_identity_product_id";
        `);

        // Drop table
        await queryRunner.query(`
            DROP TABLE IF EXISTS "digital_identity"."info-buyer-identity";
        `);

        console.log('✅ Reverted info-buyer-identity table creation');
    }

}
