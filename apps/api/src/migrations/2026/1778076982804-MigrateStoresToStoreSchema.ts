import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateStoresToStoreSchema1778076982804 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando migración de shop.stores* → store.stores*...\n');

        // ======================================================================
        // PASO 1: Crear Schema store
        // ======================================================================
        console.log('📝 PASO 1: Creando schema store...');
        await queryRunner.query(`
            CREATE SCHEMA IF NOT EXISTS store;
        `);
        console.log('✅ Schema creado\n');

        // ======================================================================
        // PASO 2: Crear Tabla Principal (store.stores)
        // ======================================================================
        console.log('📝 PASO 2: Creando tabla store.stores...');
        await queryRunner.query(`
            CREATE TABLE store.stores (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                story TEXT,
                legacy_id UUID,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ,

                CONSTRAINT fk_stores_user
                    FOREIGN KEY (user_id)
                    REFERENCES auth.users(id)
                    ON DELETE CASCADE
            );
        `);

        // Crear índices para store.stores
        await queryRunner.query(`
            CREATE INDEX idx_stores_user_id ON store.stores(user_id);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_stores_slug ON store.stores(slug);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_stores_created_at ON store.stores(created_at);
        `);
        console.log('✅ Tabla store.stores creada con índices\n');

        // ======================================================================
        // PASO 3: Migrar Datos a store.stores
        // ======================================================================
        console.log('📝 PASO 3: Migrando datos de shop.stores → store.stores...');
        const storesResult = await queryRunner.query(`
            INSERT INTO store.stores (
                id, user_id, name, slug, story, legacy_id,
                created_at, updated_at, deleted_at
            )
            SELECT
                id, user_id, name, slug, story, legacy_id,
                created_at, updated_at, deleted_at
            FROM shop.stores
            RETURNING id;
        `);
        console.log(`✅ ${storesResult.length} registros migrados a store.stores\n`);

        // ======================================================================
        // PASO 4: Crear Tabla store.store_artisanal_profiles
        // ======================================================================
        console.log('📝 PASO 4: Creando tabla store.store_artisanal_profiles...');
        await queryRunner.query(`
            CREATE TABLE store.store_artisanal_profiles (
                store_id UUID PRIMARY KEY,
                primary_craft_id UUID,
                is_collaboration_studio BOOLEAN DEFAULT false,
                deleted_at TIMESTAMPTZ,

                CONSTRAINT fk_store_artisanal_profiles_store
                    FOREIGN KEY (store_id)
                    REFERENCES store.stores(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_store_artisanal_profiles_craft
                    FOREIGN KEY (primary_craft_id)
                    REFERENCES taxonomy.crafts(id)
            );
        `);

        // Migrar datos
        const profilesResult = await queryRunner.query(`
            INSERT INTO store.store_artisanal_profiles (
                store_id, primary_craft_id, is_collaboration_studio, deleted_at
            )
            SELECT
                store_id, primary_craft_id, is_collaboration_studio, deleted_at
            FROM shop.store_artisanal_profiles
            RETURNING store_id;
        `);
        console.log(`✅ ${profilesResult.length} registros migrados a store.store_artisanal_profiles\n`);

        // ======================================================================
        // PASO 5: Crear Tabla store.store_contacts
        // ======================================================================
        console.log('📝 PASO 5: Creando tabla store.store_contacts...');
        await queryRunner.query(`
            CREATE TABLE store.store_contacts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID NOT NULL UNIQUE,
                email TEXT,
                phone TEXT,
                whatsapp TEXT,
                address_line TEXT,
                department TEXT,
                municipality TEXT,
                deleted_at TIMESTAMPTZ,

                CONSTRAINT fk_store_contacts_store
                    FOREIGN KEY (store_id)
                    REFERENCES store.stores(id)
                    ON DELETE CASCADE
            );
        `);

        // Migrar datos
        const contactsResult = await queryRunner.query(`
            INSERT INTO store.store_contacts (
                id, store_id, email, phone, whatsapp,
                address_line, department, municipality, deleted_at
            )
            SELECT
                id, store_id, email, phone, whatsapp,
                address_line, department, municipality, deleted_at
            FROM shop.store_contacts
            RETURNING id;
        `);
        console.log(`✅ ${contactsResult.length} registros migrados a store.store_contacts\n`);

        // ======================================================================
        // PASO 6: Crear Tabla store.store_awards
        // ======================================================================
        console.log('📝 PASO 6: Creando tabla store.store_awards...');
        await queryRunner.query(`
            CREATE TABLE store.store_awards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID NOT NULL,
                title TEXT NOT NULL,
                year INTEGER,
                issuer TEXT,
                deleted_at TIMESTAMPTZ,

                CONSTRAINT fk_store_awards_store
                    FOREIGN KEY (store_id)
                    REFERENCES store.stores(id)
                    ON DELETE CASCADE
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_store_awards_store_id ON store.store_awards(store_id);
        `);

        // Migrar datos
        const awardsResult = await queryRunner.query(`
            INSERT INTO store.store_awards (
                id, store_id, title, year, issuer, deleted_at
            )
            SELECT
                id, store_id, title, year, issuer, deleted_at
            FROM shop.store_awards
            RETURNING id;
        `);
        console.log(`✅ ${awardsResult.length} registros migrados a store.store_awards\n`);

        // ======================================================================
        // PASO 7: Crear Tabla store.store_badges
        // ======================================================================
        console.log('📝 PASO 7: Creando tabla store.store_badges...');
        await queryRunner.query(`
            CREATE TABLE store.store_badges (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID NOT NULL,
                badge_id UUID NOT NULL,
                awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                awarded_by UUID,
                metadata JSONB DEFAULT '{}',
                valid_until TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ,

                CONSTRAINT fk_store_badges_store
                    FOREIGN KEY (store_id)
                    REFERENCES store.stores(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_store_badges_badge
                    FOREIGN KEY (badge_id)
                    REFERENCES taxonomy.badges(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_store_badges_awarded_by
                    FOREIGN KEY (awarded_by)
                    REFERENCES auth.users(id)
                    ON DELETE SET NULL,

                CONSTRAINT unique_store_badge
                    UNIQUE (store_id, badge_id)
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_store_badges_store_id ON store.store_badges(store_id);
        `);

        // Migrar datos
        const badgesResult = await queryRunner.query(`
            INSERT INTO store.store_badges (
                id, store_id, badge_id, awarded_at, awarded_by,
                metadata, valid_until, deleted_at
            )
            SELECT
                id, store_id, badge_id, awarded_at, awarded_by,
                metadata, valid_until, deleted_at
            FROM shop.store_badges
            RETURNING id;
        `);
        console.log(`✅ ${badgesResult.length} registros migrados a store.store_badges\n`);

        // ======================================================================
        // PASO 8: Crear Tabla store.store_embeddings
        // ======================================================================
        console.log('📝 PASO 8: Creando tabla store.store_embeddings...');
        await queryRunner.query(`
            CREATE TABLE store.store_embeddings (
                store_id UUID PRIMARY KEY,
                embedding vector(1536) NOT NULL,
                model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
                semantic_text TEXT NOT NULL,
                version INTEGER NOT NULL DEFAULT 1,
                generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT fk_store_embeddings_store
                    FOREIGN KEY (store_id)
                    REFERENCES store.stores(id)
                    ON DELETE CASCADE
            );
        `);

        // Crear índices HNSW para búsqueda semántica
        await queryRunner.query(`
            CREATE INDEX idx_store_embeddings_hnsw
                ON store.store_embeddings
                USING hnsw (embedding vector_cosine_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_store_embeddings_version
                ON store.store_embeddings(version);
        `);

        // Migrar datos
        const embeddingsResult = await queryRunner.query(`
            INSERT INTO store.store_embeddings (
                store_id, embedding, model, semantic_text, version, generated_at
            )
            SELECT
                store_id, embedding, model, semantic_text, version, generated_at
            FROM shop.store_embeddings
            RETURNING store_id;
        `);
        console.log(`✅ ${embeddingsResult.length} registros migrados a store.store_embeddings\n`);

        // ======================================================================
        // PASO 9: Crear Trigger para auto-update
        // ======================================================================
        console.log('📝 PASO 9: Creando trigger mdt_stores...');

        // Primero verificar si la función ya existe, si no, crearla
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER mdt_stores
                BEFORE UPDATE ON store.stores
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✅ Trigger creado\n');

        // ======================================================================
        // PASO 10: Actualizar FKs Externas - payments.payouts
        // ======================================================================
        console.log('📝 PASO 10: Actualizando FK payments.payouts.seller_shop_id...');

        // Drop FK antigua
        await queryRunner.query(`
            ALTER TABLE payments.payouts
                DROP CONSTRAINT IF EXISTS payouts_seller_shop_id_fkey;
        `);

        // Crear FK nueva apuntando a store.stores
        await queryRunner.query(`
            ALTER TABLE payments.payouts
                ADD CONSTRAINT payouts_seller_shop_id_fkey
                FOREIGN KEY (seller_shop_id)
                REFERENCES store.stores(id)
                ON DELETE RESTRICT;
        `);
        console.log('✅ FK actualizada en payments.payouts\n');

        // ======================================================================
        // PASO 11: Actualizar FKs Externas - payments.payout_rules
        // ======================================================================
        console.log('📝 PASO 11: Actualizando FK payments.payout_rules.shop_id...');

        // Drop FK antigua
        await queryRunner.query(`
            ALTER TABLE payments.payout_rules
                DROP CONSTRAINT IF EXISTS payout_rules_shop_id_fkey;
        `);

        // Crear FK nueva apuntando a store.stores
        await queryRunner.query(`
            ALTER TABLE payments.payout_rules
                ADD CONSTRAINT payout_rules_shop_id_fkey
                FOREIGN KEY (shop_id)
                REFERENCES store.stores(id)
                ON DELETE CASCADE;
        `);
        console.log('✅ FK actualizada en payments.payout_rules\n');

        // ======================================================================
        // PASO 12: Validación de Datos Migrados
        // ======================================================================
        console.log('📝 PASO 12: Validando datos migrados...\n');

        // Verificar conteo de registros
        const validation = await queryRunner.query(`
            SELECT
                (SELECT COUNT(*) FROM shop.stores) as old_stores,
                (SELECT COUNT(*) FROM store.stores) as new_stores,
                (SELECT COUNT(*) FROM shop.store_artisanal_profiles) as old_profiles,
                (SELECT COUNT(*) FROM store.store_artisanal_profiles) as new_profiles,
                (SELECT COUNT(*) FROM shop.store_contacts) as old_contacts,
                (SELECT COUNT(*) FROM store.store_contacts) as new_contacts,
                (SELECT COUNT(*) FROM shop.store_awards) as old_awards,
                (SELECT COUNT(*) FROM store.store_awards) as new_awards,
                (SELECT COUNT(*) FROM shop.store_badges) as old_badges,
                (SELECT COUNT(*) FROM store.store_badges) as new_badges,
                (SELECT COUNT(*) FROM shop.store_embeddings) as old_embeddings,
                (SELECT COUNT(*) FROM store.store_embeddings) as new_embeddings;
        `);

        console.log('📊 Validación de conteos:');
        console.log(`   stores: ${validation[0].old_stores} → ${validation[0].new_stores}`);
        console.log(`   profiles: ${validation[0].old_profiles} → ${validation[0].new_profiles}`);
        console.log(`   contacts: ${validation[0].old_contacts} → ${validation[0].new_contacts}`);
        console.log(`   awards: ${validation[0].old_awards} → ${validation[0].new_awards}`);
        console.log(`   badges: ${validation[0].old_badges} → ${validation[0].new_badges}`);
        console.log(`   embeddings: ${validation[0].old_embeddings} → ${validation[0].new_embeddings}\n`);

        // Verificar integridad de FKs
        const fkCheck = await queryRunner.query(`
            SELECT COUNT(*) as orphaned_stores
            FROM store.stores s
            WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);
        `);

        if (parseInt(fkCheck[0].orphaned_stores) > 0) {
            console.warn(`⚠️  ADVERTENCIA: ${fkCheck[0].orphaned_stores} stores sin user_id válido`);
        } else {
            console.log('✅ Integridad de FKs verificada');
        }

        // Verificar FKs externas
        const payoutsCheck = await queryRunner.query(`
            SELECT COUNT(*) as orphaned_payouts
            FROM payments.payouts p
            LEFT JOIN store.stores s ON p.seller_shop_id = s.id
            WHERE p.seller_shop_id IS NOT NULL AND s.id IS NULL;
        `);

        if (parseInt(payoutsCheck[0].orphaned_payouts) > 0) {
            console.warn(`⚠️  ADVERTENCIA: ${payoutsCheck[0].orphaned_payouts} payouts con seller_shop_id inválido`);
        } else {
            console.log('✅ FKs externas (payments.payouts) verificadas');
        }

        console.log('\n🎉 Migración completada exitosamente!');
        console.log('⚠️  IMPORTANTE: Las tablas antiguas en shop.* aún existen.');
        console.log('   Valida exhaustivamente antes de eliminarlas con el método down().');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo migración store → shop...\n');

        // ======================================================================
        // PASO 1: Revertir FKs Externas
        // ======================================================================
        console.log('📝 PASO 1: Revirtiendo FKs externas...');

        // Revertir payments.payout_rules
        await queryRunner.query(`
            ALTER TABLE payments.payout_rules
                DROP CONSTRAINT IF EXISTS payout_rules_shop_id_fkey;
        `);

        await queryRunner.query(`
            ALTER TABLE payments.payout_rules
                ADD CONSTRAINT payout_rules_shop_id_fkey
                FOREIGN KEY (shop_id)
                REFERENCES shop.stores(id)
                ON DELETE CASCADE;
        `);

        // Revertir payments.payouts
        await queryRunner.query(`
            ALTER TABLE payments.payouts
                DROP CONSTRAINT IF EXISTS payouts_seller_shop_id_fkey;
        `);

        await queryRunner.query(`
            ALTER TABLE payments.payouts
                ADD CONSTRAINT payouts_seller_shop_id_fkey
                FOREIGN KEY (seller_shop_id)
                REFERENCES shop.stores(id)
                ON DELETE RESTRICT;
        `);

        console.log('✅ FKs externas revertidas\n');

        // ======================================================================
        // PASO 2: Drop Trigger
        // ======================================================================
        console.log('📝 PASO 2: Eliminando trigger...');
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS mdt_stores ON store.stores;
        `);
        console.log('✅ Trigger eliminado\n');

        // ======================================================================
        // PASO 3: Drop Tablas en orden inverso (por FKs)
        // ======================================================================
        console.log('📝 PASO 3: Eliminando tablas del schema store...');

        await queryRunner.query(`DROP TABLE IF EXISTS store.store_embeddings CASCADE;`);
        console.log('   ✅ store_embeddings eliminada');

        await queryRunner.query(`DROP TABLE IF EXISTS store.store_badges CASCADE;`);
        console.log('   ✅ store_badges eliminada');

        await queryRunner.query(`DROP TABLE IF EXISTS store.store_awards CASCADE;`);
        console.log('   ✅ store_awards eliminada');

        await queryRunner.query(`DROP TABLE IF EXISTS store.store_contacts CASCADE;`);
        console.log('   ✅ store_contacts eliminada');

        await queryRunner.query(`DROP TABLE IF EXISTS store.store_artisanal_profiles CASCADE;`);
        console.log('   ✅ store_artisanal_profiles eliminada');

        await queryRunner.query(`DROP TABLE IF EXISTS store.stores CASCADE;`);
        console.log('   ✅ stores eliminada\n');

        // ======================================================================
        // PASO 4: Drop Schema
        // ======================================================================
        console.log('📝 PASO 4: Eliminando schema store...');
        await queryRunner.query(`DROP SCHEMA IF EXISTS store CASCADE;`);
        console.log('✅ Schema eliminado\n');

        console.log('✅ Rollback completado - Sistema restaurado a shop.*');
    }

}
