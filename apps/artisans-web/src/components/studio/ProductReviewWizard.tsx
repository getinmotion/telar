import React, { useEffect, useMemo, useState } from "react";
import type { ProductResponse, CreateProductsNewDto } from "@/services/products-new.types";
import type { NewWizardState } from "@/components/shop/new-product-wizard/hooks/useNewWizardState";
import { mapProductResponseToWizardState } from "@/components/shop/new-product-wizard/hooks/mapProductToWizardState";
import { mapNewStateToDto } from "@/components/shop/new-product-wizard/hooks/useWizardDraft";
import { WizardModeProvider } from "@/components/shop/new-product-wizard/context/WizardModeContext";
import { Step1NewPiece } from "@/components/shop/new-product-wizard/steps/Step1NewPiece";
import { Step2ArtisanalIdentity } from "@/components/shop/new-product-wizard/steps/Step2ArtisanalIdentity";
import { Step3ProcessTime } from "@/components/shop/new-product-wizard/steps/Step3ProcessTime";
import { Step4PriceLogistics } from "@/components/shop/new-product-wizard/steps/Step4PriceLogistics";
import { Step5DigitalPassport } from "@/components/shop/new-product-wizard/steps/Step5DigitalPassport";
import { Step6FinalReview } from "@/components/shop/new-product-wizard/steps/Step6FinalReview";

/**
 * ProductReviewWizard — vista foco de moderación de un producto.
 *
 * Renderiza EXACTAMENTE los 6 pasos del wizard de creación (los mismos
 * componentes: tarjetas, chips y pickers que vio el artesano) en modo revisión.
 * El bloqueo lo hace un <fieldset disabled>, que desactiva de forma nativa
 * todos los controles (button/input/textarea) sin tocar ningún input hoja.
 * La navegación de autoría (footer/header del wizard) queda suprimida por el
 * WizardModeContext; aquí la controla el step-rail.
 *
 * Sustituye al antiguo StudioProductEditor, que reimplementaba el producto con
 * dropdowns y perdía campos.
 */

const TOTAL_STEPS = 6;

const STEP_CONFIGS = [
  { icon: "add_photo_alternate", title: "La pieza" },
  { icon: "fingerprint", title: "Identidad" },
  { icon: "history_edu", title: "Proceso" },
  { icon: "payments", title: "Precio" },
  { icon: "verified", title: "Pasaporte" },
  { icon: "fact_check", title: "Resumen" },
];

// Base mínima del estado del wizard (equivale a initialState del autor).
const BASE_STATE: NewWizardState = {
  images: [],
  name: "",
  shortDescription: "",
  materials: [],
  country: "Colombia",
  processStages: [],
  tools: [],
  processEvidenceUrls: [],
};

const STEPS: React.ComponentType<any>[] = [
  Step1NewPiece,
  Step2ArtisanalIdentity,
  Step3ProcessTime,
  Step4PriceLogistics,
  Step5DigitalPassport,
  Step6FinalReview,
];

interface ProductReviewWizardProps {
  product: ProductResponse;
  /** userId del dueño de la tienda: alimenta los pickers de perfil. */
  shopUserId?: string;
  shopId?: string;
  /** Persiste la edición (upsert). Devuelve true si guardó. */
  onSave?: (dto: CreateProductsNewDto) => Promise<boolean>;
  saving?: boolean;
}

export const ProductReviewWizard: React.FC<ProductReviewWizardProps> = ({
  product,
  shopUserId,
  shopId,
  onSave,
  saving = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [editable, setEditable] = useState(false);
  const [state, setState] = useState<NewWizardState>(() => ({
    ...BASE_STATE,
    ...mapProductResponseToWizardState(product),
  }));

  // Re-sembrar el estado cuando cambia el producto seleccionado.
  useEffect(() => {
    setState({ ...BASE_STATE, ...mapProductResponseToWizardState(product) });
    setCurrentStep(1);
    setEditable(false);
  }, [product]);

  const handleSave = async () => {
    if (!onSave) return;
    const urls = (state.images ?? []).filter((i): i is string => typeof i === "string");
    const dto = mapNewStateToDto(state, shopId ?? product.storeId, urls, false);
    // Editar NO cambia el estado de moderación: se conserva el actual.
    dto.status = product.status as CreateProductsNewDto["status"];
    const ok = await onSave(dto);
    if (ok) setEditable(false);
  };

  const handleCancelEdit = () => {
    setState({ ...BASE_STATE, ...mapProductResponseToWizardState(product) });
    setEditable(false);
  };

  const update = useMemo(
    () => (updates: Partial<NewWizardState>) =>
      setState((prev) => ({ ...prev, ...updates })),
    [],
  );

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const stepProps = {
    state,
    update,
    onNext: goNext,
    onBack: goBack,
    onSaveDraft: () => {},
    isSavingDraft: false,
    step: currentStep,
    totalSteps: TOTAL_STEPS,
    artisanId: shopUserId ?? "",
    userId: shopUserId ?? "",
    leftOffset: 0,
    shopId: shopId ?? "",
    onGoToStep: setCurrentStep,
    onPublished: () => {},
  };

  const StepComponent = STEPS[currentStep - 1];
  const mode = editable ? "review-edit" : "review-readonly";

  return (
    <div className="flex h-full flex-col min-h-0" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Step rail + controles de edición */}
      <div className="flex-shrink-0 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {STEP_CONFIGS.map((cfg, idx) => {
            const n = idx + 1;
            const active = n === currentStep;
            return (
              <button
                key={cfg.title}
                type="button"
                onClick={() => setCurrentStep(n)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                style={
                  active
                    ? { background: "#142239", color: "#fff" }
                    : { background: "#f1f5f9", color: "#64748b" }
                }
              >
                <span className="material-symbols-outlined text-[15px]">{cfg.icon}</span>
                <span className="hidden sm:inline">{n}. {cfg.title}</span>
                <span className="sm:hidden">{n}</span>
              </button>
            );
          })}
        </div>

        {/* Editar / Guardar / Cancelar */}
        {onSave && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {editable ? (
              <>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "#ec6d13" }}>
                  <span className="material-symbols-outlined text-[15px]">
                    {saving ? "progress_activity" : "save"}
                  </span>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button type="button" onClick={handleCancelEdit} disabled={saving}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                  <span className="material-symbols-outlined text-[15px]">close</span>
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditable(true)}
                className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-semibold"
                style={{ borderColor: "rgba(20,34,57,0.2)", color: "#142239" }}>
                <span className="material-symbols-outlined text-[15px]">edit</span>
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido: los pasos reales del wizard, bloqueados en readonly */}
      <WizardModeProvider mode={mode}>
        <fieldset
          disabled={!editable}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto border-0 p-0 m-0"
          style={{ background: "#f9f7f2" }}
        >
          <StepComponent {...stepProps} />
        </fieldset>
      </WizardModeProvider>
    </div>
  );
};

export default ProductReviewWizard;
