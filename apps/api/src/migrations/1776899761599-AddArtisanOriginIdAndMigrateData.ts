import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtisanOriginIdAndMigrateData1776899761599 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando migración de datos de artisan_profile a artisan_origin...\n');

        // PASO 1: Agregar columna artisan_origin_id a artisan_profile
        console.log('📝 PASO 1: Agregando columna artisan_origin_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN artisan_origin_id UUID NULL;
        `);
        console.log('✅ Columna agregada\n');

        // PASO 2: Obtener todos los user_id de artisan_profile
        console.log('📝 PASO 2: Obteniendo registros de artisan_profile...');
        const artisanProfiles = await queryRunner.query(`
            SELECT user_id
            FROM artesanos.artisan_profile
            WHERE user_id IS NOT NULL
            ORDER BY user_id
        `);
        console.log(`✅ ${artisanProfiles.length} registros encontrados\n`);

        if (artisanProfiles.length === 0) {
            console.log('⚠️  No hay registros para procesar');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // PASO 3: Iterar sobre cada artisan_profile
        for (let i = 0; i < artisanProfiles.length; i++) {
            const profile = artisanProfiles[i];
            const userId = profile.user_id;

            console.log(`\n[${i + 1}/${artisanProfiles.length}] 📝 Procesando user_id: ${userId}`);

            try {
                // PASO 4: Obtener artisan_profile JSON de shop.artisan_shops
                const shops = await queryRunner.query(`
                    SELECT artisan_profile
                    FROM shop.artisan_shops
                    WHERE user_id = $1
                    LIMIT 1
                `, [userId]);

                if (!shops || shops.length === 0) {
                    console.log(`   ⚠️  No se encontró artisan_shop para user_id: ${userId}`);
                    skippedCount++;
                    continue;
                }

                const artisanProfileData = shops[0].artisan_profile;

                if (!artisanProfileData) {
                    console.log(`   ⚠️  artisan_profile es NULL para user_id: ${userId}`);
                    skippedCount++;
                    continue;
                }

                console.log(`   ✅ Datos de artisan_profile obtenidos`);

                // PASO 5: Extraer datos del JSON
                const generatedStory = artisanProfileData.generatedStory || {};

                const originStory = generatedStory.originStory || null;
                const culturalStory = artisanProfileData.culturalHistory || null;
                const mainStory = generatedStory.culturalStory || null;
                const culturalMeaning = artisanProfileData.culturalMeaning || null;
                const learnedFromDetail = artisanProfileData.learnedFromDetail || null;
                const ancestralKnowledge = artisanProfileData.ancestralKnowledge || null;
                const learnedFrom = artisanProfileData.learnedFrom || null;
                const startAge = artisanProfileData.startAge || null;
                const ethnicRelation = artisanProfileData.ethnicRelation || null;
                const artisanQuote = generatedStory.artisanQuote || null;

                console.log(`   📋 Datos extraídos del JSON`);

                // PASO 6: Insertar en artisan_origin
                console.log(`   💾 Insertando registro en artisan_origin...`);
                const insertResult = await queryRunner.query(`
                    INSERT INTO artesanos.artisan_origin (
                        origin_story,
                        cultural_story,
                        main_story,
                        cultural_meaning,
                        learned_from_detail,
                        ancestral_knowledge,
                        learned_from,
                        start_age,
                        ethnic_relation,
                        artisan_quote
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id
                `, [
                    originStory,
                    culturalStory,
                    mainStory,
                    culturalMeaning,
                    learnedFromDetail,
                    ancestralKnowledge,
                    learnedFrom,
                    startAge,
                    ethnicRelation,
                    artisanQuote
                ]);

                const newOriginId = insertResult[0].id;
                console.log(`   ✅ Registro creado con ID: ${newOriginId}`);

                // PASO 7: Actualizar artisan_profile con el nuevo artisan_origin_id
                console.log(`   🔄 Actualizando artisan_profile...`);
                await queryRunner.query(`
                    UPDATE artesanos.artisan_profile
                    SET artisan_origin_id = $1
                    WHERE user_id = $2
                `, [newOriginId, userId]);

                console.log(`   ✅ Registro actualizado exitosamente`);
                successCount++;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`   ❌ Error procesando user_id ${userId}:`, errorMessage);
                errorCount++;
            }
        }

        // PASO 8: Agregar FK constraint
        console.log('\n📝 PASO 8: Agregando constraint de FK...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD CONSTRAINT fk_artisan_profile_origin
            FOREIGN KEY (artisan_origin_id)
            REFERENCES artesanos.artisan_origin(id)
            ON DELETE SET NULL;
        `);
        console.log('✅ Constraint agregado\n');

        // PASO 9: Crear índice para mejorar performance
        console.log('📝 PASO 9: Creando índice...');
        await queryRunner.query(`
            CREATE INDEX idx_artisan_profile_origin_id
            ON artesanos.artisan_profile(artisan_origin_id);
        `);
        console.log('✅ Índice creado\n');

        console.log('🎉 Migración completada:');
        console.log(`   ✅ Registros migrados exitosamente: ${successCount}`);
        console.log(`   ⚠️  Registros saltados (sin shop o sin data): ${skippedCount}`);
        console.log(`   ❌ Registros con errores: ${errorCount}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo migración...\n');

        // Eliminar índice
        console.log('📝 Eliminando índice...');
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_profile_origin_id;
        `);
        console.log('✅ Índice eliminado\n');

        // Eliminar FK constraint
        console.log('📝 Eliminando constraint de FK...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP CONSTRAINT IF EXISTS fk_artisan_profile_origin;
        `);
        console.log('✅ Constraint eliminado\n');

        // Eliminar todos los registros de artisan_origin que fueron creados
        console.log('📝 Eliminando registros de artisan_origin...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_origin
            WHERE id IN (
                SELECT artisan_origin_id
                FROM artesanos.artisan_profile
                WHERE artisan_origin_id IS NOT NULL
            );
        `);
        console.log('✅ Registros eliminados\n');

        // Eliminar columna
        console.log('📝 Eliminando columna artisan_origin_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS artisan_origin_id;
        `);
        console.log('✅ Columna eliminada\n');

        console.log('✅ Rollback completado');
    }

}
