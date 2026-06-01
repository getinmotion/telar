import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanS3LogoUrlsInArtisanShops1774861992407 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Limpiando URLs de S3 en logo_url de artisan_shops...');

        // Contar registros con URLs de S3
        const countResult = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM shop.artisan_shops
            WHERE logo_url LIKE 'https://telar-prod-bucket.s3%'
        `);
        console.log(`📊 Registros encontrados con URL de S3: ${countResult[0].count}`);

        if (countResult[0].count > 0) {
            // Extraer la ruta desde /images/brands/ en adelante
            await queryRunner.query(`
                UPDATE shop.artisan_shops
                SET logo_url = SUBSTRING(logo_url FROM '/images/brands/.*$')
                WHERE logo_url LIKE 'https://telar-prod-bucket.s3%'
                  AND logo_url LIKE '%/images/brands/%'
            `);
            console.log(`✅ ${countResult[0].count} registros actualizados`);
        }

        // Verificar si quedaron URLs completas
        const remainingResult = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM shop.artisan_shops
            WHERE logo_url LIKE 'https://%'
        `);

        if (remainingResult[0].count > 0) {
            console.warn(`⚠️  Aún quedan ${remainingResult[0].count} registros con URLs completas`);

            const problematicRecords = await queryRunner.query(`
                SELECT id, shop_name, logo_url
                FROM shop.artisan_shops
                WHERE logo_url LIKE 'https://%'
                LIMIT 10
            `);
            console.log('📋 Registros que aún tienen URLs completas:', problematicRecords);
        } else {
            console.log('🎉 Todas las URLs fueron convertidas a rutas relativas exitosamente');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  Esta migración no es reversible automáticamente');
        console.log('Las URLs completas de S3 fueron convertidas a rutas relativas y no se puede recuperar la URL base original');
    }

}
