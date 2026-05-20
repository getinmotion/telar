import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedColumnsFromUserProfiles1776816296091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Eliminando columnas no utilizadas de artesanos.user_profiles...\n');

        const columnsToRemove = [
            'business_type',
            'target_market',
            'current_stage',
            'business_goals',
            'monthly_revenue_goal',
            'time_availability',
            'team_size',
            'current_challenges',
            'sales_channels',
            'social_media_presence',
            'business_location',
            'years_in_business',
            'initial_investment_range',
            'primary_skills'
        ];

        for (const column of columnsToRemove) {
            console.log(`   🗑️  Eliminando columna: ${column}`);
            await queryRunner.query(`
                ALTER TABLE artesanos.user_profiles
                DROP COLUMN IF EXISTS ${column};
            `);
        }

        console.log(`\n✅ ${columnsToRemove.length} columnas eliminadas exitosamente`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Restaurando columnas en artesanos.user_profiles...\n');

        // Restaurar business_type
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS business_type TEXT;
        `);
        console.log('   ✅ business_type');

        // Restaurar target_market
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS target_market TEXT;
        `);
        console.log('   ✅ target_market');

        // Restaurar current_stage
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS current_stage TEXT;
        `);
        console.log('   ✅ current_stage');

        // Restaurar business_goals
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS business_goals TEXT[];
        `);
        console.log('   ✅ business_goals');

        // Restaurar monthly_revenue_goal
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS monthly_revenue_goal INTEGER;
        `);
        console.log('   ✅ monthly_revenue_goal');

        // Restaurar time_availability
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS time_availability TEXT;
        `);
        console.log('   ✅ time_availability');

        // Restaurar team_size
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS team_size TEXT;
        `);
        console.log('   ✅ team_size');

        // Restaurar current_challenges
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS current_challenges TEXT[];
        `);
        console.log('   ✅ current_challenges');

        // Restaurar sales_channels
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS sales_channels TEXT[];
        `);
        console.log('   ✅ sales_channels');

        // Restaurar social_media_presence
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS social_media_presence JSONB DEFAULT '{}';
        `);
        console.log('   ✅ social_media_presence');

        // Restaurar business_location
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS business_location TEXT;
        `);
        console.log('   ✅ business_location');

        // Restaurar years_in_business
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
        `);
        console.log('   ✅ years_in_business');

        // Restaurar initial_investment_range
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS initial_investment_range TEXT;
        `);
        console.log('   ✅ initial_investment_range');

        // Restaurar primary_skills
        await queryRunner.query(`
            ALTER TABLE artesanos.user_profiles
            ADD COLUMN IF NOT EXISTS primary_skills TEXT[];
        `);
        console.log('   ✅ primary_skills');

        console.log('\n🔄 Rollback completado');
        console.log('⚠️  NOTA: Las columnas fueron restauradas pero SIN datos');
    }

}
