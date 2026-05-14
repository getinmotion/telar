import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgreementsTerritoriesCountriesTables1776826723574 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Creando tablas agreements, territories y countries en schema taxonomy...\n');

        // 1. Crear tabla agreements
        console.log('📝 Creando tabla taxonomy.agreements...');
        await queryRunner.query(`
            CREATE TABLE taxonomy.agreements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                permission_mongo_id TEXT NULL,
                is_enable_validate BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla taxonomy.agreements creada');

        // 2. Crear tabla territories
        console.log('📝 Creando tabla taxonomy.territories...');
        await queryRunner.query(`
            CREATE TABLE taxonomy.territories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                is_territory BOOLEAN NOT NULL DEFAULT true,
                region_name TEXT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla taxonomy.territories creada');

        // 3. Crear tabla countries
        console.log('📝 Creando tabla taxonomy.countries...');
        await queryRunner.query(`
            CREATE TABLE taxonomy.countries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla taxonomy.countries creada');

        console.log('\n🎉 Tablas creadas exitosamente:');
        console.log('   ✅ taxonomy.agreements');
        console.log('   ✅ taxonomy.territories');
        console.log('   ✅ taxonomy.countries');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Eliminando tablas agreements, territories y countries...\n');

        // Eliminar en orden inverso
        console.log('🗑️  Eliminando tabla taxonomy.countries...');
        await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.countries;`);

        console.log('🗑️  Eliminando tabla taxonomy.territories...');
        await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.territories;`);

        console.log('🗑️  Eliminando tabla taxonomy.agreements...');
        await queryRunner.query(`DROP TABLE IF EXISTS taxonomy.agreements;`);

        console.log('\n✅ Tablas eliminadas exitosamente');
    }

}
