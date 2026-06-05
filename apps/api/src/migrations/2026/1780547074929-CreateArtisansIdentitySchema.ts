import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArtisansIdentitySchema1780547074929 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear el schema artisans_knowledge
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS artisans_knowledge`);

        // 2. Crear tabla artisans_knowledge|
        await queryRunner.query(`
            CREATE TABLE artisans_knowledge.artisans_identity_one (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name_shop TEXT NOT NULL,
                artisan_history TEXT NOT NULL,
                age_experience SMALLINT NOT NULL,
                shop_history TEXT NOT NULL,
                shop_description TEXT NOT NULL,
                shop_definition TEXT NOT NULL,
                shop_categories_id UUID NOT NULL REFERENCES taxonomy.categories(id),
                shop_special_definition_one TEXT NOT NULL,
                shop_special_definition_two TEXT NULL,
                shop_special_definition_three TEXT NULL,
                shop_born_special_definition_one TEXT NOT NULL,
                shop_born_special_definition_two TEXT NULL,
                shop_born_special_definition_three TEXT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL
            )
        `);

        // 3. Crear tabla artisans_commercial_two
        await queryRunner.query(`
            CREATE TABLE artisans_knowledge.artisans_commercial_two (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                shop_range_payment TEXT NOT NULL,
                shop_knowledge_cost TEXT NOT NULL,
                shop_knowledge_define_cost TEXT NOT NULL,
                shop_knowledge_is_profitable TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL
            )
        `);

        // 4. Crear tabla artisans_client_market_three
        await queryRunner.query(`
            CREATE TABLE artisans_knowledge.artisans_client_market_three (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                shop_knowledge_main_buyer_one TEXT NOT NULL,
                shop_knowledge_main_buyer_two TEXT NULL,
                shop_knowledge_main_buyer_three TEXT NULL,
                shop_knowledge_digital_presence TEXT NOT NULL,
                shop_knowledge_where_sale_one TEXT NOT NULL,
                shop_knowledge_where_sale_two TEXT NULL,
                shop_knowledge_where_sale_three TEXT NULL,
                shop_knowledge_sales_activity TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL
            )
        `);

        // 5. Crear tabla artisans_operation_growth_four
        await queryRunner.query(`
            CREATE TABLE artisans_knowledge.artisans_operation_growth_four (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                shop_knowledge_products_make_month TEXT NOT NULL,
                shop_knowledge_limit_today_one TEXT NOT NULL,
                shop_knowledge_limit_today_two TEXT NULL,
                shop_knowledge_limit_today_three TEXT NULL,
                shop_many_workers TEXT NOT NULL,
                shop_first_solving_telar TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL
            )
        `);

        // 6. Crear tabla artisans_identity_profile (maestra que recopila todas las anteriores)
        await queryRunner.query(`
            CREATE TABLE artisans_knowledge.artisans_identity_profile (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES auth.users(id),
                artisans_identity_id UUID NULL REFERENCES artisans_knowledge.artisans_identity_one(id),
                artisans_commercial_id UUID NULL REFERENCES artisans_knowledge.artisans_commercial_two(id),
                artisans_client_market_id UUID NULL REFERENCES artisans_knowledge.artisans_client_market_three(id),
                artisans_operation_growth_id UUID NULL REFERENCES artisans_knowledge.artisans_operation_growth_four(id),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                created_by UUID NULL,
                updated_by UUID NULL,
                CONSTRAINT unique_user_identity UNIQUE (user_id)
            )
        `);

        // 7. Crear índices para mejorar rendimiento
        await queryRunner.query(`CREATE INDEX idx_artisans_knowledge_categories ON artisans_knowledge.artisans_identity_one(shop_categories_id)`);
        await queryRunner.query(`CREATE INDEX idx_artisans_identity_profile_user ON artisans_knowledge.artisans_identity_profile(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_artisans_identity_profile_knowledge ON artisans_knowledge.artisans_identity_profile(artisans_identity_id)`);
        await queryRunner.query(`CREATE INDEX idx_artisans_identity_profile_commercial ON artisans_knowledge.artisans_identity_profile(artisans_commercial_id)`);
        await queryRunner.query(`CREATE INDEX idx_artisans_identity_profile_market ON artisans_knowledge.artisans_identity_profile(artisans_client_market_id)`);
        await queryRunner.query(`CREATE INDEX idx_artisans_identity_profile_growth ON artisans_knowledge.artisans_identity_profile(artisans_operation_growth_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar en orden inverso debido a las foreign keys
        await queryRunner.query(`DROP TABLE IF EXISTS artisans_knowledge.artisans_identity_profile CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS artisans_knowledge.artisans_operation_growth_four CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS artisans_knowledge.artisans_client_market_three CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS artisans_knowledge.artisans_commercial_two CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS artisans_knowledge.artisans_identity_one CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS artisans_knowledge CASCADE`);
    }

}
