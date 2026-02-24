-- FIX SECURITY DEFINER VIEWS - Convert to SECURITY INVOKER
-- =====================================================

-- Recreate marketplace_products view with security_invoker
DROP VIEW IF EXISTS public.marketplace_products;
CREATE VIEW public.marketplace_products WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.short_description,
  p.price,
  p.images->>0 as image_url,
  p.images,
  COALESCE(
    (SELECT SUM(pv.stock) FROM public.product_variants pv WHERE pv.product_id = p.id),
    p.inventory
  ) as stock,
  COALESCE(
    (SELECT AVG(pr.rating) FROM public.product_reviews pr WHERE pr.product_id = p.id),
    0
  ) as rating,
  (SELECT COUNT(*) FROM public.product_reviews pr WHERE pr.product_id = p.id) as reviews_count,
  (p.created_at > NOW() - INTERVAL '30 days') as is_new,
  false as free_shipping,
  p.created_at,
  p.updated_at,
  p.moderation_status,
  p.tags,
  p.materials,
  p.techniques,
  p.category,
  p.category as original_category,
  p.subcategory,
  p.sku,
  p.active,
  p.featured,
  p.customizable,
  p.made_to_order,
  p.lead_time_days,
  p.shipping_data_complete,
  p.tags->1 as craft,
  p.tags->0 as material,
  s.id as shop_id,
  s.shop_name as store_name,
  s.shop_slug as store_slug,
  s.logo_url,
  s.banner_url,
  s.description as store_description,
  s.region,
  (s.contact_info->>'city')::text as city,
  (s.contact_info->>'department')::text as department,
  s.craft_type,
  s.bank_data_status,
  CASE 
    WHEN s.bank_data_status = 'complete' AND COALESCE(p.shipping_data_complete, false) = true 
    THEN true 
    ELSE false 
  END as can_purchase
FROM public.products p
LEFT JOIN public.artisan_shops s ON p.shop_id = s.id
WHERE p.moderation_status IN ('approved', 'approved_with_edits')
  AND s.publish_status = 'published'
  AND s.marketplace_approved = true;

-- Enable RLS on remaining tables that need it
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_master_context ENABLE ROW LEVEL SECURITY;

-- Product categories - public read
DROP POLICY IF EXISTS "Anyone can view categories" ON public.product_categories;
CREATE POLICY "Anyone can view categories" ON public.product_categories FOR SELECT USING (true);

-- Product reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can manage their reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their reviews" ON public.product_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Product variants - same as products
DROP POLICY IF EXISTS "Anyone can view variants of approved products" ON public.product_variants;
DROP POLICY IF EXISTS "Shop owners can manage variants" ON public.product_variants;
CREATE POLICY "Anyone can view variants of approved products" ON public.product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.moderation_status IN ('approved', 'approved_with_edits'))
);
CREATE POLICY "Shop owners can manage variants" ON public.product_variants FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.artisan_shops s ON s.id = p.shop_id WHERE p.id = product_id AND s.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p JOIN public.artisan_shops s ON s.id = p.shop_id WHERE p.id = product_id AND s.user_id = auth.uid())
);

-- Notifications - users can only see their own
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agent tasks - users can only see their own
DROP POLICY IF EXISTS "Users can view their tasks" ON public.agent_tasks;
DROP POLICY IF EXISTS "Users can manage their tasks" ON public.agent_tasks;
CREATE POLICY "Users can view their tasks" ON public.agent_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their tasks" ON public.agent_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agent chat conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.agent_chat_conversations;
DROP POLICY IF EXISTS "Users can manage their conversations" ON public.agent_chat_conversations;
CREATE POLICY "Users can view their conversations" ON public.agent_chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their conversations" ON public.agent_chat_conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agent messages - through conversation ownership
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.agent_messages;
DROP POLICY IF EXISTS "Users can add messages to their conversations" ON public.agent_messages;
CREATE POLICY "Users can view messages in their conversations" ON public.agent_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.agent_chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can add messages to their conversations" ON public.agent_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.agent_chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);

-- User master context
DROP POLICY IF EXISTS "Users can view their context" ON public.user_master_context;
DROP POLICY IF EXISTS "Users can manage their context" ON public.user_master_context;
CREATE POLICY "Users can view their context" ON public.user_master_context FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their context" ON public.user_master_context FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);