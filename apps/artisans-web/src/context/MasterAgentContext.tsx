import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CategoryScore } from "@/types/dashboard";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EventBus } from "@/utils/eventBus";
import {
  AgentInvocation,
  AgentResponse,
  MasterAgentState,
} from "@/types/agentContracts";
import { useDataCache } from "./DataCacheContext";
import { getUserMasterContextByUserId } from "@/services/userMasterContext.actions";
import {
  getArtisanShopByUserId,
  updateArtisanShop,
} from "@/services/artisanShops.actions";
import {
  getTaskStepsByUserId,
  updateTaskStep as updateTaskStepService,
} from "@/services/taskSteps.actions";
import { getProductsByUserId } from "@/services/products.actions";

interface MasterAgentContextType {
  masterState: MasterAgentState;
  refreshModule: (moduleName: keyof MasterAgentState) => Promise<void>;
  invokeAgent: (invocation: AgentInvocation) => Promise<AgentResponse>;
  getModuleState: <K extends keyof MasterAgentState>(
    moduleName: K,
  ) => MasterAgentState[K];
  syncAll: () => Promise<void>;
  updateTaskStep: (
    taskId: string,
    stepId: string,
    completed: boolean,
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MasterAgentContext = createContext<MasterAgentContextType | undefined>(
  undefined,
);

const initialState: MasterAgentState = {
  perfil: {
    nombre: "",
    email: "",
    whatsapp: "",
    nit: "",
    nit_pendiente: false,
  },
  marca: {
    logo: null,
    colores: [],
    claim: "",
    score: 0,
    updated_at: null,
  },
  tienda: {
    id: null,
    url: null,
    shop_name: null,
    theme: null,
    published: false,
    products_count: 0,
    has_shop: false,
  },
  inventario: {
    productos: [],
    variantes: [],
    stock_total: 0,
    low_stock: [],
    sin_precio: [],
  },
  pricing: {
    reglas: [],
    hojas_costos: [],
    last_update: null,
  },
  presence: {
    redes: [],
    engagement: 0,
    links_tienda: [],
  },
  growth: {
    nivel_madurez: {
      ideaValidation: 0,
      userExperience: 0,
      marketFit: 0,
      monetization: 0,
    },
    plan: "",
    misiones: [],
  },
  i18n: {
    idioma_actual: "es",
  },
};

export const MasterAgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { getCurrentUserCached, getUserProfileCached, invalidateCache } =
    useDataCache();
  const [masterState, setMasterState] =
    useState<MasterAgentState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [eventsInProgress, setEventsInProgress] = useState<Set<string>>(
    new Set(),
  );
  const [initialSyncComplete, setInitialSyncComplete] = useState(false);

  // ✅ Ref para evitar múltiples syncs iniciales
  const hasInitialSynced = React.useRef(false);
  const lastUserIdRef = React.useRef<string | undefined>(undefined);

  // ✅ FIX: Resetear guard cuando cambia el userId (nuevo login)
  useEffect(() => {
    if (user?.id !== lastUserIdRef.current) {
      hasInitialSynced.current = false;
      lastUserIdRef.current = user?.id;
    }
  }, [user?.id]);

  // FASE 3: Reducir debounce de 5000ms a 2000ms para mejor UX
  const SYNC_DEBOUNCE_MS = 2000;

  const refreshModule = useCallback(
    async (moduleName: keyof MasterAgentState) => {
      setIsLoading(true);
      setError(null);

      try {
        // ✅ Obtener usuario autenticado usando sistema de caché
        const authUser = await getCurrentUserCached();

        if (!authUser || !authUser.id) {
          console.error("[MasterAgent] User not authenticated");
          setError("Usuario no autenticado");
          setIsLoading(false);
          return;
        }

        switch (moduleName) {
          case "perfil": {
            try {
              // ✅ Obtener perfil desde caché (evita llamadas duplicadas)
              const profile = await getUserProfileCached(authUser.id);

              if (profile) {
                setMasterState((prev) => ({
                  ...prev,
                  perfil: {
                    nombre: profile.brandName || profile.fullName || "",
                    email: authUser.email || "",
                    whatsapp: profile.whatsappE164 || "",
                    nit: profile.rut || "",
                    nit_pendiente: profile.rutPendiente || !profile.rut,
                  },
                }));
              }
            } catch (profileError) {
              console.error(
                "[MasterAgent] Error loading profile:",
                profileError,
              );
            }
            break;
          }

          case "marca": {
            try {
              // ✅ Obtener perfil desde caché (evita llamadas duplicadas)
              const profile = await getUserProfileCached(authUser.id);

              // ✅ Obtener contexto maestro desde NestJS backend
              const contextData = await getUserMasterContextByUserId(
                authUser.id,
              );

              const brandEval = (contextData?.businessContext as any)
                ?.brand_evaluation;

              // ✅ BUSCAR LOGO TAMBIÉN EN artisan_shops
              const shopData = await getArtisanShopByUserId(authUser.id).catch(
                () => null,
              );

              const logoUrl =
                profile?.avatarUrl ||
                brandEval?.logo_url ||
                shopData?.logoUrl ||
                null;

              if (profile || brandEval || shopData?.logo_url) {
                const hasLogo = !!logoUrl;
                const hasColors = (brandEval?.colors?.length || 0) > 0;
                const hasClaim = !!(
                  brandEval?.claim || profile?.businessDescription
                );

                // Calcular score basado en completitud
                let score = 0;
                if (hasLogo) score += 40;
                if (hasColors) score += 30;
                if (hasClaim) score += 30;

                setMasterState((prev) => ({
                  ...prev,
                  marca: {
                    logo: logoUrl,
                    colores: brandEval?.colors || [],
                    claim:
                      brandEval?.claim || profile?.businessDescription || "",
                    score: brandEval?.score || score,
                    updated_at:
                      brandEval?.evaluation_date || profile?.updatedAt,
                  },
                }));
              } else {
                // NO DATA - Reset to initial state
                setMasterState((prev) => ({
                  ...prev,
                  marca: {
                    logo: null,
                    colores: [],
                    claim: "",
                    score: 0,
                    updated_at: null,
                  },
                }));
              }
            } catch (error) {
              console.error("[MasterAgent] Error loading brand:", error);
            }
            break;
          }

          case "tienda": {
            const shop = await getArtisanShopByUserId(authUser.id).catch(
              (error) => {
                console.error("[MasterAgent] Error loading shop:", error);
                return null;
              },
            );

            if (shop) {
              // Count products for this shop
              // const { count, error: countError } = await supabase
              //   .from('products')
              //   .select('*', { count: 'exact', head: true })
              //   .eq('shop_id', shop.id);

              const shopProductsCount = await getProductsByUserId(shop.id);

              setMasterState((prev) => ({
                ...prev,
                tienda: {
                  id: shop.id,
                  url: shop.shopSlug,
                  shop_name: shop.shopName || null,
                  theme: null,
                  published: shop.active,
                  products_count: shopProductsCount.length || 0,
                  has_shop: true,
                  hero_config: (shop.heroConfig as { slides?: any[] }) || {
                    slides: [],
                  },
                  story: shop.story || null,
                  about_content: shop.aboutContent as any,
                  contact_info: shop.contactInfo as any,
                  social_links:
                    (shop.socialLinks as Record<string, string>) || {},
                },
              }));
            } else {
              setMasterState((prev) => ({
                ...prev,
                tienda: {
                  id: null,
                  url: null,
                  shop_name: null,
                  theme: null,
                  published: false,
                  products_count: 0,
                  has_shop: false,
                },
              }));
            }
            break;
          }

          case "inventario": {
            // Get user's shop first
            const shop = await getArtisanShopByUserId(authUser.id).catch(
              (error) => {
                console.error(
                  "[MasterAgent] Error loading shop for inventory:",
                  error,
                );
                return null;
              },
            );

            const shopId = shop?.id;

            if (!shopId) {
              setMasterState((prev) => ({
                ...prev,
                inventario: {
                  productos: [],
                  variantes: [],
                  stock_total: 0,
                  low_stock: [],
                  sin_precio: [],
                },
              }));
              break;
            }

            // Get products for the shop
            // const { data: products, error: productsError } = await supabase
            //   .from('products')
            //   .select('*')
            //   .eq('shop_id', shopId);

            const products = await getProductsByUserId(shopId);

            const productsArray = products || [];

            const lowStock = productsArray.filter(
              (p: any) => (p.inventory || 0) < 5,
            );
            const sinPrecio = productsArray.filter(
              (p: any) => !p.price || p.price === 0,
            );
            const stockTotal = productsArray.reduce(
              (sum: number, p: any) => sum + (p.inventory || 0),
              0,
            );

            setMasterState((prev) => ({
              ...prev,
              inventario: {
                productos: productsArray,
                variantes: [],
                stock_total: stockTotal,
                low_stock: lowStock,
                sin_precio: sinPrecio,
              },
            }));
            break;
          }

          case "pricing": {
            // Get materials as cost basis
            const { data: materials, error: materialsError } = await supabase
              .from("materials")
              .select("*")
              .eq("user_id", authUser.id);

            if (materialsError) {
              console.error(
                "[MasterAgent] Error loading materials:",
                materialsError,
              );
            }

            setMasterState((prev) => ({
              ...prev,
              pricing: {
                reglas: [],
                hojas_costos: materials || [],
                last_update: materials?.[0]?.created_at || null,
              },
            }));
            break;
          }

          case "growth": {
            // ✅ Leer maturity scores desde user_master_context (NestJS backend)
            try {
              const contextData = await getUserMasterContextByUserId(
                authUser.id,
              );

              // Extraer scores desde task_generation_context
              const taskGenContext = contextData?.taskGenerationContext as any;
              const maturityScores = taskGenContext?.maturityScores;

              // ✅ Migrado a endpoint NestJS (GET /task-steps/user/{user_id})
              // Obtener task steps con información de tareas incluida
              const taskSteps = await getTaskStepsByUserId(authUser.id);

              // Reorganizar datos: agrupar steps por task_id
              const tasksMap = new Map<string, any>();

              taskSteps.forEach((step) => {
                if (!tasksMap.has(step.taskId)) {
                  // Crear entrada de tarea si no existe
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

                // Agregar step a la tarea
                tasksMap.get(step.taskId)!.steps.push({
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

              // Convertir Map a array y ordenar por fecha de creación
              const tasksWithSteps = Array.from(tasksMap.values()).sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              );

              // Usar scores reales del maturity test sin modificaciones
              const scores: CategoryScore = maturityScores || {
                ideaValidation: 0,
                userExperience: 0,
                marketFit: 0,
                monetization: 0,
              };

              setMasterState((prev) => ({
                ...prev,
                growth: {
                  nivel_madurez: scores,
                  plan: "",
                  misiones: tasksWithSteps,
                },
              }));
            } catch (error) {
              console.error(
                "[MasterAgent] Error loading user_master_context:",
                error,
              );
            }
            break;
          }
        }

        // Publish sync event
        EventBus.publish("master.context.updated", {
          module: moduleName,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error(`[MasterAgent] Error refreshing ${moduleName}:`, err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    },
    [getCurrentUserCached, getUserProfileCached],
  );

  const syncAll = useCallback(async () => {
    // Debounce: evitar syncs repetidos
    const now = Date.now();
    if (now - lastSyncTime < SYNC_DEBOUNCE_MS) {
      return;
    }

    setLastSyncTime(now);
    setIsLoading(true);

    try {
      // Paralelizar TODOS los módulos - más rápido
      await Promise.all([
        refreshModule("perfil"),
        refreshModule("tienda"),
        refreshModule("marca"),
        refreshModule("inventario"),
        refreshModule("growth"),
      ]);

      // FASE 3: Marcar primera sincronización como completada
      setInitialSyncComplete(true);
    } catch (err) {
      console.error("[MasterAgent] Error during syncAll:", err);
      setError(err instanceof Error ? err.message : "Error de sincronización");
    } finally {
      setIsLoading(false);
    }
  }, [refreshModule, lastSyncTime, SYNC_DEBOUNCE_MS]);

  const invokeAgent = useCallback(
    async (invocation: AgentInvocation): Promise<AgentResponse> => {
      try {
        console.log("invocando", invocation);
        const { data, error } = await supabase.functions.invoke(
          "master-agent-coordinator",
          {
            body: {
              type: "invoke_agent",
              agent: invocation.agent,
              action: invocation.action,
              payload: invocation.payload,
            },
          },
        );

        if (error) throw error;

        const response: AgentResponse = {
          status: data.status || "success",
          data: data.data,
          deliverables: data.deliverables,
          messages: data.messages || [],
          events: data.events || [],
        };

        // Publish events
        response.events.forEach((event) => {
          EventBus.publish(event, {
            timestamp: Date.now(),
            data: response.data,
          });
        });

        return response;
      } catch (err) {
        console.error(`[MasterAgent] Error invoking agent:`, err);
        return {
          status: "error",
          messages: ["Error al comunicarse con el agente. Intenta más tarde."],
          events: [],
        };
      }
    },
    [],
  );

  const getModuleState = useCallback(
    <K extends keyof MasterAgentState>(moduleName: K): MasterAgentState[K] => {
      return masterState[moduleName];
    },
    [masterState],
  );

  const updateTaskStep = useCallback(
    async (taskId: string, stepId: string, completed: boolean) => {
      try {
        // ✅ Migrado a endpoint NestJS - PATCH /task-steps/{id}
        await updateTaskStepService(stepId, {
          completionStatus: completed ? "completed" : "pending",
        });

        // Refresh growth module to get updated data
        await refreshModule("growth");

        // Publish event for growth update
        EventBus.publish("growth.plan.ready", { taskId, stepId, completed });
      } catch (err) {
        console.error("[MasterAgent] Error updating task step:", err);
        throw err;
      }
    },
    [refreshModule],
  );

  // Initial sync on mount - SOLO UNA VEZ
  // ✅ NO sincronizar en páginas públicas (login, register, etc)
  useEffect(() => {
    // Si ya se sincronizó o no hay usuario, no hacer nada
    if (!user || hasInitialSynced.current) return;

    // Verificar si estamos en una página pública que no requiere datos del dashboard
    const publicPaths = [
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
    ];
    const currentPath = window.location.pathname;
    const isPublicPage = publicPaths.some((path) =>
      currentPath.startsWith(path),
    );

    if (isPublicPage) {
      return;
    }

    // Marcar como sincronizado ANTES de iniciar para evitar múltiples llamadas
    hasInitialSynced.current = true;

    let mounted = true;

    const initialSync = async () => {
      if (mounted) {
        await syncAll();
      }
    };

    initialSync();

    return () => {
      mounted = false;
    };
    // ✅ FIX: NO incluir syncAll en dependencias para evitar loop infinito
    // El guard hasInitialSynced.current previene múltiples ejecuciones
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto-sync on relevant events
  useEffect(() => {
    const unsubscribers = [
      EventBus.subscribe("profile.updated", () => {
        invalidateCache(["userProfile"]);
        refreshModule("perfil");
      }),
      EventBus.subscribe("business.updated", () => {
        invalidateCache(["userProfile"]);
        refreshModule("marca");
        refreshModule("perfil");
      }),

      // ✅ NUEVO: Sincronización automática cuando se actualiza el perfil de negocio
      EventBus.subscribe("business.profile.updated", async ({ userId }) => {
        if (eventsInProgress.has("business.profile.updated")) return;
        if (userId === user?.id) {
          invalidateCache(["userProfile"]);
          setEventsInProgress((prev) =>
            new Set(prev).add("business.profile.updated"),
          );
          try {
            await syncAll(); // Sincronizar TODOS los módulos
          } finally {
            setEventsInProgress((prev) => {
              const next = new Set(prev);
              next.delete("business.profile.updated");
              return next;
            });
          }
        }
      }),

      // ✅ NUEVO: Sincronizar cuando se suba logo
      EventBus.subscribe("brand.logo.uploaded", async () => {
        invalidateCache(["userProfile"]);
        await refreshModule("marca");
        await refreshModule("tienda"); // También actualizar tienda
      }),

      // ✅ NUEVO: Sincronizar cuando se definan colores
      EventBus.subscribe("brand.colors.updated", async () => {
        invalidateCache(["userProfile"]);
        await refreshModule("marca");
        await refreshModule("tienda");
      }),

      EventBus.subscribe("shop.published", () => refreshModule("tienda")),
      EventBus.subscribe("inventory.synced", () => refreshModule("inventario")),
      EventBus.subscribe("inventory.updated", () => {
        refreshModule("inventario");
        refreshModule("tienda");
      }),
      EventBus.subscribe("pricing.updated", () => refreshModule("pricing")),
      EventBus.subscribe("task.updated", () => refreshModule("growth")),
      EventBus.subscribe("deliverable.created", () => refreshModule("growth")),
      EventBus.subscribe("master.full.sync", () => syncAll()),

      // 🔥 NUEVO: Escuchar evento de maturity assessment completado
      EventBus.subscribe("maturity.assessment.completed", async (data) => {
        invalidateCache(["userProfile"]);
        await refreshModule("growth"); // Recargar scores
        await refreshModule("perfil"); // Actualizar perfil con datos del test

        const { toast } = await import("sonner");
        toast.success(
          "¡Evaluación completada! Tu dashboard ha sido actualizado.",
          {
            description: `Nivel: ${data.level.name}`,
            duration: 5000,
          },
        );
      }),

      // 🔥 NUEVO: Escuchar evento de tienda creada
      EventBus.subscribe("shop.created", async (data) => {
        await refreshModule("tienda");
        await refreshModule("inventario"); // También refrescar inventario

        const { toast } = await import("sonner");
        toast.success("¡Tienda creada!", {
          description: "Tu dashboard ha sido actualizado con tu nueva tienda.",
          duration: 5000,
        });
      }),

      // 🧹 NUEVO: Refrescar cuando se limpien datos del Debug Artisan
      EventBus.subscribe("debug.data.cleared", async () => {
        await refreshModule("growth");
      }),

      // Bidirectional sync: brand.updated -> update shop
      EventBus.subscribe("brand.updated", async (data: any) => {
        if (eventsInProgress.has("brand.updated")) return;

        setEventsInProgress((prev) => new Set(prev).add("brand.updated"));
        try {
          if (!user?.id) return;

          // Check if shop exists
          const existingShop = await getArtisanShopByUserId(user.id).catch(
            () => null,
          );

          if (existingShop) {
            // Update shop with brand data
            try {
              await updateArtisanShop(existingShop.id, {
                shopName: data.brandName || existingShop.shopName,
                description:
                  data.businessDescription || existingShop.description,
              });

              // Refresh tienda module
              await refreshModule("tienda");

              // Show success toast
              const { toast } = await import("sonner");
              toast.success("Tu tienda se actualizó automáticamente 🎨");
            } catch (error) {
              console.error("Error syncing brand to shop:", error);
            }
          }
        } catch (error) {
          console.error("Error in brand sync:", error);
        } finally {
          setEventsInProgress((prev) => {
            const next = new Set(prev);
            next.delete("brand.updated");
            return next;
          });
        }
      }),
    ];

    // Listen for custom event to clear state
    const handleClearState = async () => {
      setMasterState(initialState);
      // Don't sync here - wait for master.full.sync event
    };

    window.addEventListener("clear-master-agent-state", handleClearState);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      window.removeEventListener("clear-master-agent-state", handleClearState);
    };
  }, [refreshModule, syncAll, user, invalidateCache]);

  // Setup realtime subscription for products
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          EventBus.publish("inventory.updated", payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <MasterAgentContext.Provider
      value={{
        masterState,
        refreshModule,
        invokeAgent,
        getModuleState,
        syncAll,
        updateTaskStep,
        isLoading,
        error,
      }}
    >
      {children}
    </MasterAgentContext.Provider>
  );
};

export const useMasterAgent = () => {
  const context = useContext(MasterAgentContext);
  if (!context) {
    throw new Error("useMasterAgent must be used within MasterAgentProvider");
  }
  return context;
};

// Helper function to calculate brand score
function calculateBrandScore(profile: any): number {
  let score = 0;
  if (profile.avatar_url) score += 30;
  if (profile.business_description) score += 40;
  if (profile.brand_name) score += 30;
  return score;
}
