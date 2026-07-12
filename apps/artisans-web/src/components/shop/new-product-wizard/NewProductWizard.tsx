import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  getArtisanShopByUserId,
  getStoreByUserId,
} from "@/services/artisanShops.actions";
import { getArtisanIdentityByUserId } from "@/services/artisan-identity.actions";
import {
  getProductNewById,
  createProductNew,
} from "@/services/products-new.actions";
import {
  useNewWizardState,
  type NewWizardState,
  type WizardVariant,
} from "./hooks/useNewWizardState";
import { useWizardDraft, mapNewStateToDto } from "./hooks/useWizardDraft";
import { deriveProductionType } from "./utils/availability";
import { Step1NewPiece } from "./steps/Step1NewPiece";
import { Step2ArtisanalIdentity } from "./steps/Step2ArtisanalIdentity";
import { Step3ProcessTime } from "./steps/Step3ProcessTime";
import { Step4PriceLogistics } from "./steps/Step4PriceLogistics";
import { Step5DigitalPassport } from "./steps/Step5DigitalPassport";
import { Step6FinalReview } from "./steps/Step6FinalReview";
import { WizardHeader } from "./components/WizardHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useOraculo } from "@/components/oraculo/OraculoContext";
import { AICopilotCard } from "@/components/dashboard/AICopilotCard";
import {
  upsertSuggestProductsDraft,
  getSuggestProductsDraft,
} from "@/services/suggest-products-draft.actions";

const SANS = "'Manrope', sans-serif";

const WizardOraculoDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { node } = useOraculo();
  const content = node ?? <AICopilotCard />;
  return (
    <div
      className="md:hidden fixed left-0 right-0 z-40"
      style={{ bottom: "calc(119px + env(safe-area-inset-bottom))" }}
    >
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "55vh" : 0,
          transition: "max-height 0.28s ease",
        }}
      >
        <div
          style={{
            overflowY: "auto",
            maxHeight: "55vh",
            background: "#151b2d",
            borderRadius: "16px 16px 0 0",
          }}
        >
          {content}
        </div>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5"
        style={{
          background: "#151b2d",
          height: 46,
          borderTopLeftRadius: open ? 0 : 14,
          borderTopRightRadius: open ? 0 : 14,
          borderTop: open ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#ec6d13", fontSize: 16 }}
          >
            psychology
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.02em",
            }}
          >
            ORÁCULO
          </span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 18,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.25s ease",
          }}
        >
          expand_less
        </span>
      </button>
    </div>
  );
};

const TOTAL_STEPS = 6;

const STEP_CONFIGS = [
  {
    icon: "add_photo_alternate",
    title: "Nueva pieza",
    subtitle: "Captura inicial para que TELAR entienda qué estás creando",
  },
  {
    icon: "fingerprint",
    title: "Identidad artesanal",
    subtitle: "Técnica, estilo, materiales y categoría de tu pieza",
  },
  {
    icon: "history_edu",
    title: "Proceso y tiempo",
    subtitle: "Evidencia y descripción para la trazabilidad TELAR",
  },
  {
    icon: "payments",
    title: "Precio y logística",
    subtitle: "Define cómo se comercializa y despacha esta pieza",
  },
  {
    icon: "verified",
    title: "Pasaporte digital",
    subtitle: "Vista previa del pasaporte de trazabilidad",
  },
  {
    icon: "fact_check",
    title: "Revisión final",
    subtitle: "Verifica la información antes de enviar a curaduría",
  },
];

export const NewProductWizard: React.FC = () => {
  const isMobile = useIsMobile();
  const urlParamsInit = new URLSearchParams(window.location.search);
  const [currentStep, setCurrentStep] = useState(
    urlParamsInit.get("edit") === "true" ? TOTAL_STEPS : 1,
  );
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [isCheckingShop, setIsCheckingShop] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [shopId, setShopId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successProductName, setSuccessProductName] = useState("");
  const navigate = useNavigate();

  const { user } = useAuth();

  const isEditMode = urlParamsInit.get("edit") === "true";
  const productIdToEdit = urlParamsInit.get("productId") ?? undefined;
  const shouldContinue = urlParamsInit.get("continue") === "true";

  const { state, update, reset } = useNewWizardState(shouldContinue);
  const { saveDraft, isSavingDraft } = useWizardDraft(state, update, shopId);

  useEffect(() => {
    if (!user) return;

    getArtisanShopByUserId(user.id)
      .then((shop) => {
        setHasShop(!!shop?.id);
        if (shop?.id) {
          setShopId(shop.id);
          const dept = shop.department || shop.region || null;
          if (dept && !state.department) update({ department: dept });
          if (shop.municipality && !state.municipality)
            update({ municipality: shop.municipality });
          // Origen y taller vienen del perfil de la tienda, no se capturan por pieza
          if (shop.shopName && !state.workshopName)
            update({ workshopName: shop.shopName });
          const shopOrigin = [shop.municipality, dept]
            .filter(Boolean)
            .join(", ");
          if (shopOrigin && !state.shippingOrigin)
            update({ shippingOrigin: shopOrigin });

          // Pre-fill process and tools from artisan profile only for NEW products (not edit mode)
          if (!isEditMode) {
            const profile = (shop as any).artisanProfile as
              | Record<string, any>
              | undefined;
            if (profile?.creationProcess && !state.processDescription) {
              update({ processDescription: profile.creationProcess });
            }
            if (profile?.workshopTools?.length && !state.tools?.length) {
              update({ tools: profile.workshopTools });
            }
          }
        }
      })
      .catch(() => setHasShop(false))
      .finally(() => setIsCheckingShop(false));

    // Pre-cargar oficio y técnica solo para productos nuevos (no en edit mode)
    if (!isEditMode) {
      getStoreByUserId(user.id)
        .then((store) => {
          const craftId = (store as any)?.artisanalProfile?.primaryCraftId;
          if (craftId && !state.craftId) update({ craftId });
        })
        .catch(() => {});

      getArtisanIdentityByUserId(user.id)
        .then((identity) => {
          if (!identity) return;
          const updates: Record<string, string> = {};
          if (identity.techniquePrimaryId && !state.primaryTechniqueId)
            updates.primaryTechniqueId = identity.techniquePrimaryId;
          if (identity.techniqueSecondaryId && !state.secondaryTechniqueId)
            updates.secondaryTechniqueId = identity.techniqueSecondaryId;
          if (Object.keys(updates).length) update(updates as any);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!isEditMode || !productIdToEdit) return;
    setIsLoadingEdit(true);
    getProductNewById(productIdToEdit)
      .then((product) => {
        if (!product) {
          toast.error("No se encontró el producto para editar");
          return;
        }
        // Variantes: precio del vendedor = precio guardado ÷ 1.05 (recargo comprador)
        const toSellerPrice = (basePriceMinor: string) =>
          Math.round(parseInt(basePriceMinor) / 100 / 1.05);
        const allVariants = product.variants ?? [];
        const hasRealVariants = allVariants.some(
          (v) => Object.keys(v.optionValues ?? {}).length > 0,
        );
        const primaryVariant =
          allVariants.find((v) => v.isActive) || allVariants[0];

        let variantUpdates: Partial<NewWizardState> = {};
        if (hasRealVariants) {
          const wizardVariants: WizardVariant[] = allVariants.map((v) => ({
            id: v.id,
            optionValues: v.optionValues ?? {},
            price: v.basePriceMinor ? toSellerPrice(v.basePriceMinor) : undefined,
            stock: v.stockQuantity,
            minStock: v.minStock ?? 0,
            imageUrl: v.imageUrl || undefined,
            isActive: v.isActive,
            sku: v.sku || undefined,
          }));
          // Derivar ejes y valores desde los optionValues existentes
          const axisValues: Record<string, string[]> = {};
          for (const v of wizardVariants) {
            for (const [axis, value] of Object.entries(v.optionValues)) {
              if (!value) continue;
              if (!axisValues[axis]) axisValues[axis] = [];
              if (!axisValues[axis].includes(value)) axisValues[axis].push(value);
            }
          }
          const activePrices = wizardVariants
            .filter((v) => v.isActive && v.price)
            .map((v) => v.price!);
          variantUpdates = {
            hasVariants: true,
            variants: wizardVariants,
            variantAxes: Object.keys(axisValues),
            variantAxisValues: axisValues,
            price: activePrices.length ? Math.min(...activePrices) : undefined,
            inventory: wizardVariants
              .filter((v) => v.isActive)
              .reduce((sum, v) => sum + (v.stock ?? 0), 0),
          };
        } else {
          variantUpdates = {
            hasVariants: false,
            primaryVariantId: primaryVariant?.id,
            price: primaryVariant?.basePriceMinor
              ? toSellerPrice(primaryVariant.basePriceMinor)
              : undefined,
            sku: primaryVariant?.sku || undefined,
            inventory: primaryVariant?.stockQuantity || undefined,
            minimumStockAlert: primaryVariant?.minStock || undefined,
          };
        }

        const images =
          product.media
            ?.filter((m) => m.mediaType === "image")
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((m) => m.mediaUrl) || [];

        update({
          productId: product.id,
          status: product.status as any,
          name: product.name,
          shortDescription: product.shortDescription,
          artisanalHistory: product.history || undefined,
          careNotes: product.careNotes || undefined,
          images,
          categoryId: product.categoryId || undefined,
          subcategoryId: product.subcategoryId || undefined,
          materials: product.materials?.map((m) => m.materialId) || [],
          // artisanal identity
          craftId: product.artisanalIdentity?.primaryCraftId || undefined,
          primaryTechniqueId:
            product.artisanalIdentity?.primaryTechniqueId || undefined,
          secondaryTechniqueId:
            product.artisanalIdentity?.secondaryTechniqueId || undefined,
          elaborationTime:
            product.artisanalIdentity?.estimatedElaborationTime || undefined,
          isCollaboration: product.artisanalIdentity?.isCollaboration ?? false,
          collaboration: product.artisanalIdentity?.collaborationName
            ? { name: product.artisanalIdentity.collaborationName }
            : undefined,
          purpose: product.artisanalIdentity?.pieceType as any,
          styles: (product.artisanalIdentity?.styles?.length
            ? product.artisanalIdentity.styles
            : product.artisanalIdentity?.style
              ? [product.artisanalIdentity.style]
              : undefined) as any,
          // physical specs
          heightCm: product.physicalSpecs?.heightCm || undefined,
          widthCm: product.physicalSpecs?.widthCm || undefined,
          lengthCm: product.physicalSpecs?.lengthOrDiameterCm || undefined,
          weightKg: product.physicalSpecs?.realWeightKg || undefined,
          // logistics
          packagedWeightKg: product.logistics?.packWeightKg || undefined,
          packagedWidthCm: product.logistics?.packWidthCm || undefined,
          packagedHeightCm: product.logistics?.packHeightCm || undefined,
          packagedLengthCm: product.logistics?.packLengthCm || undefined,
          shippingRestrictions:
            product.logistics?.specialProtectionNotes || undefined,
          specialHandling: product.logistics?.fragility === "alto",
          // production
          availabilityType: product.production?.availabilityType as any,
          productionType: deriveProductionType(product.production?.availabilityType),
          monthlyCapacity: product.production?.monthlyCapacity || undefined,
          processDescription:
            product.production?.processDescription || undefined,
          processEvidenceUrls:
            product.production?.processEvidenceUrls || undefined,
          tools: product.production?.tools || [],
          // pricing + variantes
          ...variantUpdates,
        });

        // Also restore agent suggestions from backend
        getSuggestProductsDraft(product.id)
          .then((suggestions) => {
            const updates: Partial<typeof state> = {};
            if (suggestions?.suggestAgentStep12) {
              const { agentResponse: restored, fieldMetadata: restoredMeta } =
                suggestions.suggestAgentStep12;
              if (restored) updates.agentStep1Response = restored;
              if (restoredMeta)
                updates.fieldMetadata = {
                  ...updates.fieldMetadata,
                  ...restoredMeta,
                };
            }
            if (suggestions?.suggestAgentStep34) {
              const {
                agentResponse: restored34,
                fieldMetadata: restoredMeta34,
              } = suggestions.suggestAgentStep34;
              if (restored34) updates.agentStep2Response = restored34;
              if (restoredMeta34)
                updates.fieldMetadata = {
                  ...updates.fieldMetadata,
                  ...restoredMeta34,
                };
            }
            if (Object.keys(updates).length > 0) {
              update(updates);
              console.log(
                "[EditMode] Restored agent suggestions for product:",
                product.id,
              );
            }
          })
          .catch(() => {
            /* suggestions not found, ok */
          });
      })
      .catch((err) => {
        console.error("[EditMode] Error cargando producto:", err);
        toast.error("No se pudo cargar el producto para editar");
      })
      .finally(() => setIsLoadingEdit(false));
  }, [isEditMode, productIdToEdit]);

  // Restore agent suggestions for continue mode (product already exists in localStorage state)
  useEffect(() => {
    if (
      isEditMode ||
      !shouldContinue ||
      !state.productId ||
      state.agentStep1Response
    )
      return;
    getSuggestProductsDraft(state.productId)
      .then((suggestions) => {
        const updates: Partial<typeof state> = {};
        if (suggestions?.suggestAgentStep12) {
          const { agentResponse: restored, fieldMetadata: restoredMeta } =
            suggestions.suggestAgentStep12;
          if (restored) updates.agentStep1Response = restored;
          if (restoredMeta)
            updates.fieldMetadata = {
              ...updates.fieldMetadata,
              ...restoredMeta,
            };
        }
        if (suggestions?.suggestAgentStep34) {
          const { agentResponse: restored34, fieldMetadata: restoredMeta34 } =
            suggestions.suggestAgentStep34;
          if (restored34) updates.agentStep2Response = restored34;
          if (restoredMeta34)
            updates.fieldMetadata = {
              ...updates.fieldMetadata,
              ...restoredMeta34,
            };
        }
        if (Object.keys(updates).length > 0) {
          update(updates);
          console.log(
            "[ContinueMode] Restored agent suggestions for product:",
            state.productId,
          );
        }
      })
      .catch(() => {
        /* suggestions not found, ok */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldContinue, state.productId]);

  const goNext = async () => {
    let productWasJustCreated = false;

    // When moving from Step 1 to Step 2, create the product in draft if it doesn't exist
    if (currentStep === 1 && !state.productId && shopId) {
      try {
        // Filter images to only get URLs (images already uploaded to S3)
        const imageUrls = state.images.filter(
          (img): img is string => typeof img === "string",
        );

        // Create product DTO with status "draft"
        const dto = mapNewStateToDto(state, shopId, imageUrls, false);

        console.log("[NewProductWizard] Creating product in draft from Step 1");
        const result = await createProductNew(dto, { suppressToast: true });
        const newProductId = (result as any)?.id ?? (result as any)?.productId;

        if (newProductId) {
          update({ productId: newProductId });
          console.log(
            "[NewProductWizard] Product created with ID:",
            newProductId,
          );
          toast.success("Producto creado en borrador");
          productWasJustCreated = true;

          // Persist agent suggestions to backend
          if (state.agentStep1Response) {
            upsertSuggestProductsDraft(newProductId, {
              suggestAgentStep12: {
                agentResponse: state.agentStep1Response,
                fieldMetadata: state.fieldMetadata,
              },
            }).catch((err) =>
              console.error("[Wizard] Error saving suggestions:", err),
            );
          }
        }
      } catch (error) {
        console.error("[NewProductWizard] Error creating product:", error);
        toast.error("No se pudo crear el producto. Intenta de nuevo.");
        return; // Don't advance to next step if product creation failed
      }
    }

    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));

    // Persist Step 3/4 agent suggestions when leaving Step 3 or Step 4
    if (
      (currentStep === 3 || currentStep === 4) &&
      state.productId &&
      state.agentStep2Response
    ) {
      upsertSuggestProductsDraft(state.productId, {
        suggestAgentStep34: {
          agentResponse: state.agentStep2Response,
          fieldMetadata: state.fieldMetadata,
        },
      }).catch((err) =>
        console.error("[Wizard] Error saving step3/4 suggestions:", err),
      );
    }

    // Only auto-save if we didn't just create the product
    // (to avoid race condition creating duplicate products)
    if (!productWasJustCreated) {
      void saveDraft(true);
    }
  };

  const goBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep((s) => s - 1);
    }
  };
  const goToStep = (n: number) => setCurrentStep(n);

  const handlePublished = () => {
    setSuccessProductName(state.name);
    setShowSuccess(true);
    reset();
  };

  const handleUploadAnother = () => {
    setShowSuccess(false);
    setCurrentStep(1);
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="max-w-lg w-full rounded-2xl p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.65)",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(22,101,52,0.1)" }}
          >
            <span
              className="material-symbols-outlined text-[40px]"
              style={{ color: "#166534" }}
            >
              check_circle
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-['Noto_Serif'] text-3xl font-bold text-[#151b2d] mb-3">
            ¡Pieza enviada!
          </h1>

          {/* Product name */}
          {successProductName && (
            <p
              className="inline-block px-4 py-1.5 rounded-full font-['Manrope'] text-[13px] font-[700] mb-5"
              style={{ background: "rgba(236,109,19,0.1)", color: "#ec6d13" }}
            >
              {successProductName}
            </p>
          )}

          {/* Explanation */}
          <p className="font-['Manrope'] text-[15px] font-[500] text-[#54433e]/80 leading-relaxed mb-8">
            Tu pieza está en revisión por el equipo de TELAR. Te avisaremos
            cuando sea aprobada para el marketplace. Mientras tanto la puedes
            ver en tu dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/mi-tienda")}
              className="flex-1 py-3.5 rounded-full font-['Manrope'] text-[14px] font-[700] text-white transition-opacity hover:opacity-90"
              style={{ background: "#ec6d13" }}
            >
              Ir al dashboard
            </button>
            <button
              onClick={handleUploadAnother}
              className="flex-1 py-3.5 rounded-full font-['Manrope'] text-[14px] font-[700] transition-colors"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(84,67,62,0.2)",
                color: "#54433e",
              }}
            >
              Registrar otra pieza
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingShop || isLoadingEdit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin mx-auto" />
          <p className="font-['Manrope'] text-[#54433e]/60 text-sm font-[500]">
            {isLoadingEdit ? "Cargando producto…" : "Verificando tu tienda…"}
          </p>
        </div>
      </div>
    );
  }

  if (hasShop === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="max-w-md w-full p-10 text-center rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.65)",
          }}
        >
          <span className="material-symbols-outlined block text-[56px] text-[#ec6d13] mb-6">
            store
          </span>
          <h2 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d] mb-3">
            Primero crea tu tienda
          </h2>
          <p className="font-['Manrope'] text-[#54433e]/70 text-sm leading-relaxed mb-8">
            Para registrar una pieza, necesitas tener una tienda activa en
            TELAR.
          </p>
          <button
            onClick={() => (window.location.href = "/crear-tienda")}
            className="bg-[#ec6d13] text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Crear mi tienda
          </button>
        </div>
      </div>
    );
  }

  const stepProps = {
    state,
    update,
    onNext: goNext,
    onBack: goBack,
    onSaveDraft: saveDraft,
    isSavingDraft,
    step: currentStep,
    totalSteps: TOTAL_STEPS,
    isEditMode,
    artisanId: user?.id ?? "",
    userId: user?.id ?? "",
    leftOffset: isMobile ? 0 : 80,
  };

  const stepConfig = STEP_CONFIGS[currentStep - 1];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header en flujo — siempre visible en mobile y desktop; el scroll ocurre debajo */}
      <div
        className="shrink-0 z-30 border-b border-[#e2d5cf]/40"
        style={{
          background: "rgba(249,247,242,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <WizardHeader
          step={currentStep}
          totalSteps={TOTAL_STEPS}
          icon={stepConfig.icon}
          title={stepConfig.title}
          subtitle={stepConfig.subtitle}
          onBack={goBack}
          onSaveProgress={saveDraft}
          isSavingProgress={isSavingDraft}
        />
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 1 && <Step1NewPiece {...stepProps} shopId={shopId} />}
        {currentStep === 2 && <Step2ArtisanalIdentity {...stepProps} />}
        {currentStep === 3 && <Step3ProcessTime {...stepProps} />}
        {currentStep === 4 && <Step4PriceLogistics {...stepProps} />}
        {currentStep === 5 && (
          <Step5DigitalPassport {...stepProps} onGoToStep={goToStep} />
        )}
        {currentStep === 6 && (
          <Step6FinalReview
            {...stepProps}
            shopId={shopId}
            onGoToStep={goToStep}
            onPublished={handlePublished}
          />
        )}
        {/* Spacer mobile: footer (~60px) + oráculo (119px) + safe area */}
        <div
          className="shrink-0 md:hidden"
          style={{ height: "calc(180px + env(safe-area-inset-bottom))" }}
        />
      </div>

      <WizardOraculoDrawer />
    </div>
  );
};
