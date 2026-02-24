-- =====================================================
-- MIGRACIÓN DE SEGURIDAD: Corregir funciones sin search_path
-- =====================================================

-- Función para verificar promo codes
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  p_code text, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_cart_total numeric DEFAULT 0, 
  p_user_email text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_gift_card RECORD;
  v_coupon RECORD;
  v_discount_amount NUMERIC;
BEGIN
  -- Buscar gift card
  SELECT * INTO v_gift_card
  FROM public.gift_cards
  WHERE code = upper(trim(p_code))
    AND is_active = true
    AND remaining_amount > 0
    AND (expires_at IS NULL OR expires_at > now());
  
  IF FOUND THEN
    v_discount_amount := LEAST(v_gift_card.remaining_amount, p_cart_total);
    
    RETURN jsonb_build_object(
      'valid', true,
      'type', 'GIFTCARD',
      'discount_amount', v_discount_amount,
      'new_total', GREATEST(p_cart_total - v_discount_amount, 0),
      'remaining_balance', v_gift_card.remaining_amount,
      'message', 'Gift card válida. Saldo disponible: $' || v_gift_card.remaining_amount::TEXT
    );
  END IF;
  
  -- Código no encontrado
  RETURN jsonb_build_object(
    'valid', false,
    'type', NULL,
    'discount_amount', 0,
    'new_total', p_cart_total,
    'message', 'Código inválido o expirado'
  );
END;
$function$;

-- Función para calcular XP del siguiente nivel
CREATE OR REPLACE FUNCTION public.calculate_next_level_xp(current_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN FLOOR(100 * POWER(1.5, current_level - 1));
END;
$function$;

-- Triggers actualizados con search_path
CREATE OR REPLACE FUNCTION public.update_user_progress_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.maintain_shop_embeddings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_brand_themes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_agent_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_agent_chat_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_artisan_global_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- =====================================================
-- FUNCIÓN DE LIMPIEZA PROGRAMADA
-- =====================================================

CREATE OR REPLACE FUNCTION public.scheduled_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpiar rate limits antiguos (más de 1 día)
  DELETE FROM public.auth_rate_limits
  WHERE first_attempt < NOW() - INTERVAL '1 day';
  
  -- Limpiar tokens de reset de contraseña expirados o usados
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
  
  -- Limpiar códigos OTP expirados
  DELETE FROM public.otp_codes
  WHERE expires_at < NOW();
  
  -- Log de la limpieza
  RAISE NOTICE 'Scheduled cleanup completed at %', NOW();
END;
$function$;

-- =====================================================
-- HABILITAR REALTIME PARA TABLAS CRÍTICAS (admin)
-- =====================================================

-- Agregar tablas a la publicación de realtime si no existen
DO $$
BEGIN
  -- Verificar y agregar products
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
  
  -- Verificar y agregar orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  
  -- Verificar y agregar artisan_shops
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'artisan_shops'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE artisan_shops;
  END IF;
  
  -- Verificar y agregar user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
  END IF;
END $$;

-- Configurar REPLICA IDENTITY para realtime
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE artisan_shops REPLICA IDENTITY FULL;
ALTER TABLE user_profiles REPLICA IDENTITY FULL;