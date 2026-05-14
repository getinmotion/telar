import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryAndAgreementToArtisanProfile1776827997953 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Insertando registros iniciales y agregando FKs a artisan_profile...\n');

        // PASO 1: Insertar Colombia en countries y obtener el ID
        console.log('📝 Insertando registro en taxonomy.countries...');
        const countryResult = await queryRunner.query(`
            INSERT INTO taxonomy.countries (name)
            VALUES ('Colombia')
            RETURNING id;
        `);
        const colombiaId = countryResult[0].id;
        console.log(`✅ País Colombia creado con ID: ${colombiaId}`);

        // PASO 2: Insertar Artesanias de colombia en agreements y obtener el ID
        console.log('📝 Insertando registro en taxonomy.agreements...');
        const agreementResult = await queryRunner.query(`
            INSERT INTO taxonomy.agreements (name, is_enable_validate)
            VALUES ('Artesanias de colombia', true)
            RETURNING id;
        `);
        const agreementId = agreementResult[0].id;
        console.log(`✅ Agreement creado con ID: ${agreementId}`);

        // PASO 3: Agregar columna country_id a artisan_profile
        console.log('📝 Agregando columna country_id a artisan_profile...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN country_id UUID NULL;
        `);
        console.log('✅ Columna country_id agregada');

        // PASO 4: Agregar columna agreement_id a artisan_profile
        console.log('📝 Agregando columna agreement_id a artisan_profile...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN agreement_id UUID NULL;
        `);
        console.log('✅ Columna agreement_id agregada');

        // PASO 5: Actualizar todos los registros existentes con country_id
        console.log('📝 Actualizando todos los registros con country_id...');
        const countryUpdateResult = await queryRunner.query(`
            UPDATE artesanos.artisan_profile
            SET country_id = '${colombiaId}'
            WHERE country_id IS NULL;
        `);
        console.log(`✅ ${countryUpdateResult[1]} registros actualizados con country_id`);

        // PASO 6: Actualizar todos los registros existentes con agreement_id
        console.log('📝 Actualizando todos los registros con agreement_id...');
        const agreementUpdateResult = await queryRunner.query(`
            UPDATE artesanos.artisan_profile
            SET agreement_id = '${agreementId}'
            WHERE agreement_id IS NULL;
        `);
        console.log(`✅ ${agreementUpdateResult[1]} registros actualizados con agreement_id`);

        // PASO 7: Agregar foreign key constraint para country_id
        console.log('📝 Agregando constraint FK para country_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD CONSTRAINT fk_artisan_profile_country
            FOREIGN KEY (country_id)
            REFERENCES taxonomy.countries(id)
            ON DELETE SET NULL;
        `);
        console.log('✅ FK constraint para country_id agregada');

        // PASO 8: Agregar foreign key constraint para agreement_id
        console.log('📝 Agregando constraint FK para agreement_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD CONSTRAINT fk_artisan_profile_agreement
            FOREIGN KEY (agreement_id)
            REFERENCES taxonomy.agreements(id)
            ON DELETE SET NULL;
        `);
        console.log('✅ FK constraint para agreement_id agregada');

        console.log('\n🎉 Migración completada exitosamente:');
        console.log(`   ✅ País Colombia creado (ID: ${colombiaId})`);
        console.log(`   ✅ Agreement Artesanias de colombia creado (ID: ${agreementId})`);
        console.log('   ✅ Columnas country_id y agreement_id agregadas');
        console.log('   ✅ Todos los registros actualizados');
        console.log('   ✅ Foreign keys configuradas');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo migración de country_id y agreement_id...\n');

        // PASO 1: Eliminar constraint FK de agreement_id
        console.log('🗑️  Eliminando FK constraint para agreement_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP CONSTRAINT IF EXISTS fk_artisan_profile_agreement;
        `);

        // PASO 2: Eliminar constraint FK de country_id
        console.log('🗑️  Eliminando FK constraint para country_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP CONSTRAINT IF EXISTS fk_artisan_profile_country;
        `);

        // PASO 3: Eliminar columna agreement_id
        console.log('🗑️  Eliminando columna agreement_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS agreement_id;
        `);

        // PASO 4: Eliminar columna country_id
        console.log('🗑️  Eliminando columna country_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS country_id;
        `);

        // PASO 5: Eliminar registro de agreements
        console.log('🗑️  Eliminando registro de Artesanias de colombia...');
        await queryRunner.query(`
            DELETE FROM taxonomy.agreements
            WHERE name = 'Artesanias de colombia';
        `);

        // PASO 6: Eliminar registro de countries
        console.log('🗑️  Eliminando registro de Colombia...');
        await queryRunner.query(`
            DELETE FROM taxonomy.countries
            WHERE name = 'Colombia';
        `);

        console.log('\n✅ Rollback completado exitosamente');
    }

}
