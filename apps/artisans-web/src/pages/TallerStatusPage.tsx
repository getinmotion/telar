import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  getArtisansKnowledgeProfile,
  checkProfileCompletion,
} from "@/services/artisansKnowledge.actions";
import type { ArtisansIdentityProfile } from "@/types/artisansKnowledge.types";
import { useOraculo } from "@/components/oraculo/OraculoContext";

const SERIF = "'Noto Serif', serif";
const SANS = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.65)",
  boxShadow: "0 4px 20px rgba(21,27,45,0.02)",
};

// ─── MetricCard ────────────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: string;
  mobileValue?: React.ReactNode;
  mobileIconColor?: string;
}> = ({ label, value, sub, icon, mobileValue, mobileIconColor }) => (
  <>
    <div
      className="md:hidden flex flex-col items-center justify-center gap-1 py-3 px-1 text-center"
      style={{ ...glassPrimary, borderRadius: 14, minHeight: 76 }}
    >
      <span className="material-symbols-outlined" style={{ color: mobileIconColor ?? "rgba(21,27,45,0.22)", fontSize: 22 }}>{icon}</span>
      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#151b2d", lineHeight: 1 }}>
        {mobileValue ?? value}
      </div>
      <span style={{ fontFamily: SANS, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(84,67,62,0.45)", lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
    <div style={{ ...glassPrimary, borderRadius: 16 }} className="hidden md:flex px-5 h-16 items-center gap-4">
      <span className="material-symbols-outlined shrink-0" style={{ color: "rgba(21,27,45,0.18)", fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "rgba(84,67,62,0.45)" }}>{label}</span>
        <p style={{ fontFamily: SANS, fontSize: 9, color: "rgba(84,67,62,0.35)", marginTop: 1 }}>{sub}</p>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#151b2d", lineHeight: 1, flexShrink: 0 }}>{value}</div>
    </div>
  </>
);

// ─── OraculoTaller ─────────────────────────────────────────────────────────────

type TallerInsight = { message: string; sub: string; cta: string };

const OraculoTaller: React.FC<{ insight: TallerInsight; onGoForm: () => void }> = ({ insight, onGoForm }) => {
  const { setNode, clearNode } = useOraculo();
  useEffect(() => {
    setNode(
      <div className="p-7 rounded-3xl relative overflow-hidden" style={{ background: "#151b2d" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(236,109,19,0.1)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(236,109,19,0.05)", filter: "blur(35px)", pointerEvents: "none" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(236,109,19,0.15)", border: "1px solid rgba(236,109,19,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#ec6d13" }}>smart_toy</span>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>ORÁCULO</span>
          </div>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 10, lineHeight: 1.35 }}>{insight.message}</h3>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 22 }}>{insight.sub}</p>
          <button
            type="button"
            onClick={onGoForm}
            className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-full transition-all hover:opacity-90"
            style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
          >
            {insight.cta}
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
          </button>
        </div>
      </div>
    );
    return clearNode;
  }, [insight.message]);
  return null;
};

// ─── AnswerRow ─────────────────────────────────────────────────────────────────

const AnswerRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div className="py-2.5 border-b border-[#e2d5cf]/30 last:border-0">
    <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(84,67,62,0.4)", marginBottom: 3 }}>{label}</p>
    {value ? (
      <p style={{ fontFamily: SANS, fontSize: 12, color: "#151b2d", lineHeight: 1.5 }}>{String(value)}</p>
    ) : (
      <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(84,67,62,0.3)", fontStyle: "italic" }}>Sin respuesta</p>
    )}
  </div>
);

// ─── DiagBlock (completo) ──────────────────────────────────────────────────────

const DiagBlock: React.FC<{
  icon: string;
  title: string;
  items: { label: string; value: string | number | null | undefined }[];
}> = ({ icon, title, items }) => (
  <div className="rounded-2xl p-5" style={glassPrimary}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(236,109,19,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ec6d13" }}>{icon}</span>
        </div>
        <h3 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: "#151b2d" }}>{title}</h3>
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, background: "rgba(22,101,52,0.08)", border: "1px solid rgba(22,101,52,0.15)", fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#166534" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>check_circle</span>
        Completo
      </span>
    </div>
    <div>
      {items.map((item) => <AnswerRow key={item.label} label={item.label} value={item.value} />)}
    </div>
  </div>
);

// ─── PendingBlock ──────────────────────────────────────────────────────────────

const PendingBlock: React.FC<{
  icon: string;
  title: string;
  description: string;
  onComplete: () => void;
}> = ({ icon, title, description, onComplete }) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-3"
    style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 1px 8px rgba(21,27,45,0.02)" }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(84,67,62,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(84,67,62,0.35)" }}>{icon}</span>
        </div>
        <h3 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "rgba(21,27,45,0.55)" }}>{title}</h3>
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, background: "rgba(236,109,19,0.06)", border: "1px solid rgba(236,109,19,0.12)", fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(236,109,19,0.7)", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>lock</span>
        Pendiente
      </span>
    </div>
    <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(84,67,62,0.5)", lineHeight: 1.55 }}>{description}</p>
    <button type="button" onClick={onComplete} className="flex items-center gap-1.5 w-fit group">
      <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#ec6d13" }}>edit_note</span>
      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#ec6d13" }} className="group-hover:underline underline-offset-2">
        Completar ahora
      </span>
    </button>
  </div>
);

// ─── ComingSoonBlock ───────────────────────────────────────────────────────────

const ComingSoonBlock: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.4)" }}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "rgba(84,67,62,0.25)" }}>{icon}</span>
        <h3 style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "rgba(21,27,45,0.35)" }}>{title}</h3>
      </div>
      <span style={{ padding: "2px 8px", borderRadius: 9999, background: "rgba(84,67,62,0.04)", fontFamily: SANS, fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(84,67,62,0.3)" }}>
        Próximamente
      </span>
    </div>
    <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(84,67,62,0.35)", lineHeight: 1.5 }}>{description}</p>
  </div>
);

// ─── MisionesPanel (right sidebar) ────────────────────────────────────────────

const VISIBLE_TOTAL = 3;

const MisionesPanel: React.FC<{ completedSteps: number; onGoForm: () => void }> = ({ completedSteps, onGoForm }) => {
  const isComplete = completedSteps === VISIBLE_TOTAL;
  const pct = Math.round((completedSteps / VISIBLE_TOTAL) * 100);
  return (
    <div style={{ position: "sticky", top: 24 }} className="flex flex-col gap-4">

      {/* Misiones card */}
      <div className="rounded-3xl p-5 flex flex-col gap-4" style={glassPrimary}>
        <div className="flex items-center gap-2.5">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(21,27,45,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#151b2d" }}>rocket_launch</span>
          </div>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(84,67,62,0.4)" }}>Conectado con</p>
            <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#151b2d" }}>Misiones</h3>
          </div>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(84,67,62,0.55)", lineHeight: 1.65 }}>
          Con tu diagnóstico completo, el ORÁCULO te asignará misiones personalizadas para hacer crecer tu taller paso a paso.
        </p>

        {/* Progress bar */}
        <div style={{ borderRadius: 12, padding: "12px 14px", background: "rgba(21,27,45,0.03)", border: "1px solid rgba(21,27,45,0.05)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: "rgba(84,67,62,0.5)" }}>Diagnóstico completado</span>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: isComplete ? "#166534" : "#ec6d13" }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: "rgba(21,27,45,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 9999, background: isComplete ? "#166534" : "#ec6d13", width: `${pct}%`, transition: "width 0.5s ease" }} />
          </div>
          <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(84,67,62,0.4)", marginTop: 6 }}>
            {completedSteps} de {VISIBLE_TOTAL} bloques · {isComplete ? "listo para misiones" : `faltan ${VISIBLE_TOTAL - completedSteps}`}
          </p>
        </div>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 9999, background: "rgba(84,67,62,0.04)", border: "1px solid rgba(84,67,62,0.08)", fontFamily: SANS, fontSize: 10, fontWeight: 700, color: "rgba(84,67,62,0.4)", width: "fit-content" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
          Próximamente
        </span>
      </div>

      {/* CTA card: only if incomplete */}
      {!isComplete && (
        <div className="rounded-2xl px-5 py-4" style={{ background: "rgba(236,109,19,0.06)", border: "1px solid rgba(236,109,19,0.12)" }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(236,109,19,0.6)", marginBottom: 6 }}>Siguiente paso</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: "#151b2d", lineHeight: 1.5, marginBottom: 14 }}>
            {completedSteps === 0
              ? "Comienza tu diagnóstico para que el ORÁCULO pueda orientarte."
              : `Te ${VISIBLE_TOTAL - completedSteps === 1 ? "falta" : "faltan"} ${VISIBLE_TOTAL - completedSteps} bloque${VISIBLE_TOTAL - completedSteps !== 1 ? "s" : ""} para completar tu diagnóstico.`}
          </p>
          <button
            type="button"
            onClick={onGoForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
          >
            Continuar diagnóstico
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>east</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

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

  const goToForm = () => navigate("/growth/agent-form");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9f7f2" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#ec6d13]/20 border-t-[#ec6d13] animate-spin mx-auto mb-3" />
          <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(84,67,62,0.5)" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  const completion = checkProfileCompletion(profile);
  const { step2Complete, step3Complete, step4Complete } = completion;
  // Identidad (step1) es automática — solo mostramos los 3 bloques visibles
  const visibleCompleted = [step2Complete, step3Complete, step4Complete].filter(Boolean).length;
  const isComplete = visibleCompleted === VISIBLE_TOTAL;
  const pct = Math.round((visibleCompleted / VISIBLE_TOTAL) * 100);

  const commercial = profile?.commercialTwo;
  const clientMarket = profile?.clientMarketThree;
  const operations = profile?.operationGrowthFour;

  // Oráculo insight — progresa con cada bloque completado
  const insights: TallerInsight[] = [
    { message: "¿Cómo va la parte comercial?", sub: "Entender tus precios y costos nos permite sugerirte las misiones correctas.", cta: "Continuar diagnóstico" },
    { message: "Cuéntanos sobre tus clientes.", sub: "¿Quién compra tu trabajo? Conocer tu mercado abre las misiones más precisas.", cta: "Continuar diagnóstico" },
    { message: "Un último bloque.", sub: "Cuéntanos cómo operas y qué te limita. Con eso el diagnóstico estará completo.", cta: "Finalizar diagnóstico" },
    { message: "¡Diagnóstico completo!", sub: "El ORÁCULO ya conoce tu taller. Pronto podrás ver tus primeras misiones.", cta: "Ver resumen" },
  ];
  const insightIdx = !step2Complete ? 0 : !step3Complete ? 1 : !step4Complete ? 2 : 3;
  const insight = insights[insightIdx];

  return (
    <>
      <OraculoTaller insight={insight} onGoForm={goToForm} />

      <div className="h-full flex flex-col min-h-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30">

          {/* Mobile */}
          <div
            className="md:hidden px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(249,247,242,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226,213,207,0.3)" }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: "rgba(21,27,45,0.05)", border: "1px solid rgba(21,27,45,0.07)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#151b2d" }}>arrow_back</span>
            </button>
            <div className="text-center">
              <h1 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#151b2d" }}>Tu Taller</h1>
              <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(84,67,62,0.5)" }}>{visibleCompleted} de {VISIBLE_TOTAL} bloques</p>
            </div>
            <div className="w-9" />
          </div>

          {/* Desktop */}
          <div
            className="hidden md:grid px-12 pt-4 pb-3 items-center"
            style={{ gridTemplateColumns: "1fr auto 1fr", background: "rgba(249,247,242,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226,213,207,0.2)" }}
          >
            <div />
            <div className="flex flex-col items-center text-center">
              <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "#151b2d", lineHeight: 1.2 }}>Tu Taller</h1>
              <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: "rgba(84,67,62,0.7)", marginTop: 2 }}>
                Diagnóstico inicial · {visibleCompleted} de {VISIBLE_TOTAL} bloques · {pct}%
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-white/60"
                style={{ border: "1px solid rgba(21,27,45,0.1)", color: "#151b2d", fontFamily: SANS, fontSize: 13, fontWeight: 700, background: "transparent", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Volver
              </button>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ overscrollBehavior: "contain" }}>

          {/* ── Mobile ── */}
          <div className="md:hidden flex-1 overflow-y-auto px-3 pt-3 pb-32" style={{ overscrollBehavior: "contain" }}>

            {/* Progress hero */}
            <div className="mb-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#151b2d" }}>Diagnóstico del taller</span>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: isComplete ? "#166534" : "#ec6d13" }}>{pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 9999, background: "rgba(21,27,45,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 9999, background: isComplete ? "#166534" : "#ec6d13", width: `${pct}%`, transition: "width 0.5s ease" }} />
              </div>
            </div>

            {/* Metric chips */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <MetricCard label="Completados" value={visibleCompleted} sub={`de ${VISIBLE_TOTAL} bloques`} icon="task_alt" mobileValue={visibleCompleted} mobileIconColor={isComplete ? "#166534" : "rgba(21,27,45,0.3)"} />
              <MetricCard label="Estado" value={isComplete ? "Listo" : "En curso"} sub="diagnóstico" icon="verified" mobileValue={isComplete ? "OK" : "..."} mobileIconColor={isComplete ? "#166534" : "#ec6d13"} />
              <MetricCard label="Misiones" value="—" sub="próximamente" icon="rocket_launch" mobileValue="—" />
            </div>

            {/* 3 blocks */}
            <div className="flex flex-col gap-3">
              {step2Complete && commercial ? (
                <DiagBlock icon="payments" title="Realidad Comercial" items={[
                  { label: "Rango de precios", value: commercial.shopRangePayment },
                  { label: "Claridad de costos", value: commercial.shopKnowledgeDefineCost },
                  { label: "¿Tu taller es rentable?", value: commercial.shopKnowledgeIsProfitable },
                ]} />
              ) : (
                <PendingBlock icon="payments" title="Realidad Comercial" description="Precios, costos y claridad sobre las ganancias de tu taller." onComplete={goToForm} />
              )}

              {step3Complete && clientMarket ? (
                <DiagBlock icon="groups" title="Clientes y Mercado" items={[
                  { label: "Comprador principal", value: clientMarket.shopKnowledgeMainBuyerOne },
                  { label: "Presencia digital", value: clientMarket.shopKnowledgeDigitalPresence },
                  { label: "Dónde vendes", value: clientMarket.shopKnowledgeWhereSaleOne },
                  { label: "Actividad de ventas", value: clientMarket.shopKnowledgeSalesActivity },
                ]} />
              ) : (
                <PendingBlock icon="groups" title="Clientes y Mercado" description="Quiénes compran tu trabajo y dónde vendes hoy." onComplete={goToForm} />
              )}

              {step4Complete && operations ? (
                <DiagBlock icon="factory" title="Operaciones y Crecimiento" items={[
                  { label: "Producción mensual", value: operations.shopKnowledgeProductsMakeMonth },
                  { label: "Principal limitación", value: operations.shopKnowledgeLimitTodayOne },
                  { label: "Trabajadores", value: operations.shopManyWorkers },
                  { label: "Qué resolver primero con TELAR", value: operations.shopFirstSolvingTelar },
                ]} />
              ) : (
                <PendingBlock icon="factory" title="Operaciones y Crecimiento" description="Capacidad productiva, limitaciones y primeros pasos de crecimiento." onComplete={goToForm} />
              )}

              <ComingSoonBlock icon="query_stats" title="Indicadores" description="Métricas calculadas a partir de tu diagnóstico." />
              <ComingSoonBlock icon="tips_and_updates" title="Recomendaciones" description="Sugerencias personalizadas para tu realidad." />
            </div>
          </div>

          {/* ── Desktop ── */}
          <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto px-12 pb-20">
            <div className="max-w-[1300px] mx-auto pt-8">

              {/* 4 Metric cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <MetricCard
                  label="Completados"
                  value={<span>{visibleCompleted}<span style={{ fontSize: 20, opacity: 0.35 }}>/{VISIBLE_TOTAL}</span></span>}
                  sub="bloques del diagnóstico"
                  icon="task_alt"
                  mobileValue={visibleCompleted}
                  mobileIconColor={isComplete ? "#166534" : "rgba(21,27,45,0.3)"}
                />
                <MetricCard
                  label="Progreso"
                  value={<span style={{ color: pct === 100 ? "#166534" : pct >= 50 ? "#ec6d13" : "#151b2d" }}>{pct}<span style={{ fontSize: 20, opacity: 0.35 }}>%</span></span>}
                  sub="diagnóstico completado"
                  icon="donut_large"
                  mobileValue={`${pct}%`}
                  mobileIconColor={pct === 100 ? "#166534" : "#ec6d13"}
                />
                <MetricCard
                  label="Estado"
                  value={<span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: isComplete ? "#166534" : "#ec6d13" }}>{isComplete ? "Completo" : "En curso"}</span>}
                  sub={isComplete ? "diagnóstico finalizado" : "completando diagnóstico"}
                  icon={isComplete ? "verified" : "pending"}
                  mobileValue={isComplete ? "OK" : "..."}
                  mobileIconColor={isComplete ? "#166534" : "#ec6d13"}
                />
                <MetricCard
                  label="Misiones"
                  value={<span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "rgba(21,27,45,0.28)" }}>—</span>}
                  sub="próximamente disponibles"
                  icon="rocket_launch"
                  mobileValue="—"
                />
              </div>

              {/* Grid 8 + 4 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left — bento 2 cols */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {step2Complete && commercial ? (
                      <DiagBlock icon="payments" title="Realidad Comercial" items={[
                        { label: "Rango de precios", value: commercial.shopRangePayment },
                        { label: "Claridad de costos", value: commercial.shopKnowledgeDefineCost },
                        { label: "¿Tu taller es rentable?", value: commercial.shopKnowledgeIsProfitable },
                      ]} />
                    ) : (
                      <PendingBlock icon="payments" title="Realidad Comercial" description="Precios, costos y claridad sobre las ganancias de tu taller." onComplete={goToForm} />
                    )}

                    {step3Complete && clientMarket ? (
                      <DiagBlock icon="groups" title="Clientes y Mercado" items={[
                        { label: "Comprador principal", value: clientMarket.shopKnowledgeMainBuyerOne },
                        { label: "Presencia digital", value: clientMarket.shopKnowledgeDigitalPresence },
                        { label: "Dónde vendes", value: clientMarket.shopKnowledgeWhereSaleOne },
                        { label: "Actividad de ventas", value: clientMarket.shopKnowledgeSalesActivity },
                      ]} />
                    ) : (
                      <PendingBlock icon="groups" title="Clientes y Mercado" description="Quiénes compran tu trabajo y dónde vendes hoy." onComplete={goToForm} />
                    )}

                    {step4Complete && operations ? (
                      <DiagBlock icon="factory" title="Operaciones y Crecimiento" items={[
                        { label: "Producción mensual", value: operations.shopKnowledgeProductsMakeMonth },
                        { label: "Principal limitación", value: operations.shopKnowledgeLimitTodayOne },
                        { label: "Trabajadores", value: operations.shopManyWorkers },
                        { label: "Qué resolver primero con TELAR", value: operations.shopFirstSolvingTelar },
                      ]} />
                    ) : (
                      <PendingBlock icon="factory" title="Operaciones y Crecimiento" description="Capacidad productiva, limitaciones y primeros pasos de crecimiento." onComplete={goToForm} />
                    )}

                  </div>

                  {/* Coming soon row */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <ComingSoonBlock icon="query_stats" title="Indicadores" description="Métricas clave calculadas desde tu diagnóstico." />
                    <ComingSoonBlock icon="tips_and_updates" title="Recomendaciones" description="Sugerencias personalizadas para tu realidad." />
                    <ComingSoonBlock icon="timeline" title="Evolución" description="Comparación entre diagnóstico inicial y estado actual." />
                  </div>
                </div>

                {/* Right — Oráculo (desktop inline) + Misiones */}
                <div className="lg:col-span-4">
                  <div style={{ position: "sticky", top: 24 }} className="flex flex-col gap-4">

                    {/* Oráculo card — inline en desktop (el drawer solo es mobile) */}
                    <div className="p-7 rounded-3xl relative overflow-hidden" style={{ background: "#151b2d" }}>
                      <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(236,109,19,0.1)", filter: "blur(50px)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(236,109,19,0.05)", filter: "blur(35px)", pointerEvents: "none" }} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-5">
                          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(236,109,19,0.15)", border: "1px solid rgba(236,109,19,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 19, color: "#ec6d13" }}>smart_toy</span>
                          </div>
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>ORÁCULO</span>
                        </div>
                        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 10, lineHeight: 1.35 }}>{insight.message}</h3>
                        <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 22 }}>{insight.sub}</p>
                        {!isComplete && (
                          <button
                            type="button"
                            onClick={goToForm}
                            className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-full transition-all hover:opacity-90"
                            style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
                          >
                            {insight.cta}
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <MisionesPanel completedSteps={visibleCompleted} onGoForm={goToForm} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TallerStatusPage;
