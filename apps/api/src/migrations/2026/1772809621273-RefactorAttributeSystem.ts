import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorAttributeSystem1772809621273 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. ELIMINAR LA ESTRUCTURA VIEJA
        // ============================================
        // Orden importante: primero las tablas dependientes, luego las principales

        await queryRunner.query(`
            DROP TABLE IF EXISTS shop.variant_attribute_values CASCADE
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS taxonomy.category_attribute_options CASCADE
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS taxonomy.category_attributes CASCADE
        `);

        // ============================================
        // 2. CREAR EL NUEVO TIPO ENUMERADO
        // ============================================

        await queryRunner.query(`
            CREATE TYPE shop_attribute_stage AS ENUM ('draft', 'footprint', 'publish')
        `);

        // ============================================
        // 3. CREAR LA NUEVA ARQUITECTURA (Catálogo Global EAV)
        // ============================================

        // 3.1 Tabla principal de atributos globales
        await queryRunner.query(`
            CREATE TABLE shop.attributes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                ui_type TEXT NOT NULL DEFAULT 'text',
                data_type TEXT NOT NULL DEFAULT 'string',
                unit TEXT,
                validation_rules JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        `);

        // 3.2 Opciones de atributos (para select, radio, checkbox)
        await queryRunner.query(`
            CREATE TABLE shop.attribute_options (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                attribute_id UUID NOT NULL REFERENCES shop.attributes(id) ON DELETE CASCADE,
                value TEXT NOT NULL,
                display_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT unique_attribute_option UNIQUE (attribute_id, value)
            )
        `);

        // 3.3 Conjuntos de atributos por categoría (qué atributos aplican a cada categoría)
        await queryRunner.query(`
            CREATE TABLE shop.category_attribute_sets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                category_id UUID NOT NULL REFERENCES taxonomy.categories(id) ON DELETE CASCADE,
                attribute_id UUID NOT NULL REFERENCES shop.attributes(id) ON DELETE CASCADE,
                is_required BOOLEAN DEFAULT false,
                is_variant_level BOOLEAN DEFAULT false,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT unique_category_attribute UNIQUE (category_id, attribute_id)
            )
        `);

        // 3.4 Valores de atributos a nivel de producto
        await queryRunner.query(`
            CREATE TABLE shop.product_attribute_values (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                product_id UUID NOT NULL REFERENCES shop.products_core(id) ON DELETE CASCADE,
                attribute_id UUID NOT NULL REFERENCES shop.attributes(id) ON DELETE RESTRICT,
                value TEXT NOT NULL,
                stage shop_attribute_stage DEFAULT 'draft',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                CONSTRAINT unique_product_attribute UNIQUE (product_id, attribute_id)
            )
        `);

        // 3.5 Valores de atributos a nivel de variante (nueva estructura)
        await queryRunner.query(`
            CREATE TABLE shop.variant_attribute_values (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                variant_id UUID NOT NULL REFERENCES shop.product_variants(id) ON DELETE CASCADE,
                attribute_id UUID NOT NULL REFERENCES shop.attributes(id) ON DELETE RESTRICT,
                value TEXT NOT NULL,
                stage shop_attribute_stage DEFAULT 'draft',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                CONSTRAINT unique_variant_attribute UNIQUE (variant_id, attribute_id)
            )
        `);

        // ============================================
        // 4. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
        // ============================================

        await queryRunner.query(`
            CREATE INDEX idx_attributes_code ON shop.attributes(code)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_attribute_options_attribute ON shop.attribute_options(attribute_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_category_attribute_sets_category ON shop.category_attribute_sets(category_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_category_attribute_sets_attribute ON shop.category_attribute_sets(attribute_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_product_attribute_values_product ON shop.product_attribute_values(product_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_product_attribute_values_attribute ON shop.product_attribute_values(attribute_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_product_attribute_values_stage ON shop.product_attribute_values(stage)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_variant_attribute_values_variant ON shop.variant_attribute_values(variant_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_variant_attribute_values_attribute ON shop.variant_attribute_values(attribute_id)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_variant_attribute_values_stage ON shop.variant_attribute_values(stage)
        `);

        // ============================================
        // 5. CREAR TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
        // ============================================

        await queryRunner.query(`
            CREATE TRIGGER handle_updated_at_attributes
                BEFORE UPDATE ON shop.attributes
                FOR EACH ROW
                EXECUTE PROCEDURE moddatetime(updated_at)
        `);

        await queryRunner.query(`
            CREATE TRIGGER handle_updated_at_product_attribute_values
                BEFORE UPDATE ON shop.product_attribute_values
                FOR EACH ROW
                EXECUTE PROCEDURE moddatetime(updated_at)
        `);

        await queryRunner.query(`
            CREATE TRIGGER handle_updated_at_variant_attribute_values
                BEFORE UPDATE ON shop.variant_attribute_values
                FOR EACH ROW
                EXECUTE PROCEDURE moddatetime(updated_at)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ============================================
        // 1. ELIMINAR TRIGGERS
        // ============================================

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS handle_updated_at_variant_attribute_values ON shop.variant_attribute_values
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS handle_updated_at_product_attribute_values ON shop.product_attribute_values
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS handle_updated_at_attributes ON shop.attributes
        `);

        // ============================================
        // 2. ELIMINAR ÍNDICES
        // ============================================

        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_variant_attribute_values_stage`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_variant_attribute_values_attribute`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_variant_attribute_values_variant`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_product_attribute_values_stage`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_product_attribute_values_attribute`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_product_attribute_values_product`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_category_attribute_sets_attribute`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_category_attribute_sets_category`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_attribute_options_attribute`);
        await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_attributes_code`);

        // ============================================
        // 3. ELIMINAR LA NUEVA ESTRUCTURA
        // ============================================

        await queryRunner.query(`DROP TABLE IF EXISTS shop.variant_attribute_values CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS shop.product_attribute_values CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS shop.category_attribute_sets CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS shop.attribute_options CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS shop.attributes CASCADE`);

        // ============================================
        // 4. ELIMINAR EL NUEVO TIPO ENUMERADO
        // ============================================

        await queryRunner.query(`DROP TYPE IF EXISTS shop_attribute_stage CASCADE`);

        // ============================================
        // 5. RECREAR LA ESTRUCTURA VIEJA
        // ============================================

        await queryRunner.query(`
            CREATE TABLE taxonomy.category_attributes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                category_id UUID NOT NULL REFERENCES taxonomy.categories(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                display_type TEXT DEFAULT 'text',
                is_required BOOLEAN DEFAULT false,
                CONSTRAINT unique_category_attribute UNIQUE (category_id, name)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE taxonomy.category_attribute_options (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                attribute_id UUID NOT NULL REFERENCES taxonomy.category_attributes(id) ON DELETE CASCADE,
                value TEXT NOT NULL,
                CONSTRAINT unique_attribute_option UNIQUE (attribute_id, value)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE shop.variant_attribute_values (
                variant_id UUID NOT NULL REFERENCES shop.product_variants(id) ON DELETE CASCADE,
                attribute_id UUID NOT NULL REFERENCES taxonomy.category_attributes(id) ON DELETE RESTRICT,
                value TEXT NOT NULL,
                PRIMARY KEY (variant_id, attribute_id)
            )
        `);
    }

}
