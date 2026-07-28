import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  NewWizardState,
  PiecePurpose,
  PieceStyle,
  ProductionType,
} from "../hooks/useNewWizardState";
import type {
  FieldSource,
  IdentityFieldMetadata,
  MaterialFieldMetadata,
  Step1ConfirmRequest,
} from "@/types/agent.types";
import { step1Confirm } from "@/services/agent.actions";
import { WizardFooter } from "../components/WizardFooter";
import { AiBadge } from "../components/AiBadge";
import { useStepValidation } from "../hooks/useStepValidation";
import {
  RequiredMark,
  FieldErrorMessage,
  MissingFieldsBanner,
} from "../components/FieldValidation";
import { MaterialPicker } from "../components/TaxonomyPicker";
import { CraftPicker, TechniquePicker } from "../components/CraftPicker";
import {
  deriveAvailabilityType,
  AVAILABILITY_LABELS,
} from "../utils/availability";
import { getAllCategories, type Category } from "@/services/categories.actions";

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
  artisanId?: string;
  userId?: string;
  leftOffset?: number;
}

const TELAR_CATEGORY_DEFS: { name: string; icon: string }[] = [
  { name: "Textiles y Moda", icon: "apparel" },
  { name: "Bolsos y Carteras", icon: "shopping_bag" },
  { name: "Joyería y Accesorios", icon: "diamond" },
  { name: "Decoración del Hogar", icon: "home" },
  { name: "Muebles", icon: "chair" },
  { name: "Vajillas y Cocina", icon: "restaurant" },
  { name: "Arte y Esculturas", icon: "palette" },
  { name: "Juguetes e Instrumentos Musicales", icon: "piano" },
  { name: "Cuidado Personal", icon: "spa" },
];

const PURPOSES: {
  id: PiecePurpose;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "funcional",
    label: "Funcional",
    icon: "handyman",
    desc: "Tiene un uso práctico en el día a día",
  },
  {
    id: "decorativa",
    label: "Decorativa",
    icon: "star",
    desc: "Su propósito es embellecer espacios",
  },
  {
    id: "ritual",
    label: "Ritual",
    icon: "auto_awesome",
    desc: "Uso ceremonial, espiritual o simbólico",
  },
  {
    id: "coleccionable",
    label: "Coleccionable",
    icon: "category",
    desc: "Valor cultural o artístico para coleccionar",
  },
];

const STYLES: { id: PieceStyle; label: string; desc: string }[] = [
  {
    id: "tradicional",
    label: "Tradicional",
    desc: "Sigue métodos y estéticas ancestrales fieles a su origen",
  },
  {
    id: "contemporaneo",
    label: "Contemporáneo",
    desc: "Incorpora lenguajes actuales sin abandonar la técnica artesanal",
  },
  {
    id: "fusion",
    label: "Fusión",
    desc: "Mezcla tradición con influencias modernas o de otras culturas",
  },
];

const PRODUCTION_TYPES: {
  id: ProductionType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "unica",
    label: "Única",
    icon: "fiber_manual_record",
    desc: "Pieza exclusiva, solo existe una",
  },
  {
    id: "limitada",
    label: "Serie limitada",
    icon: "layers",
    desc: "Un número definido de unidades idénticas",
  },
  {
    id: "continua",
    label: "Continua",
    icon: "autorenew",
    desc: "Se produce de forma regular y permanente",
  },
  {
    id: "bajo_pedido",
    label: "Bajo pedido",
    icon: "assignment",
    desc: "Se fabrica cuando hay un encargo específico",
  },
];

const cardStyle = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.65)",
} as const;

export const Step2ArtisanalIdentity: React.FC<Props> = ({
  state,
  update,
  onNext,
  onBack,
  onSaveDraft,
  isSavingDraft,
  step,
  totalSteps,
  artisanId = "",
  userId = "",
  leftOffset,
}) => {
  const [showCollaboration, setShowCollaboration] = useState(
    state.isCollaboration ?? false,
  );
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [craftName, setCraftName] = useState<string | undefined>();
  const [techniqueName, setTechniqueName] = useState<string | undefined>();

  const identitySuggestions = state.agentStep1Response?.identity_suggestions;
  const hasSuggestions = !!(
    identitySuggestions?.category ||
    identitySuggestions?.oficio ||
    identitySuggestions?.materials?.length
  );

  const handleAcceptCategory = useCallback(() => {
    if (!identitySuggestions?.category) return;
    const { value: rawValue, label } = identitySuggestions.category;
    const resolvedId = allCategories.find((c) => c.id === rawValue)
      ? rawValue
      : (allCategories.find(
          (c) =>
            c.name.toLowerCase() === rawValue.toLowerCase() ||
            c.name.toLowerCase() === label.toLowerCase(),
        )?.id ?? rawValue);
    console.log("[Step2] Accept category suggestion:", {
      rawValue,
      label,
      resolvedId,
    });
    const meta: IdentityFieldMetadata = {
      value: resolvedId,
      label,
      source: "ia_accepted",
    };
    update({
      categoryId: resolvedId,
      subcategoryId: undefined,
      fieldMetadata: { ...state.fieldMetadata, category: meta },
    });
  }, [
    identitySuggestions?.category,
    allCategories,
    state.fieldMetadata,
    update,
  ]);

  const handleAcceptOficio = useCallback(() => {
    if (!identitySuggestions?.oficio) return;
    const { value, label } = identitySuggestions.oficio;
    const meta: IdentityFieldMetadata = { value, label, source: "ia_accepted" };
    update({
      craftId: value,
      primaryTechniqueId: undefined,
      secondaryTechniqueId: undefined,
      fieldMetadata: { ...state.fieldMetadata, oficio: meta },
    });
    setCraftName(undefined);
    setTechniqueName(undefined);
  }, [identitySuggestions?.oficio, state.fieldMetadata, update]);

  const handleAcceptMaterials = useCallback(() => {
    if (!identitySuggestions?.materials?.length) return;
    const materialsMeta: MaterialFieldMetadata[] =
      identitySuggestions.materials.map((m) => ({
        value: m.value,
        label: m.label,
        source: "ia_accepted" as FieldSource,
      }));
    update({
      materials: identitySuggestions.materials.map((m) => m.value),
      fieldMetadata: { ...state.fieldMetadata, materials: materialsMeta },
    });
  }, [identitySuggestions?.materials, state.fieldMetadata, update]);

  const handleRejectSuggestion = useCallback(
    (field: "category" | "oficio" | "materials") => {
      if (field === "materials") {
        update({
          fieldMetadata: { ...state.fieldMetadata, materials: [] },
        });
      } else {
        const meta: IdentityFieldMetadata = {
          value: "",
          label: "",
          source: "manual",
        };
        update({
          fieldMetadata: { ...state.fieldMetadata, [field]: meta },
        });
      }
    },
    [state.fieldMetadata, update],
  );

  const { missing, attemptNext, fieldError } = useStepValidation([
    {
      key: "category",
      label: "Categoría TELAR",
      isValid: !!state.categoryId,
      errorMessage: "Selecciona una categoría",
    },
    {
      key: "craft",
      label: "Oficio",
      isValid: !!state.craftId,
      errorMessage: "Selecciona el oficio artesanal",
    },
    {
      key: "technique",
      label: "Técnica",
      isValid: !!state.primaryTechniqueId,
      errorMessage: "Selecciona la técnica principal",
    },
    {
      key: "productionType",
      label: "Tipo de producción",
      isValid: !!state.productionType,
      errorMessage: "Selecciona cómo se produce esta pieza",
    },
  ]);

  const telarCategories = allCategories
    .filter((c) => !c.parentId)
    .map((c) => {
      const def = TELAR_CATEGORY_DEFS.find(
        (d) =>
          d.name === c.name ||
          c.name.toLowerCase().includes(d.name.split(" ")[0].toLowerCase()),
      );
      return { ...c, icon: def?.icon ?? "category" };
    });

  const subcategories = allCategories.filter(
    (c) => c.parentId === state.categoryId,
  );
  const selectedCategoryName = allCategories.find(
    (c) => c.id === state.categoryId,
  )?.name;
  const selectedSubcategoryName = subcategories.find(
    (c) => c.id === state.subcategoryId,
  )?.name;

  useEffect(() => {
    getAllCategories()
      .then(setAllCategories)
      .catch(() => {});
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    update({ categoryId, subcategoryId: undefined });
  };

  const handleCraftChange = (craftId: string | undefined) => {
    update({
      craftId,
      primaryTechniqueId: undefined,
      secondaryTechniqueId: undefined,
    });
    if (!craftId) {
      setCraftName(undefined);
      setTechniqueName(undefined);
    }
  };

  const toggleCollaboration = (val: boolean) => {
    setShowCollaboration(val);
    update({ isCollaboration: val });
  };

  const [isConfirming, setIsConfirming] = useState(false);

  const handleNext = async () => {
    if (!attemptNext()) {
      toast.error("Completa los campos marcados en rojo");
      return;
    }

    if (!state.primaryTechniqueId) {
      toast.error("Por favor selecciona la técnica artesanal");
      return;
    }

    if (state.materials.length === 0) {
      toast.error("Por favor agrega al menos un material");
      return;
    }

    if (!state.purpose) {
      toast.error("Por favor selecciona el propósito de la pieza");
      return;
    }

    if (!state.productionType) {
      toast.error("Por favor selecciona el tipo de producción");
      return;
    }

    // Build the confirm payload
    const confirmPayload: Step1ConfirmRequest = {
      userId: userId || "",
      productDraftId: state.productId ?? "",
      shortDescription: {
        source: state.fieldMetadata?.shortDescription?.source ?? "manual",
        originalAiValue:
          state.fieldMetadata?.shortDescription?.originalAiValue ?? "",
        timestamp:
          state.fieldMetadata?.shortDescription?.timestamp ??
          new Date().toISOString(),
      },
      artisanalHistory: {
        source: state.fieldMetadata?.artisanalHistory?.source ?? "manual",
        originalAiValue:
          state.fieldMetadata?.artisanalHistory?.originalAiValue ?? "",
        timestamp:
          state.fieldMetadata?.artisanalHistory?.timestamp ??
          new Date().toISOString(),
      },
      category: state.fieldMetadata?.category ?? {
        value: state.categoryId,
        label: selectedCategoryName ?? "",
        source: "manual",
      },
      oficio: state.fieldMetadata?.oficio ?? {
        value: state.craftId,
        label: craftName ?? "",
        source: "manual",
      },
      materials:
        state.fieldMetadata?.materials ??
        state.materials.map((id) => ({
          value: id,
          label: "",
          source: "manual" as const,
        })),
    };

    console.log("[Step2] fieldMetadata state on next:", confirmPayload);

    // Call step-1-confirm endpoint
    if (confirmPayload.userId && confirmPayload.productDraftId) {
      setIsConfirming(true);
      try {
        const confirmResponse = await step1Confirm(confirmPayload);
        console.log("[Step2] step1Confirm response:", confirmResponse);
        update({ agentStep1ConfirmResponse: confirmResponse });
      } catch (error) {
        console.error("[Step2] Error calling step1Confirm:", error);
      } finally {
        setIsConfirming(false);
      }
    }

    onNext();
  };

  return (
    <div style={{ background: "transparent" }}>
      <main className="w-full max-w-[1200px] mx-auto pt-6 pb-32 px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Sidebar — desktop only */}
          <aside className="hidden lg:block lg:col-span-3">
            <div
              className="p-5 sticky top-8 flex flex-col gap-4 rounded-2xl"
              style={{ background: "#151b2d" }}
            >
              <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ec6d13] text-lg">
                    auto_awesome
                  </span>
                  <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                    Sugerido por IA
                  </h2>
                </div>
                <p className="text-[11px] text-white/50">
                  {hasSuggestions
                    ? "Esto lo sugirió el sistema. Tú decides qué confirmar."
                    : "No hay sugerencias de identidad disponibles aún."}
                </p>
              </div>

              {/* Category suggestion */}
              {identitySuggestions?.category && (
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] text-white/40 font-[800] uppercase tracking-widest">
                      Posible Categoría
                    </p>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">
                      IA
                    </span>
                  </div>
                  <p className="text-[13px] text-white/80 font-[500] mb-1">
                    {identitySuggestions.category.label}
                  </p>
                  {identitySuggestions.category.reasoning && (
                    <p className="text-[10px] text-white/40 mb-2 leading-snug">
                      {identitySuggestions.category.reasoning}
                    </p>
                  )}
                  {state.fieldMetadata?.category?.source === "ia_accepted" ? (
                    <p className="text-[10px] text-green-400 font-[700] uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        check_circle
                      </span>
                      Aceptada
                    </p>
                  ) : state.fieldMetadata?.category?.source === "manual" ? (
                    <p className="text-[10px] text-white/40 font-[700] uppercase tracking-widest">
                      Descartada
                    </p>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAcceptCategory}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion("category")}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Oficio suggestion */}
              {identitySuggestions?.oficio && (
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] text-white/40 font-[800] uppercase tracking-widest">
                      Posible Oficio
                    </p>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">
                      IA
                    </span>
                  </div>
                  <p className="text-[13px] text-white/80 font-[500] mb-1">
                    {identitySuggestions.oficio.label}
                  </p>
                  {identitySuggestions.oficio.reasoning && (
                    <p className="text-[10px] text-white/40 mb-2 leading-snug">
                      {identitySuggestions.oficio.reasoning}
                    </p>
                  )}
                  {state.fieldMetadata?.oficio?.source === "ia_accepted" ? (
                    <p className="text-[10px] text-green-400 font-[700] uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        check_circle
                      </span>
                      Aceptada
                    </p>
                  ) : state.fieldMetadata?.oficio?.source === "manual" ? (
                    <p className="text-[10px] text-white/40 font-[700] uppercase tracking-widest">
                      Descartada
                    </p>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAcceptOficio}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion("oficio")}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Materials suggestion */}
              {identitySuggestions?.materials &&
                identitySuggestions.materials.length > 0 && (
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] text-white/40 font-[800] uppercase tracking-widest">
                        Materiales frecuentes
                      </p>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">
                        IA
                      </span>
                    </div>
                    <p className="text-[13px] text-white/80 font-[500] mb-2">
                      {identitySuggestions.materials
                        .map((m) => m.label)
                        .join(", ")}
                    </p>
                    {state.fieldMetadata?.materials &&
                    state.fieldMetadata.materials.length > 0 &&
                    state.fieldMetadata.materials[0].source ===
                      "ia_accepted" ? (
                      <p className="text-[10px] text-green-400 font-[700] uppercase tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          check_circle
                        </span>
                        Aceptados
                      </p>
                    ) : state.fieldMetadata?.materials &&
                      state.fieldMetadata.materials.length === 0 ? (
                      <p className="text-[10px] text-white/40 font-[700] uppercase tracking-widest">
                        Descartados
                      </p>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleAcceptMaterials}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleRejectSuggestion("materials")}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}
                  </div>
                )}

              {/* No suggestions fallback */}
              {!hasSuggestions && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <span className="material-symbols-outlined text-white/20 text-[28px]">
                    psychology
                  </span>
                  <p className="text-[11px] text-white/30 text-center">
                    Completa el paso 1 para recibir sugerencias de identidad
                    artesanal.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main form */}
          <section className="lg:col-span-9 space-y-4">
            {/* ── 1. Categoría ──────────────────────────── */}
            <div
              id="wizard-field-category"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-1">
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] tracking-widest uppercase">
                  Categoría TELAR
                  <RequiredMark />
                </label>
                <AiBadge />
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Las categorías oficiales de la plataforma. Elige la que mejor
                describe tu pieza.
              </p>

              {allCategories.length === 0 ? (
                <p className="text-[12px] text-[#54433e]/40 italic py-2">
                  Cargando categorías...
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {telarCategories.map((cat) => {
                    const isSelected = state.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center gap-1"
                        style={{
                          background: isSelected
                            ? "rgba(236,109,19,0.07)"
                            : "rgba(255,255,255,0.6)",
                          border: isSelected
                            ? "1.5px solid rgba(236,109,19,0.5)"
                            : "1px solid rgba(226,213,207,0.4)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ color: isSelected ? "#ec6d13" : "#54433e" }}
                        >
                          {cat.icon}
                        </span>
                        <span
                          className="text-[9px] font-[800] uppercase tracking-wider leading-tight"
                          style={{ color: isSelected ? "#ec6d13" : "#54433e" }}
                        >
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {fieldError("category") && (
                <FieldErrorMessage message="Selecciona una categoría" />
              )}

              {state.categoryId && (
                <div className="mt-4 pt-4 border-t border-[#e2d5cf]/30">
                  <label className="font-['Manrope'] text-[9px] font-[800] text-[#54433e]/60 tracking-widest uppercase block mb-2">
                    Subcategoría
                    {selectedCategoryName && (
                      <span className="ml-1.5 text-[#ec6d13] normal-case font-[600] tracking-normal">
                        de {selectedCategoryName}
                      </span>
                    )}
                  </label>
                  {subcategories.length === 0 ? (
                    <p className="text-[11px] text-[#54433e]/40 italic">
                      Sin subcategorías disponibles
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((sub) => {
                        const isSelected = state.subcategoryId === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() =>
                              update({
                                subcategoryId: isSelected ? undefined : sub.id,
                              })
                            }
                            className="px-3 py-1.5 rounded-full text-[11px] font-[600] transition-all"
                            style={{
                              background: isSelected
                                ? "#ec6d13"
                                : "rgba(255,255,255,0.6)",
                              color: isSelected ? "white" : "#54433e",
                              border: isSelected
                                ? "1px solid #ec6d13"
                                : "1px solid rgba(226,213,207,0.5)",
                            }}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedSubcategoryName && (
                    <p className="text-[10px] text-[#ec6d13] mt-2 font-[600]">
                      Subcategoría seleccionada: {selectedSubcategoryName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── 2. Oficio + Técnicas ──────────────────── */}
            <div
              id="wizard-field-craft"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-1">
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] tracking-widest uppercase">
                  Oficio
                  <RequiredMark />
                </label>
                <AiBadge />
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                {selectedCategoryName
                  ? `Oficios habituales para ${selectedCategoryName}. Puedes buscar cualquier otro.`
                  : "Selecciona primero una categoría para ver los oficios más relevantes."}
              </p>
              <CraftPicker
                categoryName={selectedCategoryName}
                selectedCraftId={state.craftId}
                onChange={handleCraftChange}
                onNameChange={setCraftName}
              />
              {fieldError("craft") && (
                <FieldErrorMessage message="Selecciona el oficio artesanal" />
              )}

              {state.craftId && (
                <div
                  id="wizard-field-technique"
                  className="mt-5 pt-5 border-t border-[#e2d5cf]/25"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] tracking-widest uppercase">
                      Técnica
                      <RequiredMark />
                    </label>
                    <AiBadge />
                  </div>
                  <TechniquePicker
                    craftId={state.craftId}
                    craftName={craftName}
                    selectedTechniqueId={state.primaryTechniqueId}
                    onChange={(techniqueId) =>
                      update({ primaryTechniqueId: techniqueId })
                    }
                    onNameChange={setTechniqueName}
                  />
                  {fieldError("technique") && (
                    <FieldErrorMessage message="Selecciona la técnica principal" />
                  )}
                </div>
              )}
            </div>

            {/* ── 3. Materiales ─────────────────────────── */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] tracking-widest uppercase">
                    Materiales de la pieza *
                  </label>
                  <AiBadge />
                </div>
                {state.materials.length > 0 && (
                  <span className="text-[10px] font-[600] text-[#ec6d13]">
                    {state.materials.length} seleccionado
                    {state.materials.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Selecciona los materiales de tu perfil o agrega nuevos. Los que
                selecciones aquí quedan asociados a esta pieza y también se
                guardan en tu perfil artesanal.
              </p>
              <MaterialPicker
                artisanId={artisanId}
                userId={userId}
                selectedIds={state.materials}
                onChange={(ids) => update({ materials: ids })}
                suggestFromTechniqueNames={
                  [craftName, techniqueName].filter(Boolean) as string[]
                }
              />
            </div>

            {/* ── 4. Propósito + Estilo ─────────────────── */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Propósito */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Propósito *
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-3">
                    ¿Para qué fue creada esta pieza?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PURPOSES.map((p) => {
                      const isSelected = state.purpose === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => update({ purpose: p.id })}
                          className="flex flex-col gap-1 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: isSelected
                              ? "rgba(236,109,19,0.07)"
                              : "rgba(255,255,255,0.6)",
                            border: isSelected
                              ? "1.5px solid rgba(236,109,19,0.4)"
                              : "1px solid rgba(226,213,207,0.35)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px]"
                              style={{
                                color: isSelected ? "#ec6d13" : "#54433e",
                              }}
                            >
                              {p.icon}
                            </span>
                            <span
                              className="text-[10px] font-[800] uppercase tracking-wider"
                              style={{
                                color: isSelected ? "#ec6d13" : "#54433e",
                              }}
                            >
                              {p.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#54433e]/50 leading-snug">
                            {p.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estilo */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Estilo
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-3">
                    ¿Cómo se relaciona esta pieza con la tradición?
                  </p>
                  <div className="flex flex-col gap-2">
                    {STYLES.map((s) => {
                      const isSelected = (state.styles ?? [])[0] === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => update({ styles: [s.id] })}
                          className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: isSelected
                              ? "rgba(236,109,19,0.07)"
                              : "rgba(255,255,255,0.6)",
                            border: isSelected
                              ? "1.5px solid rgba(236,109,19,0.4)"
                              : "1px solid rgba(226,213,207,0.35)",
                          }}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border-2 flex items-center justify-center transition-colors"
                            style={{
                              borderColor: isSelected
                                ? "#ec6d13"
                                : "rgba(84,67,62,0.25)",
                            }}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
                            )}
                          </div>
                          <div>
                            <span
                              className="text-[10px] font-[800] uppercase tracking-wider block mb-0.5"
                              style={{
                                color: isSelected ? "#ec6d13" : "#54433e",
                              }}
                            >
                              {s.label}
                            </span>
                            <span className="text-[10px] text-[#54433e]/50 leading-snug">
                              {s.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. Tipo de producción ─────────────────── */}
            <div
              id="wizard-field-productionType"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-1 uppercase tracking-widest">
                Tipo de producción
                <RequiredMark />
              </label>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                ¿Cómo se produce esta pieza? Esto define su disponibilidad
                comercial.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                {PRODUCTION_TYPES.map((pt) => {
                  const isSelected = state.productionType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() =>
                        update({
                          productionType: pt.id,
                          availabilityType: deriveAvailabilityType(pt.id),
                        })
                      }
                      className="flex flex-col gap-1 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected
                          ? "rgba(236,109,19,0.07)"
                          : "rgba(255,255,255,0.6)",
                        border: isSelected
                          ? "1.5px solid rgba(236,109,19,0.4)"
                          : "1px solid rgba(226,213,207,0.35)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: isSelected ? "#ec6d13" : "#54433e" }}
                      >
                        {pt.icon}
                      </span>
                      <span
                        className="text-[10px] font-[800] uppercase tracking-wider"
                        style={{ color: isSelected ? "#ec6d13" : "#54433e" }}
                      >
                        {pt.label}
                      </span>
                      <span className="text-[10px] text-[#54433e]/50 leading-snug">
                        {pt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
              {fieldError("productionType") && (
                <FieldErrorMessage message="Selecciona cómo se produce esta pieza" />
              )}
              {state.productionType && (
                <p className="text-[11px] text-[#54433e]/60 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">
                    storefront
                  </span>
                  Se venderá como:{" "}
                  <span className="font-[800] text-[#151b2d]">
                    {
                      AVAILABILITY_LABELS[
                        deriveAvailabilityType(state.productionType)
                      ]
                    }
                  </span>
                </p>
              )}
            </div>

            {/* ── 6. Colaboración ───────────────────────── */}
            <div className="p-5 space-y-4 rounded-2xl" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    ¿Creada en colaboración?
                  </label>
                  <p className="text-[11px] text-[#54433e]/60">
                    Actívalo solo si otra persona, marca o colectivo participó.
                  </p>
                </div>
                <div
                  className="flex p-1 rounded-lg border border-[#151b2d]/5"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  {["Sí", "No"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleCollaboration(opt === "Sí")}
                      className="px-4 py-1.5 text-[11px] font-[800] rounded-md transition-all uppercase"
                      style={{
                        background:
                          (opt === "Sí") === showCollaboration
                            ? "#ec6d13"
                            : "transparent",
                        color:
                          (opt === "Sí") === showCollaboration
                            ? "white"
                            : "inherit",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {showCollaboration && (
                <div className="pt-4 border-t border-[#151b2d]/5">
                  <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                    ¿Con quién?
                  </label>
                  <input
                    type="text"
                    value={state.collaboration?.name ?? ""}
                    onChange={(e) =>
                      update({
                        collaboration: {
                          ...state.collaboration,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="Nombre del colaborador"
                    className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
                  />
                </div>
              )}
            </div>

            {missing.length > 0 && (
              <div className="mt-4">
                <MissingFieldsBanner missing={missing} />
              </div>
            )}
          </section>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={isConfirming}
        disabledReason={isConfirming ? "Confirmando información..." : undefined}
        nextLabel="Confirmar y continuar"
        leftOffset={leftOffset}
      />
    </div>
  );
};
