import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToShopTables1774837527565 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Agregando columna deleted_at a 13 tablas del schema shop...\n');

        // Tablas relacionadas con Store
        await queryRunner.query(`
            ALTER TABLE shop.store_artisanal_profiles
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.store_artisanal_profiles');

        await queryRunner.query(`
            ALTER TABLE shop.store_contacts
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.store_contacts');

        await queryRunner.query(`
            ALTER TABLE shop.store_awards
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.store_awards');

        await queryRunner.query(`
            ALTER TABLE shop.store_badges
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.store_badges');

        // Tablas relacionadas con Product
        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_artisanal_identity');

        await queryRunner.query(`
            ALTER TABLE shop.product_materials_link
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_materials_link');

        await queryRunner.query(`
            ALTER TABLE shop.product_physical_specs
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_physical_specs');

        await queryRunner.query(`
            ALTER TABLE shop.product_logistics
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_logistics');

        await queryRunner.query(`
            ALTER TABLE shop.product_production
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_production');

        await queryRunner.query(`
            ALTER TABLE shop.product_care_tags
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_care_tags');

        await queryRunner.query(`
            ALTER TABLE shop.product_media
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_media');

        await queryRunner.query(`
            ALTER TABLE shop.product_badges
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.product_badges');

        await queryRunner.query(`
            ALTER TABLE shop.variant_attribute_values
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        `);
        console.log('✅ shop.variant_attribute_values');

        console.log('\n🎉 Migración completada: 13 tablas ahora tienen soft delete');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo: Eliminando columna deleted_at de 13 tablas...\n');

        // Revertir en orden inverso
        await queryRunner.query(`
            ALTER TABLE shop.variant_attribute_values
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.variant_attribute_values');

        await queryRunner.query(`
            ALTER TABLE shop.product_badges
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_badges');

        await queryRunner.query(`
            ALTER TABLE shop.product_media
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_media');

        await queryRunner.query(`
            ALTER TABLE shop.product_care_tags
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_care_tags');

        await queryRunner.query(`
            ALTER TABLE shop.product_production
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_production');

        await queryRunner.query(`
            ALTER TABLE shop.product_logistics
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_logistics');

        await queryRunner.query(`
            ALTER TABLE shop.product_physical_specs
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_physical_specs');

        await queryRunner.query(`
            ALTER TABLE shop.product_materials_link
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_materials_link');

        await queryRunner.query(`
            ALTER TABLE shop.product_artisanal_identity
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.product_artisanal_identity');

        await queryRunner.query(`
            ALTER TABLE shop.store_badges
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.store_badges');

        await queryRunner.query(`
            ALTER TABLE shop.store_awards
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.store_awards');

        await queryRunner.query(`
            ALTER TABLE shop.store_contacts
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.store_contacts');

        await queryRunner.query(`
            ALTER TABLE shop.store_artisanal_profiles
            DROP COLUMN IF EXISTS deleted_at;
        `);
        console.log('✅ shop.store_artisanal_profiles');

        console.log('\n🔄 Rollback completado');
    }

}
