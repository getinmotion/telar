/**
 * Funciones de fetch puras para los 6 módulos del MasterAgentContext.
 * Extraídas del switch-case de refreshModule para ser usadas con React Query.
 * Cada función recibe userId y devuelve el estado parcial del módulo correspondiente.
 */
import { CategoryScore } from '@/types/dashboard';
import { MasterAgentState } from '@/types/agentContracts';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getTaskStepsByUserId } from '@/services/taskSteps.actions';
import { getProductsByUserId } from '@/services/products.actions';

export async function fetchPerfil(
  userId: string,
  userEmail: string,
): Promise<MasterAgentState['perfil']> {
  const profile = await getUserProfileByUserId(userId).catch(() => null);
  return {
    nombre: profile?.brandName || profile?.fullName || '',
    email: userEmail,
    whatsapp: profile?.whatsappE164 || '',
    nit: profile?.rut || '',
    nit_pendiente: profile?.rutPendiente || !profile?.rut,
  };
}

export async function fetchMarca(userId: string): Promise<MasterAgentState['marca']> {
  const [profile, contextData, shopData] = await Promise.all([
    getUserProfileByUserId(userId).catch(() => null),
    getUserMasterContextByUserId(userId).catch(() => null),
    getArtisanShopByUserId(userId).catch(() => null),
  ]);

  const brandEval = (contextData?.businessContext as Record<string, unknown>)
    ?.brand_evaluation as Record<string, unknown> | undefined;

  const logoUrl =
    profile?.avatarUrl ||
    (brandEval?.logo_url as string | undefined) ||
    shopData?.logoUrl ||
    null;

  const hasLogo = !!logoUrl;
  const colors = (brandEval?.colors as string[] | undefined) || [];
  const hasColors = colors.length > 0;
  const claim = (brandEval?.claim as string | undefined) || profile?.businessDescription || '';
  const hasClaim = !!claim;

  let score = 0;
  if (hasLogo) score += 40;
  if (hasColors) score += 30;
  if (hasClaim) score += 30;

  return {
    logo: logoUrl,
    colores: colors,
    claim,
    score: (brandEval?.score as number | undefined) || score,
    updated_at:
      (brandEval?.evaluation_date as string | undefined) || profile?.updatedAt || null,
  };
}

export async function fetchTienda(userId: string): Promise<MasterAgentState['tienda']> {
  const shop = await getArtisanShopByUserId(userId).catch(() => null);

  if (!shop) {
    return {
      id: null,
      url: null,
      shop_name: null,
      theme: undefined,
      published: false,
      products_count: 0,
      has_shop: false,
    };
  }

  const products = await getProductsByUserId(userId).catch(() => []);

  return {
    id: shop.id,
    url: shop.shopSlug,
    shop_name: shop.shopName || null,
    theme: undefined,
    published: shop.active,
    products_count: products.length,
    has_shop: true,
    hero_config: (shop.heroConfig as MasterAgentState['tienda']['hero_config']) || { slides: [] },
    story: shop.story || undefined,
    about_content: shop.aboutContent as { story?: string } | undefined,
    contact_info: shop.contactInfo as MasterAgentState['tienda']['contact_info'],
    social_links: (shop.socialLinks as Record<string, string>) || {},
  };
}

export async function fetchInventario(userId: string): Promise<MasterAgentState['inventario']> {
  const shop = await getArtisanShopByUserId(userId).catch(() => null);

  if (!shop?.id) {
    return { productos: [], variantes: [], stock_total: 0, low_stock: [], sin_precio: [] };
  }

  const products = await getProductsByUserId(userId).catch(() => []);

  const lowStock = products.filter((p) => (p.inventory || 0) < 5);
  const sinPrecio = products.filter((p) => !p.price || p.price === 0);
  const stockTotal = products.reduce((sum, p) => sum + (p.inventory || 0), 0);

  return {
    productos: products,
    variantes: [],
    stock_total: stockTotal,
    low_stock: lowStock,
    sin_precio: sinPrecio,
  };
}

export async function fetchPricing(userId: string): Promise<MasterAgentState['pricing']> {
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', userId);

  return {
    reglas: [],
    hojas_costos: (materials as Record<string, unknown>[]) || [],
    last_update: (materials?.[0] as Record<string, unknown> | undefined)?.created_at as string | null ?? null,
  };
}

export async function fetchGrowth(userId: string): Promise<MasterAgentState['growth']> {
  const [contextData, taskSteps] = await Promise.all([
    getUserMasterContextByUserId(userId).catch(() => null),
    getTaskStepsByUserId(userId).catch(() => []),
  ]);

  const taskGenContext = contextData?.taskGenerationContext as Record<string, unknown> | undefined;
  const maturityScores = taskGenContext?.maturityScores as CategoryScore | undefined;

  const tasksMap = new Map<string, Record<string, unknown>>();
  taskSteps.forEach((step) => {
    if (!tasksMap.has(step.taskId)) {
      tasksMap.set(step.taskId, {
        id: step.task.id,
        user_id: step.task.userId,
        agent_id: step.task.agentId,
        title: step.task.title,
        description: step.task.description,
        status: step.task.status,
        priority: step.task.priority,
        created_at: step.task.createdAt,
        updated_at: step.task.updatedAt,
        steps: [],
      });
    }
    (tasksMap.get(step.taskId)!.steps as unknown[]).push({
      id: step.id,
      step_number: step.stepNumber,
      title: step.title,
      description: step.description,
      completion_status: step.completionStatus,
      input_type: step.inputType,
      validation_criteria: step.validationCriteria,
      ai_context_prompt: step.aiContextPrompt,
    });
  });

  const tasksWithSteps = Array.from(tasksMap.values()).sort(
    (a, b) =>
      new Date(b.created_at as string).getTime() -
      new Date(a.created_at as string).getTime(),
  );

  return {
    nivel_madurez: maturityScores || {
      ideaValidation: 0,
      userExperience: 0,
      marketFit: 0,
      monetization: 0,
    },
    plan: '',
    misiones: tasksWithSteps,
  };
}
