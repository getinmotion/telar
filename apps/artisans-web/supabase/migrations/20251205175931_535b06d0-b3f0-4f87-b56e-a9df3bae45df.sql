
-- =============================================
-- PROMOTIONS SYSTEM: GIFT CARDS & COUPONS
-- =============================================

-- 1. GIFT CARDS TABLE
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  initial_amount NUMERIC NOT NULL CHECK (initial_amount > 0),
  remaining_amount NUMERIC NOT NULL CHECK (remaining_amount >= 0),
  currency TEXT DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'depleted', 'blocked')),
  expiration_date TIMESTAMPTZ,
  purchaser_email TEXT NOT NULL,
  recipient_email TEXT,
  message TEXT,
  marketplace_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GIFT CARD TRANSACTIONS TABLE
CREATE TABLE public.gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  amount_used NUMERIC NOT NULL CHECK (amount_used > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COUPONS TABLE
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed_amount')),
  value NUMERIC NOT NULL CHECK (value > 0),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  min_order_amount NUMERIC,
  max_discount_amount NUMERIC,
  usage_limit_total INTEGER,
  usage_limit_per_user INTEGER,
  times_used INTEGER DEFAULT 0,
  conditions_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_admin_id UUID
);

-- 4. COUPON REDEMPTIONS TABLE
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID,
  user_email TEXT,
  order_id TEXT NOT NULL,
  amount_discounted NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX idx_gift_cards_purchaser_email ON public.gift_cards(purchaser_email);
CREATE INDEX idx_gift_card_transactions_gift_card_id ON public.gift_card_transactions(gift_card_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger for gift_cards
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for coupons
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update gift card status to depleted when remaining_amount reaches 0
CREATE OR REPLACE FUNCTION public.check_gift_card_depleted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.remaining_amount = 0 AND NEW.status = 'active' THEN
    NEW.status := 'depleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER gift_card_depleted_check
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.check_gift_card_depleted();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- GIFT CARDS POLICIES
CREATE POLICY "Admins can manage all gift cards" ON public.gift_cards
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Service can insert gift cards" ON public.gift_cards
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update gift cards" ON public.gift_cards
FOR UPDATE USING (true);

CREATE POLICY "Users can view gift cards by email" ON public.gift_cards
FOR SELECT USING (
  purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- GIFT CARD TRANSACTIONS POLICIES
CREATE POLICY "Admins can view all gift card transactions" ON public.gift_card_transactions
FOR SELECT USING (public.is_admin());

CREATE POLICY "Service can insert gift card transactions" ON public.gift_card_transactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their gift card transactions" ON public.gift_card_transactions
FOR SELECT USING (
  gift_card_id IN (
    SELECT id FROM public.gift_cards 
    WHERE purchaser_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- COUPONS POLICIES
CREATE POLICY "Admins can manage all coupons" ON public.coupons
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view active public coupons" ON public.coupons
FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Service can update coupons" ON public.coupons
FOR UPDATE USING (true);

-- COUPON REDEMPTIONS POLICIES
CREATE POLICY "Admins can view all coupon redemptions" ON public.coupon_redemptions
FOR SELECT USING (public.is_admin());

CREATE POLICY "Service can insert coupon redemptions" ON public.coupon_redemptions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own redemptions" ON public.coupon_redemptions
FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTION: Generate Gift Card Code
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'GC-';
  i INTEGER;
  j INTEGER;
BEGIN
  FOR j IN 1..3 LOOP
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    IF j < 3 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
