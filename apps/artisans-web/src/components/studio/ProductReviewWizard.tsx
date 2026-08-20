import React, { useEffect, useMemo, useState } from "react";
import type { ProductResponse, CreateProductsNewDto } from "@/services/products-new.types";
import type { NewWizardState } from "@/components/shop/new-product-wizard/hooks/useNewWizardState";
import { mapProductResponseToWizardState } from "@/components/shop/new-product-wizard/hooks/mapProductToWizardState";
import { mapNewStateToDto } from "@/components/shop/new-product-wizard/hooks/useWizardDraft";
import { WizardModeProvider } from "@/components/shop/new-product-wizard/context/WizardModeContext";
import type { InjectVariant } from "@/components/studio/test-data/buildTestProduct";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
 * Con `mode="create"` el mismo shell sirve para que el moderador registre una
 * pieza en nombre de la tienda seleccionada: arranca vacío y desbloqueado, y el
 * rail muestra Crear/Cancelar en vez del toggle Editar.
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
  /** Producto a revisar. Ausente en `mode="create"`. */
  product?: ProductResponse | null;
  /** `review` (default) modera un producto existente; `create` registra uno nuevo. */
  mode?: "review" | "create";
  /** Valores iniciales del formulario en `mode="create"` (datos de la tienda). */
  seed?: Partial<NewWizardState>;
  /** userId del dueño de la tienda: alimenta los pickers de perfil. */
  shopUserId?: string;
  shopId?: string;
  /** Persiste la edición o la creación (upsert). Devuelve true si guardó. */
  onSave?: (dto: CreateProductsNewDto) => Promise<boolean>;
  /** Sale del modo creación sin guardar. */
  onCancelCreate?: () => void;
  /**
   * Genera datos de prueba para la tienda (solo en `mode="create"`): devuelve el
   * parche de estado a fusionar, o null si no se pudo generar.
   */
  onInject?: (variant: InjectVariant) => Promise<Partial<NewWizardState> | null>;
  saving?: boolean;
}

export const ProductReviewWizard: React.FC<ProductReviewWizardProps> = ({
  product,
  mode = "review",
  seed,
  shopUserId,
  shopId,
  onSave,
  onCancelCreate,
  onInject,
  saving = false,
}) => {
  const isCreate = mode === "create";
  const [currentStep, setCurrentStep] = useState(1);
  const [injecting, setInjecting] = useState<InjectVariant | null>(null);
  const [editable, setEditable] = useState(isCreate);
  const [state, setState] = useState<NewWizardState>(() =>
    isCreate
      ? { ...BASE_STATE, ...seed }
      : { ...BASE_STATE, ...(product ? mapProductResponseToWizardState(product) : {}) },
  );

  // Re-sembrar el estado cuando cambia el producto seleccionado.
  useEffect(() => {
    if (isCreate || !product) return;
    setState({ ...BASE_STATE, ...mapProductResponseToWizardState(product) });
    setCurrentStep(1);
    setEditable(false);
  }, [product, isCreate]);

  // En creación el mínimo que acepta el backend: nombre + descripción corta.
  const canCreate = !!state.name.trim() && !!state.shortDescription.trim();

  const handleSave = async () => {
    if (!onSave) return;
    const urls = (state.images ?? []).filter((i): i is string => typeof i === "string");
    const storeId = shopId ?? product?.storeId;
    if (!storeId) return;
    const dto = mapNewStateToDto(state, storeId, urls, false);
    if (isCreate) {
      // El moderador registra la pieza como borrador de la tienda; el envío a
      // curaduría (o la aprobación directa) se decide luego desde el Studio.
      dto.status = "draft";
    } else if (product) {
      // Editar NO cambia el estado de moderación: se conserva el actual.
      dto.status = product.status as CreateProductsNewDto["status"];
    }
    const ok = await onSave(dto);
    if (ok && !isCreate) setEditable(false);
  };

  const handleInject = async (variant: InjectVariant) => {
    if (!onInject || injecting) return;
    setInjecting(variant);
    try {
      const patch = await onInject(variant);
      if (patch) {
        setState((prev) => ({ ...prev, ...patch }));
        // Se salta al resumen: ahí se ve la ficha completa de un golpe.
        setCurrentStep(TOTAL_STEPS);
      }
    } finally {
      setInjecting(null);
    }
  };

  const handleCancelEdit = () => {
    if (isCreate) {
      onCancelCreate?.();
      return;
    }
    setState({ ...BASE_STATE, ...(product ? mapProductResponseToWizardState(product) : {}) });
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
  const wizardMode = editable ? "review-edit" : "review-readonly";

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

        {/* Inyectar datos de prueba (solo al crear) */}
        {isCreate && onInject && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" disabled={!!injecting || saving}
                className="flex flex-shrink-0 items-center gap-1 rounded-md border border-dashed px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50"
                style={{ borderColor: "rgba(20,34,57,0.35)", color: "#142239" }}>
                <span className={`material-symbols-outlined text-[15px] ${injecting ? "animate-spin" : ""}`}>
                  {injecting ? "progress_activity" : "science"}
                </span>
                {injecting ? "Inyectando…" : "Inyectar datos"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuItem onSelect={() => void handleInject("realista")}
                className="flex-col items-start gap-0.5 py-2">
                <span className="text-xs font-semibold text-slate-800">Realista (según el oficio)</span>
                <span className="text-[11px] leading-snug text-slate-500">
                  Pieza, materiales, técnica, precio y medidas coherentes con el oficio de esta tienda.
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void handleInject("proximamente")}
                className="flex-col items-start gap-0.5 py-2">
                <span className="text-xs font-semibold text-slate-800">Próximamente (plantilla)</span>
                <span className="text-[11px] leading-snug text-slate-500">
                  Ficha que anuncia que la pieza se está creando y pronto estará disponible.
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Editar / Guardar / Cancelar */}
        {onSave && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {editable ? (
              <>
                <button type="button" onClick={handleSave} disabled={saving || !!injecting || (isCreate && !canCreate)}
                  title={isCreate && !canCreate ? "Completa el nombre y la descripción corta" : undefined}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "#ec6d13" }}>
                  <span className="material-symbols-outlined text-[15px]">
                    {saving ? "progress_activity" : isCreate ? "add" : "save"}
                  </span>
                  {saving ? "Guardando…" : isCreate ? "Crear producto" : "Guardar"}
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
      <WizardModeProvider mode={wizardMode}>
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
