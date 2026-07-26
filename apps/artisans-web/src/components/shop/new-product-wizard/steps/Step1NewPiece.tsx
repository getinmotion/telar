import React, { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useOraculo } from "@/components/oraculo/OraculoContext";
import type { NewWizardState } from "../hooks/useNewWizardState";
import { WizardFooter } from "../components/WizardFooter";
import { useStepValidation } from "../hooks/useStepValidation";
import {
  RequiredMark,
  FieldErrorMessage,
  MissingFieldsBanner,
  fieldErrorClass,
} from "../components/FieldValidation";
import {
  getStoriesByArtisan,
  createStory,
  type Story,
} from "@/services/story-library.actions";
import { useImageUpload } from "@/components/shop/ai-upload/hooks/useImageUpload";
import { step1InitialCapture } from "@/services/agent.actions";
import type {
  Step1InitialCaptureRequest,
  Step1InitialCaptureResponse,
  ContentImprovement,
  PhotoFeedback,
  FieldSource,
} from "@/types/agent.types";

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
  shopId?: string;
}

const IMAGE_SLOTS = [
  {
    index: 0,
    icon: "add_a_photo",
    label: "Foto principal",
    hint: "Pieza completa · fondo limpio",
    required: true,
  },
  {
    index: 1,
    icon: "texture",
    label: "Detalle",
    hint: "Acercamiento al material",
  },
  { index: 2, icon: "view_in_ar", label: "Lateral", hint: "Forma y volumen" },
  {
    index: 3,
    icon: "photo_camera",
    label: "Otro ángulo",
    hint: "Vista adicional del producto",
  },
  { index: 4, icon: "place", label: "Entorno", hint: "Pieza en su contexto" },
] as const;

const hasSpeechSupport =
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition);

export const Step1NewPiece: React.FC<Props> = ({
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
  shopId = "",
}) => {
  const [isRecordingDesc, setIsRecordingDesc] = useState(false);
  const [isRecordingHistory, setIsRecordingHistory] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const descRecognitionRef = useRef<any>(null);
  const historyRecognitionRef = useRef<any>(null);

  // Story library state
  const [stories, setStories] = useState<Story[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [isSavingStory, setIsSavingStory] = useState(false);

  // Image upload state - track uploading status per slot
  const { uploadImages } = useImageUpload();
  const [uploadingSlots, setUploadingSlots] = useState<Set<number>>(new Set());

  // Agent state - track loading and response
  // Initialize from restored state if available (e.g., when returning to wizard)
  const [isCallingAgent, setIsCallingAgent] = useState(false);
  const [agentResponse, setAgentResponse] =
    useState<Step1InitialCaptureResponse | null>(
      state.agentStep1Response ?? null,
    );
  const [agentCallAttempted, setAgentCallAttempted] = useState(
    !!state.agentStep1Response,
  );
  const [agentCallCompleted, setAgentCallCompleted] = useState(
    !!state.agentStep1Response,
  );

  // Validation: require name, description, main photo, and history
  const hasMainPhoto = state.images[0] && typeof state.images[0] === "string";
  const hasHistory = (state.artisanalHistory?.trim() || "").length > 0;
  const allFieldsComplete =
    state.name.trim().length > 0 &&
    state.shortDescription.trim().length > 0 &&
    hasMainPhoto &&
    hasHistory;

  // Can only continue if fields are complete AND agent has responded
  const canContinue = allFieldsComplete && agentResponse !== null;

  const { missing, attemptNext, fieldError } = useStepValidation([
    {
      key: "name",
      label: "Nombre de la pieza",
      isValid: state.name.trim().length > 0,
    },
    {
      key: "shortDescription",
      label: "Descripción breve",
      isValid: state.shortDescription.trim().length > 0,
    },
    {
      key: "mainPhoto",
      label: "Foto principal",
      isValid: !!hasMainPhoto,
      errorMessage: "Sube la foto principal de la pieza",
    },
    {
      key: "artisanalHistory",
      label: "Historia y contexto",
      isValid: hasHistory,
    },
  ]);

  /**
   * Handle accepting an AI suggestion
   * Copies the AI value to the field and marks as ia_accepted
   */
  const handleAcceptSuggestion = useCallback(
    (field: "shortDescription" | "artisanalHistory", value: string) => {
      update({
        [field]: value,
        fieldMetadata: {
          ...state.fieldMetadata,
          [field]: {
            source: "ia_accepted" as const,
            originalAiValue: value,
            timestamp: new Date().toISOString(),
          },
        },
      });
      toast.success("Sugerencia aplicada");
    },
    [update, state.fieldMetadata],
  );

  /**
   * Handle rejecting an AI suggestion
   * Marks the field as manual (user wants to write their own)
   */
  const handleRejectSuggestion = useCallback(
    (field: "shortDescription" | "artisanalHistory") => {
      update({
        fieldMetadata: {
          ...state.fieldMetadata,
          [field]: {
            source: "manual" as const,
            timestamp: new Date().toISOString(),
          },
        },
      });
      toast.info("Puedes escribir tu propia versión");
    },
    [update, state.fieldMetadata],
  );

  const { setNode, clearNode } = useOraculo();
  useEffect(() => {
    // ── STATE 1: Default waiting ──────────────────────────────────────────────
    if (!agentResponse && !isCallingAgent) {
      setNode(
        <div
          className="p-5 flex flex-col gap-4 rounded-2xl"
          style={{ background: "#151b2d" }}
        >
          <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">
                psychology
              </span>
              <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                ORÁCULO
              </h2>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse shrink-0" />
              <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                Esperando señales...
              </span>
            </div>
          </div>
          {[
            {
              label: "Lectura visual",
              text: "Esperando foto principal para analizar forma, textura, iluminación y fondo.",
            },
            {
              label: "Historia detectada",
              text: "Agrega una historia o dictá tu proceso para que TELAR entienda el valor cultural de tu pieza.",
            },
            {
              label: "Próximo paso",
              text: "Con el nombre, la descripción y la historia, TELAR podrá ayudarte a completar identidad, técnica y categoría en el paso 2.",
            },
          ].map(({ label, text }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
                {label}
              </p>
              <p className="text-[12px] text-white/75 leading-snug">{text}</p>
            </div>
          ))}
          <p className="text-center text-[9px] font-[800] uppercase tracking-widest text-white/25 pt-2 border-t border-white/10">
            Las sugerencias aparecen al agregar foto, descripción o historia.
          </p>
        </div>,
      );
      return clearNode;
    }

    // ── STATE 2: Loading (GREEN ping) ─────────────────────────────────────────
    if (isCallingAgent) {
      setNode(
        <div
          className="p-5 flex flex-col gap-4 rounded-2xl"
          style={{ background: "#151b2d" }}
        >
          <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">
                psychology
              </span>
              <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                ORÁCULO
              </h2>
            </div>
            {/* GREEN ping when calling agent */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
              <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                Esperando respuesta por parte del agente...
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin mb-3" />
            <p className="text-[11px] text-white/60">Analizando contenido...</p>
          </div>
        </div>,
      );
      return clearNode;
    }

    // ── STATE 3: Suggestions available ────────────────────────────────────────
    const improvements = agentResponse?.content_improvements;
    const oraculo = agentResponse?.oraculo;

    setNode(
      <div
        className="p-5 flex flex-col gap-4 rounded-2xl"
        style={{ background: "#151b2d" }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">
              psychology
            </span>
            <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
              ORÁCULO
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[#22c55e] text-[14px]">
              check_circle
            </span>
            <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
              Análisis completado
            </span>
          </div>
        </div>

        {/* Oraculo message */}
        {oraculo && (
          <div
            className="p-3 rounded-xl"
            style={{
              background: "rgba(236,109,19,0.1)",
              border: "1px solid rgba(236,109,19,0.2)",
            }}
          >
            <p className="text-[11px] font-[800] text-[#ec6d13] mb-1">
              {oraculo.title}
            </p>
            <p className="text-[12px] text-white/75 leading-snug">
              {oraculo.body}
            </p>
          </div>
        )}

        {/* Improved description suggestion */}
        {improvements?.improved_description && (
          <SuggestionCard
            label="Descripción sugerida"
            suggestion={improvements.improved_description}
            fieldKey="shortDescription"
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            isAccepted={
              state.fieldMetadata?.shortDescription?.source === "ia_accepted"
            }
            isRejected={
              state.fieldMetadata?.shortDescription?.source === "manual"
            }
          />
        )}

        {/* Improved history suggestion */}
        {improvements?.improved_history && (
          <SuggestionCard
            label="Historia sugerida"
            suggestion={improvements.improved_history}
            fieldKey="artisanalHistory"
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            isAccepted={
              state.fieldMetadata?.artisanalHistory?.source === "ia_accepted"
            }
            isRejected={
              state.fieldMetadata?.artisanalHistory?.source === "manual"
            }
          />
        )}

        {/* Photo feedback (read-only) */}
        {improvements?.photo_feedback && (
          <PhotoFeedbackCard feedback={improvements.photo_feedback} />
        )}

        {/* Next step hint */}
        {oraculo?.next_step_hint && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1">
              Próximo paso
            </p>
            <p className="text-[11px] text-white/60 leading-snug">
              {oraculo.next_step_hint}
            </p>
          </div>
        )}
      </div>,
    );

    return clearNode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCallingAgent,
    agentResponse,
    state.fieldMetadata,
    // Note: handleAcceptSuggestion, handleRejectSuggestion, setNode, clearNode
    // are intentionally excluded to prevent infinite re-render loops
  ]);

  // Auto-call agent when all required fields are complete (with debounce)
  useEffect(() => {
    // Only proceed if all fields are complete, we have shopId, and agent hasn't responded yet
    if (
      !allFieldsComplete ||
      !shopId ||
      agentCallAttempted ||
      isCallingAgent ||
      agentCallCompleted
    ) {
      return;
    }

    // Debounce: wait 1.5 seconds after user stops typing
    const debounceTimer = setTimeout(() => {
      setAgentCallAttempted(true);
      setIsCallingAgent(true);

      const imageUrls = state.images.filter(
        (img): img is string => typeof img === "string",
      );

      const payload: Step1InitialCaptureRequest = {
        storeId: shopId,
        name: state.name.trim(),
        shortDescription: state.shortDescription.trim(),
        history: state.artisanalHistory?.trim() || "",
        status: "draft",
        media: imageUrls.map((url, index) => ({
          mediaUrl: url,
          mediaType: "image",
          isPrimary: index === 0,
          displayOrder: index,
        })),
        artisanalIdentity: {
          primaryCraftId:
            state.craftId || "00000000-0000-0000-0000-000000000000",
          isCollaboration: state.isCollaboration ?? false,
        },
      };

      step1InitialCapture(payload)
        .then((response) => {
          console.log("[Step1] Agent response:", response);
          setAgentResponse(response);
          setAgentCallCompleted(true);
          // Persist agent response to wizard state for backend storage
          update({ agentStep1Response: response });
        })
        .catch((error) => {
          console.error("[Step1] Error calling agent:", error);
          // Reset so user can try again
          setAgentCallAttempted(false);
        })
        .finally(() => {
          setIsCallingAgent(false);
        });
    }, 2000); // Wait 1.5 seconds after user stops typing

    // Cleanup: cancel timer if user keeps typing
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allFieldsComplete,
    shopId,
    agentCallAttempted,
    agentCallCompleted,
    isCallingAgent,
  ]);

  /**
   * Modification Detection: Detect when user edits an accepted AI suggestion
   * Changes state from 'ia_accepted' to 'ia_modified'
   *
   * IMPORTANT: Only depends on field VALUES, not on fieldMetadata itself.
   * This prevents unnecessary re-runs when accepting/rejecting suggestions.
   */
  useEffect(() => {
    // Check shortDescription
    const descMeta = state.fieldMetadata?.shortDescription;
    if (
      descMeta?.source === "ia_accepted" &&
      descMeta.originalAiValue &&
      state.shortDescription !== descMeta.originalAiValue
    ) {
      update({
        fieldMetadata: {
          ...state.fieldMetadata,
          shortDescription: {
            ...descMeta,
            source: "ia_modified" as const,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    // Check artisanalHistory
    const historyMeta = state.fieldMetadata?.artisanalHistory;
    if (
      historyMeta?.source === "ia_accepted" &&
      historyMeta.originalAiValue &&
      state.artisanalHistory !== historyMeta.originalAiValue
    ) {
      update({
        fieldMetadata: {
          ...state.fieldMetadata,
          artisanalHistory: {
            ...historyMeta,
            source: "ia_modified" as const,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.shortDescription, state.artisanalHistory]);

  const loadStories = () => {
    if (!artisanId || loadingStories) return;
    setLoadingStories(true);
    getStoriesByArtisan(artisanId)
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoadingStories(false));
  };

  const handleOpenPicker = () => {
    setShowPicker((v) => !v);
    if (!showPicker && stories.length === 0) loadStories();
  };

  const handleSelectStory = (story: Story) => {
    update({ artisanalHistory: story.content });
    setShowPicker(false);
  };

  const handleSaveStory = async () => {
    const content = (state.artisanalHistory ?? "").trim();
    if (!content || !saveTitle.trim() || !artisanId) return;
    setIsSavingStory(true);
    try {
      const saved = await createStory({
        artisanId,
        title: saveTitle.trim(),
        type: "origin_story",
        content,
        isPublic: false,
      });
      setStories((prev) => [saved, ...prev]);
      setSaveTitle("");
      setShowSaveDialog(false);
    } catch {
      toast.error("No se pudo guardar la historia. Intenta de nuevo.");
    } finally {
      setIsSavingStory(false);
    }
  };

  const makeToggleRecording =
    (
      field: "shortDescription" | "artisanalHistory",
      isRecording: boolean,
      setIsRecording: (v: boolean) => void,
      recognitionRef: React.MutableRefObject<any>,
    ) =>
    () => {
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        return;
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      const recognition = new SpeechRecognition();
      recognition.lang = "es-CO";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(
          event.results as SpeechRecognitionResultList,
        )
          .map((r: SpeechRecognitionResult) => r[0].transcript)
          .join("");
        update({ [field]: transcript });
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    };

  const toggleRecordingDesc = makeToggleRecording(
    "shortDescription",
    isRecordingDesc,
    setIsRecordingDesc,
    descRecognitionRef,
  );
  const toggleRecordingHistory = makeToggleRecording(
    "artisanalHistory",
    isRecordingHistory,
    setIsRecordingHistory,
    historyRecognitionRef,
  );

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mark slot as uploading
    setUploadingSlots((prev) => new Set(prev).add(index));

    try {
      // Upload to S3 immediately
      const [url] = await uploadImages([file]);

      // Update state with URL instead of File object
      const images = [...state.images];
      images[index] = url;
      update({ images });

      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("[Step1] Error uploading image:", error);
      toast.error("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      // Remove uploading status
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const images = [...state.images];
    const imageUrl = images[index];

    // If it's a URL (already uploaded to S3), delete it from S3
    if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      try {
        // await handleDeleteImage(imageUrl);
        toast.success("Imagen eliminada");
      } catch (error) {
        console.error("[Step1] Error deleting image from S3:", error);
        toast.error("No se pudo eliminar la imagen del servidor");
      }
    }

    // Remove from state
    images.splice(index, 1, undefined as unknown as File | string);
    while (images.length > 0 && !images[images.length - 1]) images.pop();
    update({ images });
  };

  const getPreviewUrl = (img: File | string | undefined): string | null => {
    if (!img) return null;
    return typeof img === "string" ? img : URL.createObjectURL(img);
  };

  /**
   * Handle next step - agent call happens automatically in useEffect
   * This just proceeds to the next step
   */
  const handleNext = () => {
    if (!attemptNext()) {
      toast.error("Completa los campos marcados en rojo");
      return;
    }

    if (!agentResponse) {
      toast.error(
        "Esperando análisis del agente. Por favor espera unos segundos.",
      );
      return;
    }

    // Log field metadata state for debugging
    console.log("[Step1] fieldMetadata state on next:", {
      shortDescription: state.fieldMetadata?.shortDescription ?? "no metadata",
      artisanalHistory: state.fieldMetadata?.artisanalHistory ?? "no metadata",
    });

    // All validation passed, proceed to next step
    onNext();
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.65)",
  } as const;

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <main className="w-full max-w-[1200px] mx-auto pt-4 md:pt-6 pb-[188px] md:pb-32 px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── AI sidebar ────────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-3">
            <div
              className="p-5 sticky top-8 flex flex-col gap-4 rounded-2xl"
              style={{ background: "#151b2d" }}
            >
              {/* Header */}
              <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">
                    psychology
                  </span>
                  <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                    ORÁCULO
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {agentResponse ? (
                    <>
                      <span className="material-symbols-outlined text-[#22c55e] text-[14px]">
                        check_circle
                      </span>
                      <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                        Análisis completado
                      </span>
                    </>
                  ) : isCallingAgent ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
                      <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                        Esperando respuesta por parte del agente...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse shrink-0" />
                      <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                        Esperando señales...
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* STATE: Loading */}
              {isCallingAgent && !agentResponse && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin mb-3" />
                  <p className="text-[11px] text-white/60">
                    Analizando contenido...
                  </p>
                </div>
              )}

              {/* STATE: Suggestions available */}
              {agentResponse && (
                <>
                  {/* Oraculo message */}
                  {agentResponse.oraculo && (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: "rgba(236,109,19,0.1)",
                        border: "1px solid rgba(236,109,19,0.2)",
                      }}
                    >
                      <p className="text-[11px] font-[800] text-[#ec6d13] mb-1">
                        {agentResponse.oraculo.title}
                      </p>
                      <p className="text-[12px] text-white/75 leading-snug">
                        {agentResponse.oraculo.body}
                      </p>
                    </div>
                  )}

                  {/* Improved description suggestion */}
                  {agentResponse.content_improvements?.improved_description && (
                    <SuggestionCard
                      label="Descripción sugerida"
                      suggestion={
                        agentResponse.content_improvements.improved_description
                      }
                      fieldKey="shortDescription"
                      onAccept={handleAcceptSuggestion}
                      onReject={handleRejectSuggestion}
                      isAccepted={
                        state.fieldMetadata?.shortDescription?.source ===
                        "ia_accepted"
                      }
                      isRejected={
                        state.fieldMetadata?.shortDescription?.source ===
                        "manual"
                      }
                    />
                  )}

                  {/* Improved history suggestion */}
                  {agentResponse.content_improvements?.improved_history && (
                    <SuggestionCard
                      label="Historia sugerida"
                      suggestion={
                        agentResponse.content_improvements.improved_history
                      }
                      fieldKey="artisanalHistory"
                      onAccept={handleAcceptSuggestion}
                      onReject={handleRejectSuggestion}
                      isAccepted={
                        state.fieldMetadata?.artisanalHistory?.source ===
                        "ia_accepted"
                      }
                      isRejected={
                        state.fieldMetadata?.artisanalHistory?.source ===
                        "manual"
                      }
                    />
                  )}

                  {/* Photo feedback (read-only) */}
                  {agentResponse.content_improvements?.photo_feedback && (
                    <PhotoFeedbackCard
                      feedback={
                        agentResponse.content_improvements.photo_feedback
                      }
                    />
                  )}

                  {/* Next step hint */}
                  {agentResponse.oraculo?.next_step_hint && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1">
                        Próximo paso
                      </p>
                      <p className="text-[11px] text-white/60 leading-snug">
                        {agentResponse.oraculo.next_step_hint}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STATE: Default waiting */}
              {!isCallingAgent && !agentResponse && (
                <>
                  {[
                    {
                      label: "Lectura visual",
                      text: "Esperando foto principal para analizar forma, textura, iluminación y fondo.",
                    },
                    {
                      label: "Historia detectada",
                      text: "Agrega una historia o dictá tu proceso para que TELAR entienda el valor cultural de tu pieza.",
                    },
                    {
                      label: "Próximo paso",
                      text: "Con el nombre, la descripción y la historia, TELAR podrá ayudarte a completar identidad, técnica y categoría en el paso 2.",
                    },
                  ].map(({ label, text }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
                        {label}
                      </p>
                      <p className="text-[12px] text-white/75 leading-snug">
                        {text}
                      </p>
                    </div>
                  ))}
                  <p className="text-center text-[9px] font-[800] uppercase tracking-widest text-white/25 pt-2 border-t border-white/10">
                    Las sugerencias aparecen al agregar foto, descripción o
                    historia.
                  </p>
                </>
              )}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <section className="lg:col-span-9 space-y-4">
            {/* Name */}
            <div
              id="wizard-field-name"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
                Nombre de la pieza
                <RequiredMark />
              </label>
              <input
                type="text"
                value={state.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ej. Vasija de barro, bolso tejido, collar en chaquira..."
                className={`w-full rounded-lg px-4 py-3 font-['Noto_Serif'] text-[22px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 cursor-text transition-all hover:border-[#e2d5cf]/70 ${fieldError("name") ? fieldErrorClass : ""}`}
                style={{ background: "rgba(247,244,239,0.4)" }}
              />
              {fieldError("name") && <FieldErrorMessage />}
            </div>

            {/* Image gallery */}
            <div
              id="wizard-field-mainPhoto"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
                Registro Visual
                <RequiredMark />
              </label>

              {/* Mobile: tira horizontal scrollable */}
              <div
                className={`md:hidden ${fieldError("mainPhoto") ? "rounded-xl ring-2 ring-[#ef4444]/60" : ""}`}
              >
                <MobileImageStrip
                  images={state.images}
                  fileInputRefs={fileInputRefs}
                  onFileChange={handleFileChange}
                  onDelete={handleDeleteImage}
                  getPreviewUrl={getPreviewUrl}
                  uploadingSlots={uploadingSlots}
                />
              </div>

              {/* Desktop: grid de slots original */}
              <div className="hidden md:flex gap-3">
                <div
                  className={`flex-1 min-w-0 ${fieldError("mainPhoto") ? "rounded-2xl ring-2 ring-[#ef4444]/60" : ""}`}
                >
                  <ImageSlot
                    slot={IMAGE_SLOTS[0]}
                    preview={getPreviewUrl(state.images[0])}
                    inputRef={(el) => {
                      fileInputRefs.current[0] = el;
                    }}
                    onFileChange={(e) => handleFileChange(e, 0)}
                    onDelete={(e) => handleDeleteImage(0, e)}
                    height="h-full min-h-[270px]"
                    isUploading={uploadingSlots.has(0)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 w-[45%] shrink-0">
                  {IMAGE_SLOTS.slice(1).map((slot) => (
                    <ImageSlot
                      key={slot.index}
                      slot={slot}
                      preview={getPreviewUrl(state.images[slot.index])}
                      inputRef={(el) => {
                        fileInputRefs.current[slot.index] = el;
                      }}
                      onFileChange={(e) => handleFileChange(e, slot.index)}
                      onDelete={(e) => handleDeleteImage(slot.index, e)}
                      height="h-[130px]"
                      small
                      isUploading={uploadingSlots.has(slot.index)}
                    />
                  ))}
                </div>
              </div>
              {fieldError("mainPhoto") && (
                <FieldErrorMessage message="Sube la foto principal de la pieza" />
              )}
            </div>

            {/* Description */}
            <div
              id="wizard-field-shortDescription"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
                  Descripción breve
                  <RequiredMark />
                </label>
                <span className="text-[11px] text-[#54433e]/40">
                  Lo que verá el comprador en la tienda
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={state.shortDescription}
                  onChange={(e) => update({ shortDescription: e.target.value })}
                  placeholder="Cuéntanos brevemente qué es esta pieza, cómo está hecha o para qué sirve."
                  rows={4}
                  className={`w-full border border-[#e2d5cf]/40 p-4 pr-14 text-[14px] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70 ${fieldError("shortDescription") ? fieldErrorClass : ""}`}
                  style={{ background: "rgba(247,244,239,0.4)" }}
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleRecordingDesc}
                    title={
                      isRecordingDesc ? "Detener dictado" : "Dictar descripción"
                    }
                    className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                      isRecordingDesc
                        ? "bg-[#ef4444] text-white shadow-md animate-pulse"
                        : "bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isRecordingDesc ? "stop" : "mic"}
                    </span>
                  </button>
                )}
                {isRecordingDesc && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                    <span className="text-[10px] text-[#ef4444] font-[700]">
                      Escuchando
                    </span>
                  </div>
                )}
              </div>
              {fieldError("shortDescription") && <FieldErrorMessage />}
            </div>

            {/* Historia y contexto */}
            <div
              id="wizard-field-artisanalHistory"
              className="p-5 rounded-2xl"
              style={cardStyle}
            >
              <div className="flex items-center justify-between mb-1">
                <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60">
                  Historia y contexto
                  <RequiredMark />
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/40 leading-snug mb-3">
                No es la descripción del producto — es el origen. ¿De quién
                aprendiste? ¿Qué representa esta pieza para tu comunidad? Esta
                historia aparece en el pasaporte digital de la obra.
              </p>
              <div className="relative">
                <textarea
                  value={state.artisanalHistory ?? ""}
                  onChange={(e) => update({ artisanalHistory: e.target.value })}
                  placeholder="¿Qué historia guarda esta pieza? ¿Cómo llegó esta técnica a tus manos? ¿Qué representa para tu comunidad o para ti?"
                  rows={4}
                  className={`w-full border border-[#e2d5cf]/30 p-4 pr-14 text-[13px] text-[#151b2d] font-[500] resize-none focus:outline-none focus:ring-1 focus:ring-[#ec6d13]/30 focus:border-[#ec6d13]/20 rounded-lg transition-colors hover:border-[#e2d5cf]/60 ${fieldError("artisanalHistory") ? fieldErrorClass : ""}`}
                  style={{ background: "rgba(247,244,239,0.5)" }}
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleRecordingHistory}
                    title={
                      isRecordingHistory ? "Detener dictado" : "Dictar historia"
                    }
                    className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                      isRecordingHistory
                        ? "bg-[#ef4444] text-white shadow-md animate-pulse"
                        : "bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isRecordingHistory ? "stop" : "mic"}
                    </span>
                  </button>
                )}
                {isRecordingHistory && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                    <span className="text-[10px] text-[#ef4444] font-[700]">
                      Escuchando
                    </span>
                  </div>
                )}
              </div>

              {fieldError("artisanalHistory") && <FieldErrorMessage />}

              {/* ── Story library actions ───────────────────────────────── */}

              {/* Save dialog */}

              {/* Story picker */}
            </div>

            <MissingFieldsBanner missing={missing} />
          </section>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={
          isCallingAgent || (allFieldsComplete && agentResponse === null)
        }
        disabledReason={
          isCallingAgent
            ? "Procesando información con IA..."
            : allFieldsComplete && agentResponse === null
              ? "Esperando respuesta del agente..."
              : undefined
        }
        leftOffset={leftOffset}
      />
    </div>
  );
};

// ── ImageSlot ──────────────────────────────────────────────────────────────────

interface ImageSlotProps {
  slot: (typeof IMAGE_SLOTS)[number];
  preview: string | null;
  inputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (e: React.MouseEvent) => void;
  height: string;
  small?: boolean;
  isUploading?: boolean;
}

const ImageSlot: React.FC<ImageSlotProps> = ({
  slot,
  preview,
  inputRef,
  onFileChange,
  onDelete,
  height,
  small,
  isUploading = false,
}) => {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const handleClick = () => {
    if (!isUploading) inputEl.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center border border-[#e2d5cf]/40 ${isUploading ? "cursor-wait" : "cursor-pointer"} overflow-hidden rounded-lg ${height} group transition-all hover:border-[#ec6d13]/30 hover:shadow-sm`}
      style={{ background: "#ffffff" }}
    >
      {isUploading ? (
        /* Loading state */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
          <div className="w-8 h-8 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin mb-2" />
          <span className="text-[11px] font-[700] text-[#54433e]/60">
            Subiendo...
          </span>
        </div>
      ) : preview ? (
        <>
          <img
            src={preview}
            className="w-full h-full object-cover"
            alt={slot.label}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onDelete}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-[#ef4444] hover:text-white text-[#54433e] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
            </button>
            <span className="text-white text-[10px] font-[700] uppercase tracking-widest">
              Cambiar foto
            </span>
          </div>
        </>
      ) : (
        <>
          <span
            className={`material-symbols-outlined ${small ? "text-2xl" : "text-4xl"} text-[#54433e]/25 mb-1.5 group-hover:scale-110 group-hover:text-[#ec6d13] transition-all`}
          >
            {slot.icon}
          </span>
          <span
            className={`${small ? "text-[10px]" : "text-[13px]"} font-[800] uppercase tracking-widest text-[#54433e]/60 mb-0.5 text-center px-2`}
          >
            {slot.label}
          </span>
          <span
            className={`${small ? "text-[10px]" : "text-[11px]"} text-[#54433e]/35 leading-tight text-center px-3`}
          >
            {slot.hint}
          </span>
          {"required" in slot && slot.required && (
            <div className="absolute bottom-3 left-0 w-full flex justify-center">
              <span className="text-[10px] font-[800] uppercase tracking-widest text-[#ef4444]/70">
                Obligatoria
              </span>
            </div>
          )}
        </>
      )}
      <input
        ref={(el) => {
          inputEl.current = el;
          inputRef(el);
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

// ── MobileImageStrip ───────────────────────────────────────────────────────────

interface MobileImageStripProps {
  images: NewWizardState["images"];
  fileInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
  getPreviewUrl: (img: File | string | undefined) => string | null;
  uploadingSlots: Set<number>;
}

const MobileImageStrip: React.FC<MobileImageStripProps> = ({
  images,
  fileInputRefs,
  onFileChange,
  onDelete,
  getPreviewUrl,
  uploadingSlots,
}) => (
  <div
    className="flex gap-3 overflow-x-auto pb-1"
    style={{ WebkitOverflowScrolling: "touch" as any }}
  >
    {IMAGE_SLOTS.map((slot) => {
      const preview = getPreviewUrl(images[slot.index]);
      const isUploading = uploadingSlots.has(slot.index);
      return (
        <div
          key={slot.index}
          className="flex-shrink-0 flex flex-col items-center gap-1.5"
        >
          {/* Slot cuadrado */}
          <div
            onClick={() =>
              !isUploading && fileInputRefs.current[slot.index]?.click()
            }
            className={`relative w-[80px] h-[80px] rounded-xl border border-[#e2d5cf]/50 ${isUploading ? "cursor-wait" : "cursor-pointer"} overflow-hidden flex flex-col items-center justify-center transition-all active:border-[#ec6d13]/50 active:scale-95`}
            style={{
              background: preview ? undefined : "rgba(255,255,255,0.8)",
            }}
          >
            {isUploading ? (
              /* Loading state */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
                <div className="w-6 h-6 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin" />
              </div>
            ) : preview ? (
              <>
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt={slot.label}
                />
                <button
                  type="button"
                  onClick={(e) => onDelete(slot.index, e)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: 12 }}
                  >
                    close
                  </span>
                </button>
              </>
            ) : (
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ color: "rgba(84,67,62,0.28)" }}
              >
                {slot.icon}
              </span>
            )}
            <input
              ref={(el) => {
                fileInputRefs.current[slot.index] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileChange(e, slot.index)}
            />
          </div>
          {/* Label del slot */}
          <span
            className="text-[9px] font-['Manrope'] font-[800] uppercase tracking-wider text-center leading-tight"
            style={{ color: "rgba(84,67,62,0.5)", width: 80 }}
          >
            {slot.label}
          </span>
        </div>
      );
    })}
  </div>
);

// ── SuggestionCard ─────────────────────────────────────────────────────────────

interface SuggestionCardProps {
  label: string;
  suggestion: ContentImprovement;
  fieldKey: "shortDescription" | "artisanalHistory";
  onAccept: (field: string, value: string) => void;
  onReject: (field: string) => void;
  isAccepted: boolean;
  isRejected: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  label,
  suggestion,
  fieldKey,
  onAccept,
  onReject,
  isAccepted,
  isRejected,
}) => {
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: isAccepted
          ? "rgba(34,197,94,0.05)"
          : "rgba(255,255,255,0.05)",
        border: isAccepted
          ? "1px solid rgba(34,197,94,0.2)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
        {label}
      </p>
      <p className="text-[12px] text-white/85 leading-snug mb-3">
        {suggestion.value}
      </p>

      {/* Status indicators */}
      {isAccepted && (
        <div className="flex items-center gap-1 text-[10px] text-green-400 mb-2">
          <span className="material-symbols-outlined text-[14px]">
            check_circle
          </span>
          <span>Sugerencia aceptada</span>
        </div>
      )}

      {isRejected && (
        <div className="flex items-center gap-1 text-[10px] text-white/40 mb-2">
          <span className="material-symbols-outlined text-[14px]">cancel</span>
          <span>Sugerencia rechazada</span>
        </div>
      )}

      {/* Action buttons */}
      {!isAccepted && !isRejected && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(fieldKey, suggestion.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[#ec6d13] text-white text-[10px] font-[800] uppercase tracking-widest hover:bg-[#d4600f] transition-all"
          >
            Aceptar
          </button>
          <button
            onClick={() => onReject(fieldKey)}
            className="px-3 py-2 rounded-lg border border-white/20 text-white/60 text-[10px] font-[700] hover:text-white hover:border-white/40 transition-all"
          >
            Rechazar
          </button>
        </div>
      )}

      {/* Changes summary */}
      {suggestion.changes_summary && (
        <p className="text-[10px] text-white/30 mt-2 leading-snug">
          {suggestion.changes_summary}
        </p>
      )}
    </div>
  );
};

// ── PhotoFeedbackCard ──────────────────────────────────────────────────────────

interface PhotoFeedbackCardProps {
  feedback: PhotoFeedback;
}

const PhotoFeedbackCard: React.FC<PhotoFeedbackCardProps> = ({ feedback }) => {
  const mainPhoto = feedback.main_photo;
  if (!mainPhoto) return null;

  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
        Análisis de foto principal
      </p>

      {/* Quality indicator with colored icon */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols-outlined text-[16px]"
          style={{
            color:
              mainPhoto.quality === "excellent" ||
              mainPhoto.quality === "excelente"
                ? "#22c55e"
                : mainPhoto.quality === "good" || mainPhoto.quality === "buena"
                  ? "#eab308"
                  : "#ef4444",
          }}
        >
          {mainPhoto.quality === "excellent" ||
          mainPhoto.quality === "excelente"
            ? "verified"
            : mainPhoto.quality === "good" || mainPhoto.quality === "buena"
              ? "info"
              : "warning"}
        </span>
        <span className="text-[11px] text-white/70 capitalize">
          {mainPhoto.quality === "excellent" ||
          mainPhoto.quality === "excelente"
            ? "Excelente"
            : mainPhoto.quality === "good" || mainPhoto.quality === "buena"
              ? "Buena"
              : "Mejorable"}
        </span>
      </div>

      {/* Highlights with green bullets */}
      {mainPhoto.highlights && mainPhoto.highlights.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] font-[700] uppercase text-white/50 mb-1">
            Aspectos positivos
          </p>
          <ul className="space-y-1">
            {mainPhoto.highlights.map((h, i) => (
              <li
                key={i}
                className="text-[11px] text-white/60 leading-snug flex gap-1.5"
              >
                <span className="text-green-400">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions with yellow bullets */}
      {mainPhoto.suggestions && mainPhoto.suggestions.length > 0 && (
        <div>
          <p className="text-[9px] font-[700] uppercase text-white/50 mb-1">
            Sugerencias
          </p>
          <ul className="space-y-1">
            {mainPhoto.suggestions.map((s, i) => (
              <li
                key={i}
                className="text-[11px] text-white/60 leading-snug flex gap-1.5"
              >
                <span className="text-yellow-400">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
