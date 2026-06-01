import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanLogoUrlInArtisanShops1774861792452 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Limpiando logo_url en artisan_shops...');

        // Primero, vemos cuántos registros tienen URLs completas
        const countResult = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM shop.artisan_shops
            WHERE logo_url LIKE 'https://%'
        `);
        console.log(`📊 Registros encontrados con URL completa: ${countResult[0].count}`);

        if (countResult[0].count > 0) {
            // Actualizar los registros, extrayendo solo la ruta desde /brand-assets/ en adelante
            await queryRunner.query(`
                UPDATE shop.artisan_shops
                SET logo_url = SUBSTRING(logo_url FROM '/brand-assets/.*$')
                WHERE logo_url LIKE 'https://%'
                  AND logo_url LIKE '%/brand-assets/%'
            `);
            console.log(`✅ ${countResult[0].count} registros actualizados`);
        }

        // Verificar si quedaron URLs completas (registros que no tengan /brand-assets/)
        const remainingResult = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM shop.artisan_shops
            WHERE logo_url LIKE 'https://%'
        `);

        if (remainingResult[0].count > 0) {
            console.warn(`⚠️  Quedan ${remainingResult[0].count} registros con URLs completas que no contienen /brand-assets/`);

            // Mostrar los registros que no se pudieron limpiar
            const problematicRecords = await queryRunner.query(`
                SELECT id, shop_name, logo_url
                FROM shop.artisan_shops
                WHERE logo_url LIKE 'https://%'
                LIMIT 5
            `);
            console.log('📋 Registros problemáticos:', problematicRecords);
        } else {
            console.log('🎉 Todos los registros fueron limpiados exitosamente');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  Esta migración no es reversible automáticamente');
        console.log('Las URLs completas fueron convertidas a rutas relativas y no se puede recuperar la URL base original');
    }

}
