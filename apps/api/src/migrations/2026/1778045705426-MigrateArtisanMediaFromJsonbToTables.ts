import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateArtisanMediaFromJsonbToTables1778045705426 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando migración de fotos de artesanos desde JSONB a tablas específicas...\n');

        // PASO 1: Obtener todos los registros de artisan_profile
        console.log('📝 PASO 1: Obteniendo registros de artisan_profile...');
        const artisanProfiles = await queryRunner.query(`
            SELECT id, user_id
            FROM artesanos.artisan_profile
            WHERE user_id IS NOT NULL
            ORDER BY created_at
        `);
        console.log(`✅ ${artisanProfiles.length} registros de artisan_profile encontrados\n`);

        if (artisanProfiles.length === 0) {
            console.log('⚠️  No hay registros para procesar');
            return;
        }

        // Contadores para el reporte final
        let totalProcessed = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        let familyPhotosCount = 0;
        let workingPhotosCount = 0;
        let workshopPhotosCount = 0;
        let communityPhotosCount = 0;

        // PASO 2: Iterar sobre cada artisan_profile
        console.log('📝 PASO 2: Procesando cada artisan_profile...\n');
        for (let i = 0; i < artisanProfiles.length; i++) {
            const profile = artisanProfiles[i];
            const artisanId = profile.id;
            const userId = profile.user_id;

            console.log(`[${i + 1}/${artisanProfiles.length}] 📝 Procesando artisan_id: ${artisanId} (user_id: ${userId})`);

            try {
                // PASO 3: Obtener artisan_profile JSONB de shop.artisan_shops
                const shops = await queryRunner.query(`
                    SELECT artisan_profile
                    FROM shop.artisan_shops
                    WHERE user_id = $1
                    LIMIT 1
                `, [userId]);

                if (!shops || shops.length === 0) {
                    console.log(`   ⚠️  No se encontró artisan_shop para user_id: ${userId}`);
                    totalSkipped++;
                    continue;
                }

                const artisanProfileData = shops[0].artisan_profile;

                if (!artisanProfileData) {
                    console.log(`   ⚠️  artisan_profile es NULL para user_id: ${userId}`);
                    totalSkipped++;
                    continue;
                }

                // PASO 4: Extraer arrays de fotos del JSONB
                const familyPhotos = artisanProfileData.familyPhotos || [];
                const workingPhotos = artisanProfileData.workingPhotos || [];
                const workshopPhotos = artisanProfileData.workshopPhotos || [];
                const communityPhotos = artisanProfileData.communityPhotos || [];

                const totalPhotos = familyPhotos.length + workingPhotos.length +
                                  workshopPhotos.length + communityPhotos.length;

                if (totalPhotos === 0) {
                    console.log(`   ℹ️  No hay fotos para migrar`);
                    totalSkipped++;
                    continue;
                }

                console.log(`   📸 Fotos encontradas: ${totalPhotos} (family: ${familyPhotos.length}, working: ${workingPhotos.length}, workshop: ${workshopPhotos.length}, community: ${communityPhotos.length})`);

                // PASO 5: Insertar fotos en artisan_media_family
                if (familyPhotos.length > 0) {
                    for (let j = 0; j < familyPhotos.length; j++) {
                        const mediaUrl = familyPhotos[j];
                        if (mediaUrl && mediaUrl.trim() !== '') {
                            await queryRunner.query(`
                                INSERT INTO artesanos.artisan_media_family (
                                    artisan_id,
                                    media_url,
                                    media_type,
                                    is_primary
                                )
                                VALUES ($1, $2, $3, $4)
                            `, [artisanId, mediaUrl, 'image', j === 0]);
                            familyPhotosCount++;
                        }
                    }
                    console.log(`   ✅ ${familyPhotos.length} fotos insertadas en artisan_media_family`);
                }

                // PASO 6: Insertar fotos en artisan_media_working
                if (workingPhotos.length > 0) {
                    for (let j = 0; j < workingPhotos.length; j++) {
                        const mediaUrl = workingPhotos[j];
                        if (mediaUrl && mediaUrl.trim() !== '') {
                            await queryRunner.query(`
                                INSERT INTO artesanos.artisan_media_working (
                                    artisan_id,
                                    media_url,
                                    media_type,
                                    is_primary
                                )
                                VALUES ($1, $2, $3, $4)
                            `, [artisanId, mediaUrl, 'image', j === 0]);
                            workingPhotosCount++;
                        }
                    }
                    console.log(`   ✅ ${workingPhotos.length} fotos insertadas en artisan_media_working`);
                }

                // PASO 7: Insertar fotos en artisan_media_workshop
                if (workshopPhotos.length > 0) {
                    for (let j = 0; j < workshopPhotos.length; j++) {
                        const mediaUrl = workshopPhotos[j];
                        if (mediaUrl && mediaUrl.trim() !== '') {
                            await queryRunner.query(`
                                INSERT INTO artesanos.artisan_media_workshop (
                                    artisan_id,
                                    media_url,
                                    media_type,
                                    is_primary
                                )
                                VALUES ($1, $2, $3, $4)
                            `, [artisanId, mediaUrl, 'image', j === 0]);
                            workshopPhotosCount++;
                        }
                    }
                    console.log(`   ✅ ${workshopPhotos.length} fotos insertadas en artisan_media_workshop`);
                }

                // PASO 8: Insertar fotos en artisan_media_community
                if (communityPhotos.length > 0) {
                    for (let j = 0; j < communityPhotos.length; j++) {
                        const mediaUrl = communityPhotos[j];
                        if (mediaUrl && mediaUrl.trim() !== '') {
                            await queryRunner.query(`
                                INSERT INTO artesanos.artisan_media_community (
                                    artisan_id,
                                    media_url,
                                    media_type,
                                    is_primary
                                )
                                VALUES ($1, $2, $3, $4)
                            `, [artisanId, mediaUrl, 'image', j === 0]);
                            communityPhotosCount++;
                        }
                    }
                    console.log(`   ✅ ${communityPhotos.length} fotos insertadas en artisan_media_community`);
                }

                totalProcessed++;
                console.log(`   ✅ Procesado exitosamente\n`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`   ❌ Error procesando artisan_id ${artisanId}:`, errorMessage);
                totalErrors++;
            }
        }

        // Reporte final
        console.log('\n🎉 Migración completada:');
        console.log(`   ✅ Artesanos procesados: ${totalProcessed}`);
        console.log(`   ⚠️  Artesanos saltados (sin shop o sin fotos): ${totalSkipped}`);
        console.log(`   ❌ Artesanos con errores: ${totalErrors}`);
        console.log(`\n📊 Estadísticas de fotos migradas:`);
        console.log(`   📷 Family photos: ${familyPhotosCount}`);
        console.log(`   📷 Working photos: ${workingPhotosCount}`);
        console.log(`   📷 Workshop photos: ${workshopPhotosCount}`);
        console.log(`   📷 Community photos: ${communityPhotosCount}`);
        console.log(`   📷 TOTAL: ${familyPhotosCount + workingPhotosCount + workshopPhotosCount + communityPhotosCount}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo migración de fotos de artesanos...\n');

        // PASO 1: Obtener todos los artisan_ids que tienen fotos migradas
        console.log('📝 PASO 1: Obteniendo IDs de artesanos con fotos migradas...');
        const artisanIds = await queryRunner.query(`
            SELECT DISTINCT artisan_id
            FROM (
                SELECT artisan_id FROM artesanos.artisan_media_family
                UNION
                SELECT artisan_id FROM artesanos.artisan_media_working
                UNION
                SELECT artisan_id FROM artesanos.artisan_media_workshop
                UNION
                SELECT artisan_id FROM artesanos.artisan_media_community
            ) AS all_media
        `);
        console.log(`✅ ${artisanIds.length} artesanos con fotos encontrados\n`);

        if (artisanIds.length === 0) {
            console.log('⚠️  No hay fotos para eliminar');
            return;
        }

        // PASO 2: Eliminar fotos de cada tabla
        console.log('📝 PASO 2: Eliminando fotos de las tablas...\n');

        console.log('   🗑️  Eliminando fotos de artisan_media_family...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_media_family
            WHERE artisan_id IN (
                SELECT id FROM artesanos.artisan_profile
            )
        `);
        console.log(`   ✅ Registros eliminados\n`);

        console.log('   🗑️  Eliminando fotos de artisan_media_working...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_media_working
            WHERE artisan_id IN (
                SELECT id FROM artesanos.artisan_profile
            )
        `);
        console.log(`   ✅ Registros eliminados\n`);

        console.log('   🗑️  Eliminando fotos de artisan_media_workshop...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_media_workshop
            WHERE artisan_id IN (
                SELECT id FROM artesanos.artisan_profile
            )
        `);
        console.log(`   ✅ Registros eliminados\n`);

        console.log('   🗑️  Eliminando fotos de artisan_media_community...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_media_community
            WHERE artisan_id IN (
                SELECT id FROM artesanos.artisan_profile
            )
        `);
        console.log(`   ✅ Registros eliminados\n`);

        console.log('✅ Rollback completado - Todas las fotos migradas han sido eliminadas');
    }

}
