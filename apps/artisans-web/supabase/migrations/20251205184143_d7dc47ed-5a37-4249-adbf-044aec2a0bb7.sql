-- Create secure function to get current user email (avoids direct auth.users access in RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view gift cards by email" ON public.gift_cards;
DROP POLICY IF EXISTS "Users can view their gift card transactions" ON public.gift_card_transactions;

-- Recreate policies using secure function
CREATE POLICY "Users can view gift cards by email" ON public.gift_cards
FOR SELECT USING (
  is_admin() OR
  purchaser_email = public.get_current_user_email() OR
  recipient_email = public.get_current_user_email()
);

CREATE POLICY "Users can view their gift card transactions" ON public.gift_card_transactions
FOR SELECT USING (
  is_admin() OR
  gift_card_id IN (
    SELECT id FROM public.gift_cards 
    WHERE purchaser_email = public.get_current_user_email() 
    OR recipient_email = public.get_current_user_email()
  )
);