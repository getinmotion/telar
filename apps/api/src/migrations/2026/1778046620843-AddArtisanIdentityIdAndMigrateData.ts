import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtisanIdentityIdAndMigrateData1778046620843 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando migración de datos de identidad artesanal desde JSONB a artisan_identity...\n');

        // PASO 1: Agregar columna artisan_identity_id a artisan_profile
        console.log('📝 PASO 1: Agregando columna artisan_identity_id a artisan_profile...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN artisan_identity_id UUID NULL;
        `);
        console.log('✅ Columna agregada\n');

        // PASO 2: Obtener todos los registros de artisan_profile
        console.log('📝 PASO 2: Obteniendo registros de artisan_profile...');
        const artisanProfiles = await queryRunner.query(`
            SELECT id, user_id
            FROM artesanos.artisan_profile
            WHERE user_id IS NOT NULL
            ORDER BY created_at
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
        console.log('📝 PASO 3: Procesando cada artisan_profile...\n');
        for (let i = 0; i < artisanProfiles.length; i++) {
            const profile = artisanProfiles[i];
            const artisanId = profile.id;
            const userId = profile.user_id;

            console.log(`[${i + 1}/${artisanProfiles.length}] 📝 Procesando artisan_id: ${artisanId} (user_id: ${userId})`);

            try {
                // PASO 4: Obtener artisan_profile JSONB de shop.artisan_shops
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

                // PASO 5: Extraer datos del JSONB
                const uniqueness = artisanProfileData.uniqueness || null;
                const averageTime = artisanProfileData.averageTime || null;
                const craftMessage = artisanProfileData.craftMessage || null;
                const motivation = artisanProfileData.motivation || null;

                // Verificar si hay al menos un dato para migrar
                const hasData = uniqueness || averageTime || craftMessage || motivation;

                if (!hasData) {
                    console.log(`   ℹ️  No hay datos de identidad para migrar`);
                    skippedCount++;
                    continue;
                }

                console.log(`   📋 Datos extraídos del JSON:`);
                if (uniqueness) console.log(`      - uniqueness: "${uniqueness.substring(0, 50)}..."`);
                if (averageTime) console.log(`      - averageTime: "${averageTime}"`);
                if (craftMessage) console.log(`      - craftMessage: "${craftMessage.substring(0, 50)}..."`);
                if (motivation) console.log(`      - motivation: "${motivation.substring(0, 50)}..."`);

                // PASO 6: Insertar en artisan_identity (dejando techniques en NULL)
                console.log(`   💾 Insertando registro en artisan_identity...`);
                const insertResult = await queryRunner.query(`
                    INSERT INTO artesanos.artisan_identity (
                        technique_primary_id,
                        technique_secondary_id,
                        craft_message,
                        motivation,
                        uniqueness,
                        average_time
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id
                `, [
                    null, // technique_primary_id (NULL como solicitado)
                    null, // technique_secondary_id (NULL como solicitado)
                    craftMessage,
                    motivation,
                    uniqueness,
                    averageTime
                ]);

                const newIdentityId = insertResult[0].id;
                console.log(`   ✅ Registro creado con ID: ${newIdentityId}`);

                // PASO 7: Actualizar artisan_profile con el nuevo artisan_identity_id
                console.log(`   🔄 Actualizando artisan_profile...`);
                await queryRunner.query(`
                    UPDATE artesanos.artisan_profile
                    SET artisan_identity_id = $1
                    WHERE id = $2
                `, [newIdentityId, artisanId]);

                console.log(`   ✅ Registro actualizado exitosamente\n`);
                successCount++;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`   ❌ Error procesando artisan_id ${artisanId}:`, errorMessage);
                errorCount++;
            }
        }

        // PASO 8: Agregar FK constraint
        console.log('📝 PASO 8: Agregando constraint de FK...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD CONSTRAINT fk_artisan_profile_identity
            FOREIGN KEY (artisan_identity_id)
            REFERENCES artesanos.artisan_identity(id)
            ON DELETE SET NULL;
        `);
        console.log('✅ Constraint agregado\n');

        // PASO 9: Crear índice para mejorar performance
        console.log('📝 PASO 9: Creando índice...');
        await queryRunner.query(`
            CREATE INDEX idx_artisan_profile_identity_id
            ON artesanos.artisan_profile(artisan_identity_id);
        `);
        console.log('✅ Índice creado\n');

        console.log('🎉 Migración completada:');
        console.log(`   ✅ Registros migrados exitosamente: ${successCount}`);
        console.log(`   ⚠️  Registros saltados (sin shop o sin datos): ${skippedCount}`);
        console.log(`   ❌ Registros con errores: ${errorCount}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo migración de identidad artesanal...\n');

        // Eliminar índice
        console.log('📝 Eliminando índice...');
        await queryRunner.query(`
            DROP INDEX IF EXISTS artesanos.idx_artisan_profile_identity_id;
        `);
        console.log('✅ Índice eliminado\n');

        // Eliminar FK constraint
        console.log('📝 Eliminando constraint de FK...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP CONSTRAINT IF EXISTS fk_artisan_profile_identity;
        `);
        console.log('✅ Constraint eliminado\n');

        // Eliminar todos los registros de artisan_identity que fueron creados
        console.log('📝 Eliminando registros de artisan_identity...');
        await queryRunner.query(`
            DELETE FROM artesanos.artisan_identity
            WHERE id IN (
                SELECT artisan_identity_id
                FROM artesanos.artisan_profile
                WHERE artisan_identity_id IS NOT NULL
            );
        `);
        console.log('✅ Registros eliminados\n');

        // Eliminar columna
        console.log('📝 Eliminando columna artisan_identity_id...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS artisan_identity_id;
        `);
        console.log('✅ Columna eliminada\n');

        console.log('✅ Rollback completado');
    }

}
