import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/stores/authStore";
import {
  createProductNew,
  updateProductNew,
} from "@/services/products-new.actions";
import { getArtisanShopByUserId } from "@/services/artisanShops.actions";
import type { NewWizardState } from "../hooks/useNewWizardState";
import { mapNewStateToDto, extractApiError } from "../hooks/useWizardDraft";
import { useResolvedNames } from "../hooks/useResolvedNames";
import { useImagePreviews } from "../hooks/useImagePreviews";
import { MarketplaceProductPreview } from "../components/marketplace-preview/MarketplaceProductPreview";
import { WizardFooter } from "../components/WizardFooter";

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onBack: () => void;
  onGoToStep: (n: number) => void;
  onPublished: () => void;
  shopId: string;
  step: number;
  totalSteps: number;
  leftOffset?: number;
}

export const Step6FinalReview: React.FC<Props> = ({
  state,
  update,
  onBack,
  onGoToStep,
  onPublished,
  shopId,
  step,
  totalSteps,
  leftOffset,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { user: authUser } = useAuth();
  const { user: storeUser } = useAuthStore();
  const user = authUser ?? storeUser;

  const names = useResolvedNames(state);
  const imagePreviews = useImagePreviews(state.images);

  // ── Validación global: todas las secciones obligatorias ──
  const isStep1Complete = !!(
    state.name?.trim() && state.shortDescription?.trim()
  );
  const isStep2Complete = !!(
    state.categoryId &&
    state.craftId &&
    state.primaryTechniqueId
  );
  const activeVariants = (state.variants ?? []).filter((v) => v.isActive);
  const isStep4Complete = !!(
    state.price &&
    (state.availabilityType || state.productionType) &&
    state.heightCm &&
    state.widthCm &&
    state.lengthCm &&
    state.weightKg &&
    state.packagedWidthCm &&
    state.packagedHeightCm &&
    state.packagedLengthCm &&
    state.packagedWeightKg &&
    (!state.hasVariants || activeVariants.length > 0)
  );
  const isDraft = !state.status || state.status === "draft";
  const canSubmit =
    isStep1Complete && isStep2Complete && isStep4Complete && isDraft;

  const incompleteSections = [
    ...(!isStep1Complete
      ? [{ step: 1, label: "La pieza", detail: "nombre y descripción" }]
      : []),
    ...(!isStep2Complete
      ? [
          {
            step: 2,
            label: "Identidad artesanal",
            detail: "categoría, oficio y técnica",
          },
        ]
      : []),
    ...(!isStep4Complete
      ? [
          {
            step: 4,
            label: "Precio y logística",
            detail: "precio, dimensiones y variantes",
          },
        ]
      : []),
  ];

  const IncompleteSectionsBanner = () =>
    isDraft && incompleteSections.length > 0 ? (
      <div
        className="rounded-xl border border-[#ef4444]/30 px-4 py-3"
        style={{ background: "rgba(239,68,68,0.08)" }}
        role="alert"
      >
        <p className="flex items-center gap-1.5 text-[12px] font-[700] text-[#ef4444]">
          <span className="material-symbols-outlined text-[16px]">error</span>
          Completa estas secciones antes de enviar a curaduría:
        </p>
        <ul className="mt-2 space-y-1.5">
          {incompleteSections.map((s) => (
            <li
              key={s.step}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-[11px] font-[600] text-[#54433e]">
                {s.label}
                <span className="text-[#54433e]/50 font-[500]">
                  {" "}
                  — {s.detail}
                </span>
              </span>
              <button
                onClick={() => onGoToStep(s.step)}
                className="flex items-center gap-0.5 text-[10px] font-[800] text-[#ec6d13] shrink-0 uppercase tracking-wide"
              >
                Editar
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 13 }}
                >
                  east
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const resolveStoreId = async (): Promise<string | null> => {
    if (shopId) return shopId;
    if (!user) return null;
    try {
      const shop = await getArtisanShopByUserId(user.id);
      return shop?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sesión expirada. Recarga la página.");
      return;
    }
    setIsSubmitting(true);
    try {
      const storeId = await resolveStoreId();
      if (!storeId) {
        toast.error("No se encontró tu tienda. Recarga la página.");
        return;
      }

      // Images are already uploaded to S3 from Step1, just filter URLs
      const imageUrls = state.images.filter(
        (img): img is string => typeof img === "string",
      );

      // Create DTO with publish=true to change status to "pending_review"
      const dto = mapNewStateToDto(state, storeId, imageUrls, true);
      console.log("[Step6] Enviando DTO final:", JSON.stringify(dto, null, 2));

      // Product should already exist from Step2, but handle both cases
      if (state.productId) {
        await updateProductNew(state.productId, dto, { suppressToast: true });
        console.log(
          "[Step6] Product updated to pending_review:",
          state.productId,
        );
      } else {
        const result = await createProductNew(dto, { suppressToast: true });
        console.log("[Step6] Product created (fallback):", result);
      }

      onPublished();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data;
      console.error(
        "[Step6] Error al enviar pieza — status:",
        status,
        "— body:",
        JSON.stringify(detail, null, 2),
        "— err:",
        err,
      );
      toast.error(
        `No se pudo enviar la pieza (${status ?? "sin respuesta"}): ${extractApiError(err)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error("Sesión expirada. Recarga la página.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const storeId = await resolveStoreId();
      if (!storeId) {
        toast.error("No se encontró tu tienda. Recarga la página.");
        return;
      }
      const dto = mapNewStateToDto(state, storeId, [], false);
      console.log(
        "[Step6] Guardando borrador DTO:",
        JSON.stringify(dto, null, 2),
      );
      if (state.productId) {
        await updateProductNew(state.productId, dto, { suppressToast: true });
      } else {
        const result = await createProductNew(dto, { suppressToast: true });
        const newId = (result as any)?.id ?? (result as any)?.productId;
        if (newId) update({ productId: newId });
      }
      toast.success("Borrador guardado");
    } catch (err: any) {
      console.error("[Step6] Error al guardar borrador:", err);
      toast.error(`No se pudo guardar: ${extractApiError(err)}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="pb-32" style={{ background: "transparent" }}>
      <div className="max-w-5xl mx-auto px-4 pt-4 md:px-6 md:pt-6 flex flex-col gap-4">
        <IncompleteSectionsBanner />

        {/* Aviso del pasaporte */}
        <div
          className="flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{
            background: "rgba(22,101,52,0.06)",
            border: "1px solid rgba(22,101,52,0.18)",
          }}
        >
          <span
            className="material-symbols-outlined text-[#166534] shrink-0"
            style={{ fontSize: 16 }}
          >
            info
          </span>
          <p className="font-['Manrope'] text-[12px] font-[500] text-[#54433e]">
            El pasaporte digital permanecerá en estado preparado hasta la
            aprobación del producto para marketplace.
          </p>
        </div>

        <MarketplaceProductPreview
          state={state}
          names={names}
          imagePreviews={imagePreviews}
          onGoToStep={onGoToStep}
        />
      </div>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        isFinalStep
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitDisabled={!canSubmit}
        submitDisabledReason={
          !canSubmit
            ? isDraft
              ? "Faltan datos obligatorios en pasos anteriores."
              : "El producto ya fue enviado a curaduría."
            : undefined
        }
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        leftOffset={leftOffset}
      />
    </div>
  );
};
