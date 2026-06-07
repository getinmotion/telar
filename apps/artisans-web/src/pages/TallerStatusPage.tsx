import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  getArtisansKnowledgeProfile,
  checkProfileCompletion,
} from "@/services/artisansKnowledge.actions";
import type { ArtisansIdentityProfile } from "@/types/artisansKnowledge.types";

const SANS = "'Manrope', sans-serif";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.65)",
  boxShadow: "0 2px 10px -2px rgba(0,0,0,0.05)",
};

// ─── AnswerItem ───────────────────────────────────────────────────────────────

const AnswerItem: React.FC<{ question: string; answer: string | null | undefined }> = ({
  question,
  answer,
}) => (
  <div className="py-3 border-b border-[#e2d5cf]/30 last:border-0">
    <p
      style={{
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "rgba(84,67,62,0.5)",
        marginBottom: 4,
      }}
    >
      {question}
    </p>
    {answer ? (
      <p
        style={{
          fontFamily: SANS,
          fontSize: 13,
          color: "#151b2d",
          lineHeight: 1.5,
        }}
      >
        {answer}
      </p>
    ) : (
      <p
        style={{
          fontFamily: SANS,
          fontSize: 13,
          color: "rgba(84,67,62,0.35)",
          fontStyle: "italic",
        }}
      >
        Sin respuesta
      </p>
    )}
  </div>
);

// ─── TallerBlockCard ──────────────────────────────────────────────────────────

const TallerBlockCard: React.FC<{
  title: string;
  description: string;
  items: { question: string; answer: string | null | undefined }[];
  isComplete: boolean;
}> = ({ title, description, items, isComplete }) => (
  <div className="rounded-2xl p-6" style={glassCard}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0 pr-3">
        <p
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(236,109,19,0.7)",
            marginBottom: 4,
          }}
        >
          Diagnóstico
        </p>
        <h3
          style={{
            fontFamily: SANS,
            fontSize: 17,
            fontWeight: 800,
            color: "#151b2d",
            marginBottom: 6,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: "rgba(84,67,62,0.6)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
      <div
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: isComplete ? "rgba(34,197,94,0.08)" : "rgba(84,67,62,0.06)",
          border: `1px solid ${isComplete ? "rgba(34,197,94,0.2)" : "rgba(84,67,62,0.12)"}`,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 13,
            color: isComplete ? "#16a34a" : "rgba(84,67,62,0.4)",
          }}
        >
          {isComplete ? "check_circle" : "radio_button_unchecked"}
        </span>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            color: isComplete ? "#16a34a" : "rgba(84,67,62,0.45)",
          }}
        >
          {isComplete ? "Completo" : "Pendiente"}
        </span>
      </div>
    </div>

    <div className="mt-4">
      {items.map((item) => (
        <AnswerItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  </div>
);

// ─── TallerComingSoonCard ─────────────────────────────────────────────────────

const TallerComingSoonCard: React.FC<{
  title: string;
  description?: string;
  reason: "pending" | "coming_soon";
  onGoToForm?: () => void;
}> = ({ title, description, reason, onGoToForm }) => (
  <div
    className="rounded-2xl p-6 flex flex-col gap-3"
    style={{
      background: "rgba(255,255,255,0.45)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.5)",
      boxShadow: "0 1px 6px -1px rgba(0,0,0,0.03)",
    }}
  >
    <div className="flex items-center justify-between">
      <h3
        style={{
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 700,
          color: reason === "coming_soon" ? "rgba(84,67,62,0.4)" : "rgba(21,27,45,0.6)",
        }}
      >
        {title}
      </h3>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
        style={{
          background: reason === "coming_soon" ? "rgba(84,67,62,0.05)" : "rgba(236,109,19,0.06)",
          border: `1px solid ${reason === "coming_soon" ? "rgba(84,67,62,0.1)" : "rgba(236,109,19,0.15)"}`,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 12,
            color: reason === "coming_soon" ? "rgba(84,67,62,0.35)" : "rgba(236,109,19,0.6)",
          }}
        >
          {reason === "coming_soon" ? "schedule" : "lock"}
        </span>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            color: reason === "coming_soon" ? "rgba(84,67,62,0.4)" : "rgba(236,109,19,0.7)",
          }}
        >
          {reason === "coming_soon" ? "Próximamente" : "Sin completar"}
        </span>
      </div>
    </div>

    {description && (
      <p
        style={{
          fontFamily: SANS,
          fontSize: 12,
          color: "rgba(84,67,62,0.45)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    )}

    {reason === "pending" && onGoToForm && (
      <button
        type="button"
        onClick={onGoToForm}
        className="flex items-center gap-1.5 mt-1 group w-fit"
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            color: "#ec6d13",
          }}
          className="group-hover:underline underline-offset-2"
        >
          Completar diagnóstico
        </span>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 14, color: "#ec6d13" }}
        >
          arrow_forward
        </span>
      </button>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TallerStatusPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ArtisansIdentityProfile | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getArtisansKnowledgeProfile(user.id)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f9f7f2" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#ec6d13]/20 border-t-[#ec6d13] animate-spin mx-auto mb-3" />
          <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(84,67,62,0.5)" }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  const completion = checkProfileCompletion(profile);
  const commercial = profile?.commercialTwo;

  return (
    <div
      className="min-h-screen pb-32 md:pb-12"
      style={{ background: "#f9f7f2" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 border-b border-[#e2d5cf]/30 px-4 py-4"
        style={{
          background: "rgba(249,247,242,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(236,109,19,0.1)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: "#ec6d13" }}
            >
              monitoring
            </span>
          </div>
          <div>
            <h1
              style={{
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 800,
                color: "#151b2d",
                lineHeight: 1.2,
              }}
            >
              Estado de tu Taller
            </h1>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: "rgba(84,67,62,0.5)",
                lineHeight: 1,
              }}
            >
              Diagnóstico inicial · {completion.completedSteps} de 4 bloques completados
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 pt-8">

        {/* Descripción */}
        <div className="mb-8">
          <p
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: "rgba(84,67,62,0.65)",
              lineHeight: 1.6,
              maxWidth: 560,
            }}
          >
            Aquí puedes ver el estado actual de tu taller según la información que compartiste en el diagnóstico inicial. Esta información nos ayuda a acompañarte mejor y proponerte misiones útiles.
          </p>
          {!completion.isComplete && (
            <button
              type="button"
              onClick={() => navigate("/growth/agent-form")}
              className="mt-3 flex items-center gap-1.5 group"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14, color: "#ec6d13" }}
              >
                edit_note
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#ec6d13",
                }}
                className="group-hover:underline underline-offset-2"
              >
                Completar diagnóstico ({4 - completion.completedSteps} bloque
                {4 - completion.completedSteps !== 1 ? "s" : ""} pendiente
                {4 - completion.completedSteps !== 1 ? "s" : ""})
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">

          {/* Bloque 2 — Realidad Comercial */}
          {completion.step2Complete && commercial ? (
            <TallerBlockCard
              title="Realidad Comercial"
              description="Cómo funciona hoy la parte comercial de tu taller: precios, costos y claridad sobre ganancias."
              isComplete={completion.step2Complete}
              items={[
                {
                  question: "¿En qué rango de precio vendes la mayoría de tus productos?",
                  answer: commercial.shopRangePayment,
                },
                {
                  question: "Cuando pones precio a tus productos, ¿cómo lo haces normalmente?",
                  answer: commercial.shopKnowledgeCost,
                },
                {
                  question: "¿Qué tan claro tienes cuánto te cuesta hacer cada producto?",
                  answer: commercial.shopKnowledgeDefineCost,
                },
                {
                  question: "¿Qué tan claro tienes si tu taller realmente genera ganancias?",
                  answer: commercial.shopKnowledgeIsProfitable,
                },
              ]}
            />
          ) : (
            <TallerComingSoonCard
              title="Realidad Comercial"
              description="Aún no has completado el bloque de información comercial de tu diagnóstico."
              reason="pending"
              onGoToForm={() => navigate("/growth/agent-form")}
            />
          )}

          {/* Próximos bloques — grid 2 col en lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TallerComingSoonCard
              title="Clientes y Mercado"
              description="Quiénes compran tu trabajo y dónde vendes hoy."
              reason="pending"
              onGoToForm={() => navigate("/growth/agent-form")}
            />
            <TallerComingSoonCard
              title="Operaciones y Crecimiento"
              description="Capacidad productiva, limitaciones actuales y primeros pasos."
              reason="pending"
              onGoToForm={() => navigate("/growth/agent-form")}
            />
          </div>

          {/* Coming soon */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <TallerComingSoonCard
              title="Indicadores"
              description="Métricas clave de tu taller calculadas a partir de tu diagnóstico."
              reason="coming_soon"
            />
            <TallerComingSoonCard
              title="Recomendaciones Inteligentes"
              description="Sugerencias personalizadas basadas en tu realidad y tus metas."
              reason="coming_soon"
            />
            <TallerComingSoonCard
              title="Evolución de tu Taller"
              description="Comparación entre tu diagnóstico inicial y tu estado actual."
              reason="coming_soon"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default TallerStatusPage;
