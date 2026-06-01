import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketplaceTaxonomySchema1772732492530 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================================
    // 1. ESQUEMAS, EXTENSIONES Y TIPOS ENUMERADOS
    // ============================================================================
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS taxonomy`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS shop`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS digital_identity`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS payments`);

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS moddatetime`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE taxonomy_approval_status AS ENUM ('pending', 'approved', 'rejected')
    `);
    await queryRunner.query(`
      CREATE TYPE taxonomy_badge_target AS ENUM ('shop', 'product')
    `);
    await queryRunner.query(`
      CREATE TYPE taxonomy_badge_assignment AS ENUM ('curated', 'automated')
    `);
    await queryRunner.query(`
      CREATE TYPE shop_piece_type AS ENUM ('funcional', 'decorativa', 'mixta')
    `);
    await queryRunner.query(`
      CREATE TYPE shop_style AS ENUM ('tradicional', 'contemporaneo', 'fusion')
    `);
    await queryRunner.query(`
      CREATE TYPE product_process_type AS ENUM ('manual', 'mixto', 'asistido')
    `);
    await queryRunner.query(`
      CREATE TYPE product_availability AS ENUM ('en_stock', 'bajo_pedido', 'edicion_limitada')
    `);
    await queryRunner.query(`
      CREATE TYPE fragility_level AS ENUM ('bajo', 'medio', 'alto')
    `);

    // ============================================================================
    // 2. TABLAS (Ordenadas por dependencias de Llaves Foráneas)
    // ============================================================================

    // 2.1 Taxonomía y Catálogos
    await queryRunner.query(`
      CREATE TABLE taxonomy.crafts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        status taxonomy_approval_status DEFAULT 'approved',
        suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE taxonomy.techniques (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        craft_id UUID REFERENCES taxonomy.crafts(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        status taxonomy_approval_status DEFAULT 'approved',
        suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_technique_per_craft UNIQUE (craft_id, name)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE taxonomy.materials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        is_organic BOOLEAN DEFAULT false,
        is_sustainable BOOLEAN DEFAULT false,
        status taxonomy_approval_status DEFAULT 'approved',
        suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE taxonomy.curatorial_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE taxonomy.badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        target_type taxonomy_badge_target NOT NULL,
        assignment_type taxonomy_badge_assignment NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE taxonomy.care_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        icon_url TEXT,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Sistema de Categorías (movido desde shop a taxonomy)
    await queryRunner.query(`
      CREATE TABLE taxonomy.categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES taxonomy.categories(id) ON DELETE SET NULL,
        display_order INTEGER DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        legacy_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

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

    // 2.2 Tienda (Nueva Arquitectura 'Stores')
    await queryRunner.query(`
      CREATE TABLE shop.stores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        story TEXT,
        legacy_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ DEFAULT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.store_artisanal_profiles (
        store_id UUID PRIMARY KEY REFERENCES shop.stores(id) ON DELETE CASCADE,
        primary_craft_id UUID REFERENCES taxonomy.crafts(id),
        is_collaboration_studio BOOLEAN DEFAULT false
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.store_contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id UUID UNIQUE REFERENCES shop.stores(id) ON DELETE CASCADE,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        address_line TEXT,
        department TEXT,
        municipality TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.store_awards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id UUID REFERENCES shop.stores(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        year INTEGER,
        issuer TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.store_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id UUID NOT NULL REFERENCES shop.stores(id) ON DELETE CASCADE,
        badge_id UUID NOT NULL REFERENCES taxonomy.badges(id) ON DELETE CASCADE,
        awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        valid_until TIMESTAMPTZ,
        CONSTRAINT unique_store_badge UNIQUE (store_id, badge_id)
      )
    `);

    // 2.3 Productos Multicapa (apuntando a taxonomy.categories)
    await queryRunner.query(`
      CREATE TABLE shop.products_core (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_id UUID NOT NULL REFERENCES shop.stores(id) ON DELETE CASCADE,
        category_id UUID REFERENCES taxonomy.categories(id),
        name TEXT NOT NULL,
        short_description TEXT NOT NULL,
        history TEXT,
        care_notes TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ DEFAULT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_artisanal_identity (
        product_id UUID PRIMARY KEY REFERENCES shop.products_core(id) ON DELETE CASCADE,
        primary_craft_id UUID REFERENCES taxonomy.crafts(id),
        primary_technique_id UUID REFERENCES taxonomy.techniques(id),
        secondary_technique_id UUID REFERENCES taxonomy.techniques(id),
        curatorial_category_id UUID REFERENCES taxonomy.curatorial_categories(id),
        piece_type shop_piece_type,
        style shop_style,
        is_collaboration BOOLEAN DEFAULT false,
        process_type product_process_type,
        estimated_elaboration_time TEXT,
        CONSTRAINT check_unique_techniques_product CHECK (primary_technique_id IS DISTINCT FROM secondary_technique_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_materials_link (
        product_id UUID REFERENCES shop.products_core(id) ON DELETE CASCADE,
        material_id UUID REFERENCES taxonomy.materials(id) ON DELETE RESTRICT,
        is_primary BOOLEAN DEFAULT true,
        material_origin TEXT,
        PRIMARY KEY (product_id, material_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_physical_specs (
        product_id UUID PRIMARY KEY REFERENCES shop.products_core(id) ON DELETE CASCADE,
        height_cm NUMERIC(8,2),
        width_cm NUMERIC(8,2),
        length_or_diameter_cm NUMERIC(8,2),
        real_weight_kg NUMERIC(8,2) CHECK (real_weight_kg > 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_logistics (
        product_id UUID PRIMARY KEY REFERENCES shop.products_core(id) ON DELETE CASCADE,
        packaging_type TEXT,
        pack_height_cm NUMERIC(8,2),
        pack_width_cm NUMERIC(8,2),
        pack_length_cm NUMERIC(8,2),
        pack_weight_kg NUMERIC(8,2),
        fragility fragility_level DEFAULT 'medio',
        requires_assembly BOOLEAN DEFAULT false,
        special_protection_notes TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_production (
        product_id UUID PRIMARY KEY REFERENCES shop.products_core(id) ON DELETE CASCADE,
        availability_type product_availability NOT NULL,
        production_time_days INTEGER CHECK (production_time_days > 0),
        monthly_capacity INTEGER CHECK (monthly_capacity > 0),
        requirements_to_start TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_care_tags (
        product_id UUID REFERENCES shop.products_core(id) ON DELETE CASCADE,
        care_tag_id UUID REFERENCES taxonomy.care_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, care_tag_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_media (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES shop.products_core(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type TEXT DEFAULT 'image',
        is_primary BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0 CHECK (display_order >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES shop.products_core(id) ON DELETE CASCADE,
        badge_id UUID NOT NULL REFERENCES taxonomy.badges(id) ON DELETE CASCADE,
        awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        valid_until TIMESTAMPTZ,
        CONSTRAINT unique_product_badge UNIQUE (product_id, badge_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE shop.product_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES shop.products_core(id) ON DELETE CASCADE,
        sku TEXT UNIQUE,
        stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
        base_price_minor BIGINT NOT NULL CHECK (base_price_minor > 0),
        currency CHAR(3) DEFAULT 'COP' CHECK (currency ~ '^[A-Z]{3}$'),
        real_weight_kg NUMERIC(8,2),
        dim_height_cm NUMERIC(8,2),
        dim_width_cm NUMERIC(8,2),
        dim_length_cm NUMERIC(8,2),
        pack_height_cm NUMERIC(8,2),
        pack_width_cm NUMERIC(8,2),
        pack_length_cm NUMERIC(8,2),
        pack_weight_kg NUMERIC(8,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ DEFAULT NULL
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

    // 2.4 Identidad Digital
    await queryRunner.query(`
      CREATE TABLE digital_identity.footprints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL UNIQUE REFERENCES shop.products_core(id) ON DELETE CASCADE,
        artisan_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        token_id TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_mint', 'minted', 'revoked')),
        minted_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE digital_identity.metadata_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        footprint_id UUID NOT NULL REFERENCES digital_identity.footprints(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        metadata JSONB NOT NULL,
        metadata_hash TEXT NOT NULL,
        hashing_algorithm TEXT NOT NULL DEFAULT 'SHA-256',
        is_original BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_footprint_version UNIQUE (footprint_id, version_number)
      )
    `);

    // ============================================================================
    // 3. ÍNDICES DE RENDIMIENTO CLAVES
    // ============================================================================

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_one_primary_media ON shop.product_media(product_id) WHERE is_primary = true
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_unique_token_id ON digital_identity.footprints(token_id) WHERE token_id IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX idx_materials_pending ON taxonomy.materials(status) WHERE status = 'pending'
    `);
    await queryRunner.query(`
      CREATE INDEX idx_crafts_pending ON taxonomy.crafts(status) WHERE status = 'pending'
    `);
    await queryRunner.query(`
      CREATE INDEX idx_techniques_pending ON taxonomy.techniques(status) WHERE status = 'pending'
    `);

    await queryRunner.query(
      `CREATE INDEX idx_products_core_store ON shop.products_core(store_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_products_core_category ON shop.products_core(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_variants_product ON shop.product_variants(product_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_media_product ON shop.product_media(product_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_vav_attribute ON shop.variant_attribute_values(attribute_id, value)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_footprints_artisan ON digital_identity.footprints(artisan_id)`,
    );

    // ============================================================================
    // 4. TRIGGERS (Actualización de fechas automáticas)
    // ============================================================================

    await queryRunner.query(`
      CREATE TRIGGER mdt_crafts BEFORE UPDATE ON taxonomy.crafts
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_techniques BEFORE UPDATE ON taxonomy.techniques
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_materials BEFORE UPDATE ON taxonomy.materials
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_badges BEFORE UPDATE ON taxonomy.badges
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_categories BEFORE UPDATE ON taxonomy.categories
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_stores BEFORE UPDATE ON shop.stores
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_products_core BEFORE UPDATE ON shop.products_core
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);
    await queryRunner.query(`
      CREATE TRIGGER mdt_product_variants BEFORE UPDATE ON shop.product_variants
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at)
    `);

    // ============================================================================
    // 5. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
    // ============================================================================
    // NOTA: Las políticas RLS están comentadas porque auth.uid() es específico de Supabase.
    // Para PostgreSQL estándar, se necesita implementar un mecanismo de autenticación diferente.
    // Las políticas se pueden habilitar en una migración posterior una vez implementado el sistema de auth.

    /*
    // Habilitar RLS en las tablas
    await queryRunner.query(
      `ALTER TABLE shop.stores ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.store_artisanal_profiles ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.store_contacts ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.products_core ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_artisanal_identity ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_materials_link ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_physical_specs ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_logistics ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_production ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_care_tags ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_media ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_badges ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_variants ENABLE ROW LEVEL SECURITY`,
    );

    // Crear Políticas
    await queryRunner.query(`
      CREATE POLICY "Store Owner Access" ON shop.stores
      FOR ALL USING (user_id = auth.uid())
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.stores
      FOR SELECT USING (deleted_at IS NULL)
    `);

    await queryRunner.query(`
      CREATE POLICY "Store Profile Owner Access" ON shop.store_artisanal_profiles
      FOR ALL USING (store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid()))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.store_artisanal_profiles
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Store Contacts Owner Access" ON shop.store_contacts
      FOR ALL USING (store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid()))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.store_contacts
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Products Owner Access" ON shop.products_core
      FOR ALL USING (store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid()))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.products_core
      FOR SELECT USING (status = 'published' AND deleted_at IS NULL)
    `);

    await queryRunner.query(`
      CREATE POLICY "Identity Owner Access" ON shop.product_artisanal_identity
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_artisanal_identity
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Materials Link Owner Access" ON shop.product_materials_link
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_materials_link
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Specs Owner Access" ON shop.product_physical_specs
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_physical_specs
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Logistics Owner Access" ON shop.product_logistics
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_logistics
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Production Owner Access" ON shop.product_production
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_production
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Care Tags Owner Access" ON shop.product_care_tags
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_care_tags
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Media Owner Access" ON shop.product_media
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_media
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Badges Owner Access" ON shop.product_badges
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_badges
      FOR SELECT USING (true)
    `);

    await queryRunner.query(`
      CREATE POLICY "Variants Owner Access" ON shop.product_variants
      FOR ALL USING (product_id IN (SELECT id FROM shop.products_core WHERE store_id IN (SELECT id FROM shop.stores WHERE user_id = auth.uid())))
    `);
    await queryRunner.query(`
      CREATE POLICY "Public Read Access" ON shop.product_variants
      FOR SELECT USING (deleted_at IS NULL)
    `);
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================================================
    // ROLLBACK: Eliminar en orden inverso
    // ============================================================================

    // 5. Eliminar políticas RLS (comentado - ver up() para más detalles)
    /*
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_variants`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Variants Owner Access" ON shop.product_variants`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_badges`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Badges Owner Access" ON shop.product_badges`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_media`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Media Owner Access" ON shop.product_media`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_care_tags`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Care Tags Owner Access" ON shop.product_care_tags`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_production`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Production Owner Access" ON shop.product_production`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_logistics`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Logistics Owner Access" ON shop.product_logistics`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_physical_specs`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Specs Owner Access" ON shop.product_physical_specs`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_materials_link`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Materials Link Owner Access" ON shop.product_materials_link`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.product_artisanal_identity`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Identity Owner Access" ON shop.product_artisanal_identity`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.products_core`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Products Owner Access" ON shop.products_core`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.store_contacts`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Store Contacts Owner Access" ON shop.store_contacts`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.store_artisanal_profiles`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Store Profile Owner Access" ON shop.store_artisanal_profiles`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Public Read Access" ON shop.stores`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Store Owner Access" ON shop.stores`,
    );

    // Deshabilitar RLS
    await queryRunner.query(
      `ALTER TABLE shop.product_variants DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_badges DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_media DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_care_tags DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_production DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_logistics DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_physical_specs DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_materials_link DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.product_artisanal_identity DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.products_core DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.store_contacts DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.store_artisanal_profiles DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE shop.stores DISABLE ROW LEVEL SECURITY`,
    );
    */

    // 4. Eliminar triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_product_variants ON shop.product_variants`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_products_core ON shop.products_core`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_stores ON shop.stores`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_badges ON taxonomy.badges`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_categories ON taxonomy.categories`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_materials ON taxonomy.materials`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_techniques ON taxonomy.techniques`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS mdt_crafts ON taxonomy.crafts`,
    );

    // 3. Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS digital_identity.idx_footprints_artisan`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_vav_attribute`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_media_product`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_variants_product`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_products_core_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_products_core_store`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS taxonomy.idx_techniques_pending`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS taxonomy.idx_crafts_pending`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS taxonomy.idx_materials_pending`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS digital_identity.idx_unique_token_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS shop.idx_one_primary_media`);

    // 2. Eliminar tablas en orden inverso de dependencias
    await queryRunner.query(
      `DROP TABLE IF EXISTS digital_identity.metadata_versions CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS digital_identity.footprints CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.variant_attribute_values CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_variants CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS shop.product_badges CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.product_media CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_care_tags CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_production CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_logistics CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_physical_specs CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_materials_link CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.product_artisanal_identity CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS shop.products_core CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.store_badges CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.store_awards CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.store_contacts CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS shop.store_artisanal_profiles CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS shop.stores CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS taxonomy.category_attribute_options CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS taxonomy.category_attributes CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS taxonomy.categories CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.care_tags CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.badges CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS taxonomy.curatorial_categories CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.materials CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.techniques CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.crafts CASCADE`);

    // 1. Eliminar tipos enumerados y extensiones
    await queryRunner.query(`DROP TYPE IF EXISTS fragility_level CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS product_availability CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS product_process_type CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS shop_style CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS shop_piece_type CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS taxonomy_badge_assignment CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS taxonomy_badge_target CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS taxonomy_approval_status CASCADE`,
    );

    await queryRunner.query(`DROP EXTENSION IF EXISTS moddatetime`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);

    // Eliminar esquemas
    await queryRunner.query(`DROP SCHEMA IF EXISTS payments CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS digital_identity CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS shop CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS taxonomy CASCADE`);
  }
}
