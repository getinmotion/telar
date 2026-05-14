import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeUsersTable1776726369209 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Iniciando normalización de tabla public.users...\n');

        // PASO 1: Eliminar columnas no utilizadas
        console.log('🗑️  Eliminando columnas no utilizadas...\n');

        const columnsToRemove = [
            'invited_at',
            'confirmation_token',
            'confirmation_sent_at',
            'email_change_token_new',
            'email_change',
            'email_change_sent_at',
            'raw_app_meta_data',
            'raw_user_meta_data',
            'is_super_admin',
            'email_change_token_current',
            'email_change_confirm_status',
            'reauthentication_token',
            'reauthentication_sent_at',
            'is_sso_user',
            'is_anonymous'
        ];

        for (const column of columnsToRemove) {
            console.log(`   🗑️  Eliminando columna: ${column}`);
            await queryRunner.query(`
                ALTER TABLE auth.users
                DROP COLUMN IF EXISTS ${column};
            `);
        }

        console.log(`\n✅ ${columnsToRemove.length} columnas eliminadas exitosamente`);

        // PASO 2: Agregar nueva columna is_active (inicialmente nullable)
        console.log('\n📝 Agregando columna is_active...');
        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN is_active BOOLEAN DEFAULT NULL;
        `);
        console.log('✅ Columna is_active agregada (nullable)');

        // PASO 3: Actualizar todos los registros existentes a true
        console.log('\n🔄 Actualizando registros existentes a is_active = true...');
        const result = await queryRunner.query(`
            UPDATE auth.users
            SET is_active = true
            WHERE is_active IS NULL;
        `);
        console.log(`✅ Registros actualizados: ${result[1] || 'todos'}`);

        // PASO 4: Cambiar columna a NOT NULL con default true
        console.log('\n🔒 Configurando columna is_active como NOT NULL...');
        await queryRunner.query(`
            ALTER TABLE auth.users
            ALTER COLUMN is_active SET NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE auth.users
            ALTER COLUMN is_active SET DEFAULT true;
        `);
        console.log('✅ Columna is_active ahora es NOT NULL con default true');

        console.log('\n🎉 Normalización de tabla users completada:');
        console.log(`   ✅ ${columnsToRemove.length} columnas eliminadas`);
        console.log('   ✅ Nueva columna is_active agregada');
        console.log('   ✅ Todos los usuarios existentes marcados como activos');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Revirtiendo normalización de tabla users...\n');

        // PASO 1: Eliminar columna is_active
        console.log('🗑️  Eliminando columna is_active...');
        await queryRunner.query(`
            ALTER TABLE auth.users
            DROP COLUMN IF EXISTS is_active;
        `);
        console.log('✅ Columna is_active eliminada');

        // PASO 2: Restaurar columnas eliminadas (sin datos, solo estructura)
        console.log('\n📝 Restaurando columnas eliminadas...\n');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
        `);
        console.log('   ✅ invited_at');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);
        `);
        console.log('   ✅ confirmation_token');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;
        `);
        console.log('   ✅ confirmation_sent_at');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS email_change_token_new VARCHAR(255);
        `);
        console.log('   ✅ email_change_token_new');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS email_change VARCHAR(255);
        `);
        console.log('   ✅ email_change');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS email_change_sent_at TIMESTAMPTZ;
        `);
        console.log('   ✅ email_change_sent_at');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS raw_app_meta_data JSONB;
        `);
        console.log('   ✅ raw_app_meta_data');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB;
        `);
        console.log('   ✅ raw_user_meta_data');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
        `);
        console.log('   ✅ is_super_admin');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS email_change_token_current VARCHAR(255);
        `);
        console.log('   ✅ email_change_token_current');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS email_change_confirm_status SMALLINT DEFAULT 0;
        `);
        console.log('   ✅ email_change_confirm_status');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS reauthentication_token VARCHAR(255);
        `);
        console.log('   ✅ reauthentication_token');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS reauthentication_sent_at TIMESTAMPTZ;
        `);
        console.log('   ✅ reauthentication_sent_at');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS is_sso_user BOOLEAN DEFAULT false;
        `);
        console.log('   ✅ is_sso_user');

        await queryRunner.query(`
            ALTER TABLE auth.users
            ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
        `);
        console.log('   ✅ is_anonymous');

        console.log('\n🔄 Rollback completado');
        console.log('⚠️  NOTA: Las columnas fueron restauradas pero SIN datos');
    }

}
