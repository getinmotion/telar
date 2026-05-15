import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '@/utils/eventBus';
import { AgentInvocation, AgentResponse, MasterAgentState } from '@/types/agentContracts';
import { useDataCache } from './DataCacheContext';
import { getArtisanShopByUserId, updateArtisanShop } from '@/services/artisanShops.actions';
import { updateTaskStep as updateTaskStepService } from '@/services/taskSteps.actions';
import {
  fetchPerfil,
  fetchMarca,
  fetchTienda,
  fetchInventario,
  fetchPricing,
  fetchGrowth,
} from '@/services/masterAgent.queries';

// ─── Query keys ─────────────────────────────────────────────────────────────
const QK = {
  perfil:     (uid: string) => ['master-agent', uid, 'perfil']     as const,
  marca:      (uid: string) => ['master-agent', uid, 'marca']      as const,
  tienda:     (uid: string) => ['master-agent', uid, 'tienda']     as const,
  inventario: (uid: string) => ['master-agent', uid, 'inventario'] as const,
  pricing:    (uid: string) => ['master-agent', uid, 'pricing']    as const,
  growth:     (uid: string) => ['master-agent', uid, 'growth']     as const,
  all:        (uid: string) => ['master-agent', uid]               as const,
} as const;

// ─── Initial state (fallback while queries load) ─────────────────────────────
const initialState: MasterAgentState = {
  perfil:    { nombre: '', email: '', whatsapp: '', nit: '', nit_pendiente: false },
  marca:     { logo: null, colores: [], claim: '', score: 0, updated_at: null },
  tienda:    { id: null, url: null, shop_name: null, theme: undefined, published: false, products_count: 0, has_shop: false },
  inventario:{ productos: [], variantes: [], stock_total: 0, low_stock: [], sin_precio: [] },
  pricing:   { reglas: [], hojas_costos: [], last_update: null },
  presence:  { redes: [], engagement: 0, links_tienda: [] },
  growth:    { nivel_madurez: { ideaValidation: 0, userExperience: 0, marketFit: 0, monetization: 0 }, plan: '', misiones: [] },
  i18n:      { idioma_actual: 'es' },
};

// ─── Context type (unchanged public API) ────────────────────────────────────
interface MasterAgentContextType {
  masterState: MasterAgentState;
  refreshModule: (moduleName: keyof MasterAgentState) => void;
  invokeAgent: (invocation: AgentInvocation) => Promise<AgentResponse>;
  getModuleState: <K extends keyof MasterAgentState>(moduleName: K) => MasterAgentState[K];
  syncAll: () => void;
  updateTaskStep: (taskId: string, stepId: string, completed: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MasterAgentContext = createContext<MasterAgentContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export const MasterAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { invalidateCache } = useDataCache();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';
  const enabled = !!userId;

  const STALE_MS = 30_000;

  // ─── 6 queries paralelas ─────────────────────────────────────────────────
  const perfilQ     = useQuery({ queryKey: QK.perfil(userId),     queryFn: () => fetchPerfil(userId, user?.email ?? ''),  enabled, staleTime: STALE_MS });
  const marcaQ      = useQuery({ queryKey: QK.marca(userId),      queryFn: () => fetchMarca(userId),                      enabled, staleTime: STALE_MS });
  const tiendaQ     = useQuery({ queryKey: QK.tienda(userId),     queryFn: () => fetchTienda(userId),                     enabled, staleTime: STALE_MS });
  const inventarioQ = useQuery({ queryKey: QK.inventario(userId), queryFn: () => fetchInventario(userId),                 enabled, staleTime: STALE_MS });
  const pricingQ    = useQuery({ queryKey: QK.pricing(userId),    queryFn: () => fetchPricing(userId),                    enabled, staleTime: STALE_MS });
  const growthQ     = useQuery({ queryKey: QK.growth(userId),     queryFn: () => fetchGrowth(userId),                     enabled, staleTime: STALE_MS });

  const allQueries = [perfilQ, marcaQ, tiendaQ, inventarioQ, pricingQ, growthQ];

  // ─── Assemble masterState from query data ────────────────────────────────
  const masterState: MasterAgentState = {
    perfil:     perfilQ.data     ?? initialState.perfil,
    marca:      marcaQ.data      ?? initialState.marca,
    tienda:     tiendaQ.data     ?? initialState.tienda,
    inventario: inventarioQ.data ?? initialState.inventario,
    pricing:    pricingQ.data    ?? initialState.pricing,
    presence:   initialState.presence,
    growth:     growthQ.data     ?? initialState.growth,
    i18n:       initialState.i18n,
  };

  const isLoading = allQueries.some((q) => q.isLoading || q.isFetching);
  const error = allQueries.find((q) => q.error)?.error?.message ?? null;

  // ─── refreshModule: invalida la query del módulo correspondiente ──────────
  const refreshModule = useCallback(
    (moduleName: keyof MasterAgentState) => {
      if (!userId) return;
      switch (moduleName) {
        case 'perfil':     queryClient.invalidateQueries({ queryKey: QK.perfil(userId) });     break;
        case 'marca':      queryClient.invalidateQueries({ queryKey: QK.marca(userId) });      break;
        case 'tienda':     queryClient.invalidateQueries({ queryKey: QK.tienda(userId) });     break;
        case 'inventario': queryClient.invalidateQueries({ queryKey: QK.inventario(userId) }); break;
        case 'pricing':    queryClient.invalidateQueries({ queryKey: QK.pricing(userId) });    break;
        case 'growth':     queryClient.invalidateQueries({ queryKey: QK.growth(userId) });     break;
      }
      EventBus.publish('master.context.updated', { module: moduleName, timestamp: Date.now() });
    },
    [userId, queryClient],
  );

  // ─── syncAll: invalida todos los módulos a la vez ────────────────────────
  const syncAll = useCallback(() => {
    if (!userId) return;
    queryClient.invalidateQueries({ queryKey: QK.all(userId) });
  }, [userId, queryClient]);

  // ─── invokeAgent ─────────────────────────────────────────────────────────
  const invokeAgent = useCallback(async (invocation: AgentInvocation): Promise<AgentResponse> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          type: 'invoke_agent',
          agent: invocation.agent,
          action: invocation.action,
          payload: invocation.payload,
        },
      });
      if (fnError) throw fnError;

      const response: AgentResponse = {
        status: data.status || 'success',
        data: data.data,
        deliverables: data.deliverables,
        messages: data.messages || [],
        events: data.events || [],
      };

      response.events.forEach((event) => {
        EventBus.publish(event, { timestamp: Date.now(), data: response.data });
      });

      return response;
    } catch (err) {
      console.error('[MasterAgent] Error invoking agent:', err);
      return { status: 'error', messages: ['Error al comunicarse con el agente.'], events: [] };
    }
  }, []);

  // ─── updateTaskStep ───────────────────────────────────────────────────────
  const updateTaskStepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { taskId: string; stepId: string; completed: boolean }) =>
      updateTaskStepService(stepId, { completionStatus: completed ? 'completed' : 'pending' }),
    onSuccess: (_, { taskId, stepId, completed }) => {
      queryClient.invalidateQueries({ queryKey: QK.growth(userId) });
      EventBus.publish('growth.plan.ready', { taskId, stepId, completed });
    },
  });

  const updateTaskStep = useCallback(
    async (taskId: string, stepId: string, completed: boolean) => {
      await updateTaskStepMutation.mutateAsync({ taskId, stepId, completed });
    },
    [updateTaskStepMutation],
  );

  const getModuleState = useCallback(
    <K extends keyof MasterAgentState>(moduleName: K): MasterAgentState[K] => masterState[moduleName],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [masterState],
  );

  // ─── EventBus: invalida queries en vez de setState ───────────────────────
  const [eventsInProgress] = useState(() => new Set<string>());

  useEffect(() => {
    if (!userId) return;

    const inv = (key: Parameters<typeof queryClient.invalidateQueries>[0]) =>
      queryClient.invalidateQueries(key);

    const unsubs = [
      EventBus.subscribe('profile.updated', () => {
        invalidateCache(['userProfile']);
        inv({ queryKey: QK.perfil(userId) });
      }),
      EventBus.subscribe('business.updated', () => {
        invalidateCache(['userProfile']);
        inv({ queryKey: QK.marca(userId) });
        inv({ queryKey: QK.perfil(userId) });
      }),
      EventBus.subscribe('business.profile.updated', async ({ userId: evtUserId }) => {
        if (eventsInProgress.has('business.profile.updated') || evtUserId !== userId) return;
        eventsInProgress.add('business.profile.updated');
        invalidateCache(['userProfile']);
        try {
          inv({ queryKey: QK.all(userId) });
        } finally {
          eventsInProgress.delete('business.profile.updated');
        }
      }),
      EventBus.subscribe('brand.logo.uploaded', () => {
        invalidateCache(['userProfile']);
        inv({ queryKey: QK.marca(userId) });
        inv({ queryKey: QK.tienda(userId) });
      }),
      EventBus.subscribe('brand.colors.updated', () => {
        invalidateCache(['userProfile']);
        inv({ queryKey: QK.marca(userId) });
        inv({ queryKey: QK.tienda(userId) });
      }),
      EventBus.subscribe('shop.published',    () => inv({ queryKey: QK.tienda(userId) })),
      EventBus.subscribe('inventory.synced',  () => inv({ queryKey: QK.inventario(userId) })),
      EventBus.subscribe('inventory.updated', () => {
        inv({ queryKey: QK.inventario(userId) });
        inv({ queryKey: QK.tienda(userId) });
      }),
      EventBus.subscribe('pricing.updated',      () => inv({ queryKey: QK.pricing(userId) })),
      EventBus.subscribe('task.updated',         () => inv({ queryKey: QK.growth(userId) })),
      EventBus.subscribe('deliverable.created',  () => inv({ queryKey: QK.growth(userId) })),
      EventBus.subscribe('master.full.sync',     () => inv({ queryKey: QK.all(userId) })),
      EventBus.subscribe('maturity.assessment.completed', async (data) => {
        invalidateCache(['userProfile']);
        inv({ queryKey: QK.growth(userId) });
        inv({ queryKey: QK.perfil(userId) });
        const { toast } = await import('sonner');
        toast.success('¡Evaluación completada! Tu dashboard ha sido actualizado.', {
          description: `Nivel: ${(data as { level?: { name?: string } }).level?.name ?? ''}`,
          duration: 5000,
        });
      }),
      EventBus.subscribe('shop.created', async () => {
        inv({ queryKey: QK.tienda(userId) });
        inv({ queryKey: QK.inventario(userId) });
        const { toast } = await import('sonner');
        toast.success('¡Tienda creada!', {
          description: 'Tu dashboard ha sido actualizado con tu nueva tienda.',
          duration: 5000,
        });
      }),
      EventBus.subscribe('debug.data.cleared', () => inv({ queryKey: QK.growth(userId) })),
      EventBus.subscribe('brand.updated', async (data) => {
        if (eventsInProgress.has('brand.updated')) return;
        eventsInProgress.add('brand.updated');
        try {
          const existingShop = await getArtisanShopByUserId(userId).catch(() => null);
          if (existingShop) {
            await updateArtisanShop(existingShop.id, {
              shopName: (data as { brandName?: string }).brandName || existingShop.shopName,
              description: (data as { businessDescription?: string }).businessDescription || existingShop.description,
            }).catch((e) => console.error('Error syncing brand to shop:', e));
            inv({ queryKey: QK.tienda(userId) });
            const { toast } = await import('sonner');
            toast.success('Tu tienda se actualizó automáticamente 🎨');
          }
        } finally {
          eventsInProgress.delete('brand.updated');
        }
      }),
    ];

    const handleClearState = () => {
      queryClient.setQueryData(QK.all(userId), undefined);
    };
    window.addEventListener('clear-master-agent-state', handleClearState);

    return () => {
      unsubs.forEach((u) => u());
      window.removeEventListener('clear-master-agent-state', handleClearState);
    };
  }, [userId, queryClient, invalidateCache, eventsInProgress]);

  // ─── Supabase realtime: productos ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        EventBus.publish('inventory.updated', payload);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <MasterAgentContext.Provider
      value={{ masterState, refreshModule, invokeAgent, getModuleState, syncAll, updateTaskStep, isLoading, error }}
    >
      {children}
    </MasterAgentContext.Provider>
  );
};

export const useMasterAgent = () => {
  const context = useContext(MasterAgentContext);
  if (!context) throw new Error('useMasterAgent must be used within MasterAgentProvider');
  return context;
};
