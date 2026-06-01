import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveInstanceIdAndAudFromUsers1776727873685 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Eliminando columnas instance_id y aud de auth.users...\n');

        // Eliminar columna instance_id
        console.log('🗑️  Eliminando columna: instance_id');
        await queryRunner.query(`
            ALTER TABLE auth.users
            DROP COLUMN IF EXISTS instance_id;
        `);

        // Eliminar columna aud
        console.log('🗑️  Eliminando columna: aud');
        await queryRunner.query(`
            ALTER TABLE auth.users
            DROP COLUMN IF EXISTS aud;
        `);

        console.log('\n✅ Columnas instance_id y aud eliminadas exitosamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Restaurando columnas instance_id y aud en auth.users...\n');

        // Restaurar columna instance_id
        console.log('📝 Restaurando columna: instance_id');
        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS instance_id UUID;
        `);

        // Restaurar columna aud
        console.log('📝 Restaurando columna: aud');
        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS aud VARCHAR(255);
        `);

        console.log('\n🔄 Rollback completado');
        console.log('⚠️  NOTA: Las columnas fueron restauradas pero SIN datos');
    }

}
