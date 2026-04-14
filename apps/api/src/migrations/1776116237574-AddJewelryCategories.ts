import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJewelryCategories1776116237574 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Agregando categorías de joyería a taxonomy.categories...\n');

        const categories = [
            { name: 'Aretes', slug: 'aretes', description: 'Aretes artesanales y joyería para orejas' },
            { name: 'Collares', slug: 'collares', description: 'Collares artesanales y bisutería para cuello' },
            { name: 'Pulseras', slug: 'pulseras', description: 'Pulseras artesanales y joyería para muñecas' },
            { name: 'Anillos', slug: 'anillos', description: 'Anillos artesanales y joyería para dedos' },
            { name: 'Broches', slug: 'broches', description: 'Broches artesanales y accesorios decorativos' },
            { name: 'Tobilleras', slug: 'tobilleras', description: 'Tobilleras artesanales y joyería para tobillos' }
        ];

        for (const category of categories) {
            console.log(`➕ Insertando categoría: ${category.name}`);
            await queryRunner.query(`
                INSERT INTO taxonomy.categories (name, slug, description, created_at, updated_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                ON CONFLICT (slug) DO NOTHING
            `, [category.name, category.slug, category.description]);
        }

        console.log('\n🎉 Categorías de joyería agregadas exitosamente:');
        console.log('   ✅ Aretes');
        console.log('   ✅ Collares');
        console.log('   ✅ Pulseras');
        console.log('   ✅ Anillos');
        console.log('   ✅ Broches');
        console.log('   ✅ Tobilleras');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Eliminando categorías de joyería de taxonomy.categories...\n');

        const slugs = ['aretes', 'collares', 'pulseras', 'anillos', 'broches', 'tobilleras'];

        for (const slug of slugs) {
            console.log(`🗑️  Eliminando categoría: ${slug}`);
            await queryRunner.query(`
                DELETE FROM taxonomy.categories
                WHERE slug = $1
            `, [slug]);
        }

        console.log('\n🔄 Rollback completado - Categorías de joyería eliminadas');
    }

}
