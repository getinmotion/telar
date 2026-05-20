import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdTypeIdNumberGenderToArtisanProfile1776822944634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Agregando columnas id_type, id_number y gender a artisan_profile...\n');

        // 1. Crear tipo ENUM para id_type (cc, nit, ce, pa)
        console.log('📝 Creando tipo ENUM id_type_enum...');
        await queryRunner.query(`
            CREATE TYPE artesanos.id_type_enum AS ENUM ('cc', 'nit', 'ce', 'pa');
        `);

        // 2. Crear tipo ENUM para gender (M, F, SE)
        console.log('📝 Creando tipo ENUM gender_enum...');
        await queryRunner.query(`
            CREATE TYPE artesanos.gender_enum AS ENUM ('M', 'F', 'SE');
        `);

        // 3. Agregar columna id_type
        console.log('➕ Agregando columna id_type...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN id_type artesanos.id_type_enum NULL;
        `);

        // 4. Agregar columna id_number
        console.log('➕ Agregando columna id_number...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN id_number TEXT NULL;
        `);

        // 5. Agregar columna gender
        console.log('➕ Agregando columna gender...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            ADD COLUMN gender artesanos.gender_enum NULL;
        `);

        console.log('\n✅ Columnas agregadas exitosamente:');
        console.log('   ✅ id_type (ENUM: cc, nit, ce, pa)');
        console.log('   ✅ id_number (TEXT)');
        console.log('   ✅ gender (ENUM: M, F, SE)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Eliminando columnas id_type, id_number y gender...\n');

        // 1. Eliminar columna gender
        console.log('🗑️  Eliminando columna gender...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS gender;
        `);

        // 2. Eliminar columna id_number
        console.log('🗑️  Eliminando columna id_number...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS id_number;
        `);

        // 3. Eliminar columna id_type
        console.log('🗑️  Eliminando columna id_type...');
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            DROP COLUMN IF EXISTS id_type;
        `);

        // 4. Eliminar tipo ENUM gender_enum
        console.log('🗑️  Eliminando tipo ENUM gender_enum...');
        await queryRunner.query(`
            DROP TYPE IF EXISTS artesanos.gender_enum;
        `);

        // 5. Eliminar tipo ENUM id_type_enum
        console.log('🗑️  Eliminando tipo ENUM id_type_enum...');
        await queryRunner.query(`
            DROP TYPE IF EXISTS artesanos.id_type_enum;
        `);

        console.log('\n✅ Columnas y tipos ENUM eliminados exitosamente');
    }

}
