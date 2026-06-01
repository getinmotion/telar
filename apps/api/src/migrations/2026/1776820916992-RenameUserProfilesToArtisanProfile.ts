import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserProfilesToArtisanProfile1776820916992 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Renombrando tabla user_profiles a artisan_profile...\n');

        // Renombrar la tabla
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            RENAME TO artisan_profile;
        `);

        console.log('✅ Tabla renombrada exitosamente a artesanos.artisan_profile');
        console.log('📝 NOTA: Las foreign keys, índices y constraints se actualizaron automáticamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo nombre de tabla a user_profiles...\n');

        // Revertir el nombre de la tabla
        await queryRunner.query(`
            ALTER TABLE artesanos.artisan_profile
            RENAME TO user_profiles;
        `);

        console.log('✅ Tabla renombrada de vuelta a artesanos.user_profiles');
    }

}
