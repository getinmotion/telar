import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserProfiles() {
  const logger = new MigrationLogger('user-profiles');

  try {
    logger.log('📊 Contando perfiles de usuario en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.user_profiles
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de perfiles a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay perfiles de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer perfiles de Supabase
    logger.log('📖 Leyendo perfiles de usuario de Supabase...');
    const profiles = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        full_name,
        avatar_url,
        created_at,
        updated_at,
        business_description,
        brand_name,
        business_type,
        target_market,
        current_stage,
        business_goals,
        monthly_revenue_goal,
        time_availability,
        team_size,
        current_challenges,
        sales_channels,
        social_media_presence,
        business_location,
        years_in_business,
        initial_investment_range,
        primary_skills,
        language_preference,
        user_type,
        first_name,
        last_name,
        whatsapp_e164,
        department,
        city,
        rut,
        rut_pendiente,
        newsletter_opt_in,
        account_type,
        dane_city
      FROM public.user_profiles
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Perfiles leídos: ${profiles.length}\n`);

    // 3. Migrar perfiles
    logger.log('💾 Migrando perfiles a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, profile] of profiles.entries()) {
      try {
        // Función para transformar URLs de Supabase a paths relativos de S3
        const transformSupabaseUrlToS3Path = (url: string | null): string | null => {
          if (!url || url.trim() === '') return null;
          if (!url.includes('ylooqmqmoufqtxvetxuj.supabase.co')) return url;
          try {
            const match = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
            if (!match) return null;
            return `/images/${match[1]}`;
          } catch {
            return null;
          }
        };

        const avatarPath = transformSupabaseUrlToS3Path(profile.avatar_url);

        // Insertar en producción (schema artesanos)
        await productionConnection.query(
          `
          INSERT INTO artesanos.user_profiles (
            id,
            user_id,
            full_name,
            avatar_url,
            created_at,
            updated_at,
            business_description,
            brand_name,
            business_type,
            target_market,
            current_stage,
            business_goals,
            monthly_revenue_goal,
            time_availability,
            team_size,
            current_challenges,
            sales_channels,
            social_media_presence,
            business_location,
            years_in_business,
            initial_investment_range,
            primary_skills,
            language_preference,
            user_type,
            first_name,
            last_name,
            whatsapp_e164,
            department,
            city,
            rut,
            rut_pendiente,
            newsletter_opt_in,
            account_type,
            dane_city
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = EXCLUDED.updated_at,
            business_description = EXCLUDED.business_description,
            brand_name = EXCLUDED.brand_name,
            business_type = EXCLUDED.business_type,
            target_market = EXCLUDED.target_market,
            current_stage = EXCLUDED.current_stage,
            business_goals = EXCLUDED.business_goals,
            monthly_revenue_goal = EXCLUDED.monthly_revenue_goal,
            time_availability = EXCLUDED.time_availability,
            team_size = EXCLUDED.team_size,
            current_challenges = EXCLUDED.current_challenges,
            sales_channels = EXCLUDED.sales_channels,
            social_media_presence = EXCLUDED.social_media_presence,
            business_location = EXCLUDED.business_location,
            years_in_business = EXCLUDED.years_in_business,
            initial_investment_range = EXCLUDED.initial_investment_range,
            primary_skills = EXCLUDED.primary_skills,
            language_preference = EXCLUDED.language_preference,
            user_type = EXCLUDED.user_type,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            whatsapp_e164 = EXCLUDED.whatsapp_e164,
            department = EXCLUDED.department,
            city = EXCLUDED.city,
            rut = EXCLUDED.rut,
            rut_pendiente = EXCLUDED.rut_pendiente,
            newsletter_opt_in = EXCLUDED.newsletter_opt_in,
            account_type = EXCLUDED.account_type,
            dane_city = EXCLUDED.dane_city
        `,
          [
            profile.id,
            profile.user_id,
            profile.full_name,
            avatarPath, // Transformado a path relativo S3
            profile.created_at,
            profile.updated_at,
            profile.business_description,
            profile.brand_name,
            profile.business_type,
            profile.target_market,
            profile.current_stage,
            profile.business_goals,
            profile.monthly_revenue_goal,
            profile.time_availability,
            profile.team_size,
            profile.current_challenges,
            profile.sales_channels,
            profile.social_media_presence,
            profile.business_location,
            profile.years_in_business,
            profile.initial_investment_range,
            profile.primary_skills,
            profile.language_preference,
            profile.user_type,
            profile.first_name,
            profile.last_name,
            profile.whatsapp_e164,
            profile.department,
            profile.city,
            profile.rut,
            profile.rut_pendiente,
            profile.newsletter_opt_in,
            profile.account_type,
            profile.dane_city,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando perfil ${profile.user_id || profile.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de perfiles de usuario', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserProfiles();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
