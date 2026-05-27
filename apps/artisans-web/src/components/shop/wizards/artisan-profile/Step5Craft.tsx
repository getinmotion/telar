import React, { useState, useEffect, KeyboardEvent } from "react";
import { ArtisanProfileData } from "@/types/artisanProfile";
import { getTechniquesByCraftId, Technique } from "@/services/crafts.actions";

const CRAFT_STYLES: { id: string; label: string; desc: string }[] = [
  {
    id: "Tradicional",
    label: "Tradicional",
    desc: "Sigue métodos y estéticas ancestrales fieles a su origen",
  },
  {
    id: "Contemporáneo",
    label: "Contemporáneo",
    desc: "Incorpora lenguajes actuales sin abandonar la técnica artesanal",
  },
  {
    id: "Fusión",
    label: "Fusión",
    desc: "Mezcla tradición con influencias modernas o de otras culturas",
  },
];

const TIME_OPTIONS = [
  { value: "1-3 días", icon: "filter_3", label: "1–3 días" },
  { value: "1 semana", icon: "date_range", label: "1 semana" },
  { value: "15 días", icon: "calendar_view_week", label: "15 días" },
  { value: "1 mes", icon: "calendar_month", label: "1 mes" },
  { value: "__custom", icon: "edit_calendar", label: "Más..." },
] as const;

const PRESET_MATERIALS = [
  "Algodón",
  "Seda",
  "Lana",
  "Fibras naturales",
  "Arcilla",
  "Madera",
  "Chaquira",
  "Cuero",
  "Caña flecha",
  "Barro",
  "Piedra",
  "Metal",
];

// ── TechniqueMultiPicker ──────────────────────────────────────────────────────

interface TechniqueMultiPickerProps {
  craftId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const TechniqueMultiPicker: React.FC<TechniqueMultiPickerProps> = ({
  craftId,
  selectedIds,
  onChange,
}) => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!craftId) {
      setTechniques([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getTechniquesByCraftId(craftId)
      .then((list) => {
        if (!cancelled) setTechniques(list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [craftId]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    );
  };

  // Sin oficio seleccionado
  if (!craftId) {
    return (
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(236,109,19,0.04)",
          border: "1px dashed rgba(236,109,19,0.25)",
        }}
      >
        <span className="material-symbols-outlined text-[20px] text-[#ec6d13]/50 shrink-0 mt-0.5">
          info
        </span>
        <div>
          <p className="font-['Manrope'] text-[13px] font-[700] text-[#54433e]/70 mb-0.5">
            Elige tu oficio primero
          </p>
          <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug">
            Para ver las técnicas disponibles, primero selecciona tu oficio en
            el paso 1.
          </p>
        </div>
      </div>
    );
  }

  // Cargando
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[52px] rounded-xl animate-pulse"
            style={{ background: "rgba(226,213,207,0.25)" }}
          />
        ))}
      </div>
    );
  }

  // Error al cargar
  if (error) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <span className="material-symbols-outlined text-[18px] text-[#ef4444] shrink-0">
          warning
        </span>
        <p className="font-['Manrope'] text-[12px] text-[#54433e]/60">
          No se pudieron cargar las técnicas. Intenta avanzar y volver a este
          paso.
        </p>
      </div>
    );
  }

  // Sin técnicas para este oficio
  if (techniques.length === 0) {
    return (
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(236,109,19,0.04)",
          border: "1px dashed rgba(236,109,19,0.2)",
        }}
      >
        <span className="material-symbols-outlined text-[20px] text-[#ec6d13]/50 shrink-0 mt-0.5">
          search_off
        </span>
        <p className="font-['Manrope'] text-[12px] text-[#54433e]/55 leading-snug">
          Aún no hay técnicas registradas para este oficio. Puedes continuar y
          agregarlas más adelante.
        </p>
      </div>
    );
  }

  // Cards de técnicas
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {techniques.map((t) => {
        const active = selectedIds.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className="relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all"
            style={{
              background: active
                ? "rgba(236,109,19,0.07)"
                : "rgba(247,244,239,0.5)",
              border: active
                ? "1.5px solid rgba(236,109,19,0.5)"
                : "1px solid rgba(226,213,207,0.5)",
            }}
          >
            {/* Check indicator */}
            <div
              className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
              style={{
                borderColor: active ? "#ec6d13" : "rgba(84,67,62,0.22)",
              }}
            >
              {active && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 11, color: "#ec6d13" }}
                >
                  check
                </span>
              )}
            </div>
            <span
              className="font-['Manrope'] text-[12px] font-[600] leading-snug flex-1"
              style={{ color: active ? "#ec6d13" : "#54433e" }}
            >
              {t.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ── ChipGroup (materiales) ────────────────────────────────────────────────────

interface ChipGroupProps {
  label: string;
  required?: boolean;
  selected: string[];
  presets: string[];
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
}

const ChipGroup: React.FC<ChipGroupProps> = ({
  label,
  required,
  selected,
  presets,
  onToggle,
  onAdd,
}) => {
  const [custom, setCustom] = useState("");

  const handleAdd = () => {
    const t = custom.trim();
    if (!t) return;
    onAdd(t);
    setCustom("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
        {label}
        {required && <span className="text-[#ef4444] ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = selected.includes(p);
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-[600] border transition-all ${
                active
                  ? "bg-[#ec6d13] border-[#ec6d13] text-white"
                  : "bg-[#ec6d13]/5 border-[#ec6d13]/20 text-[#ec6d13] hover:bg-[#ec6d13]/10"
              }`}
            >
              {p}
            </button>
          );
        })}
        {selected
          .filter((s) => !presets.includes(s))
          .map((s) => (
            <button
              key={s}
              onClick={() => onToggle(s)}
              className="px-3 py-1.5 rounded-full text-[12px] font-[600] bg-[#ec6d13] border border-[#ec6d13] text-white"
            >
              {s}
            </button>
          ))}
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={handleAdd}
          placeholder="+ Añadir"
          className="px-3 py-1.5 rounded-full text-[12px] font-[600] border border-dashed border-[#ec6d13]/40 text-[#ec6d13] placeholder:text-[#ec6d13]/40 bg-transparent focus:outline-none focus:border-[#ec6d13] w-28"
        />
      </div>
    </div>
  );
};

// ── Step5Craft ────────────────────────────────────────────────────────────────

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

export const Step5Craft: React.FC<Props> = ({ data, onChange }) => {
  const { user } = useAuth();
  const [showCustomTime, setShowCustomTime] = useState(
    () =>
      !!data.averageTime &&
      !TIME_OPTIONS.some(
        (o) => o.value !== "__custom" && o.value === data.averageTime,
      ),
  );

  const selectTime = (value: string) => {
    setShowCustom(false);
    onChange({ averageTime: value });
  };

  const openCustom = () => {
    setShowCustom(true);
    onChange({ averageTime: customTime || undefined });
  };

  const toggleItem = (field: "materials" | "craftStyle", value: string) => {
    const arr = data[field] as string[];
    onChange({
      [field]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const addItem = (field: "materials", value: string) => {
    if (!(data[field] as string[]).includes(value))
      onChange({ [field]: [...(data[field] as string[]), value] });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Técnicas — filtradas por oficio */}
      <section
        className="p-5 rounded-lg border border-[#e2d5cf]/20"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px -2px rgba(0,0,0,0.02)",
        }}
      >
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1">
          Técnicas artesanales
          <span className="text-[#ef4444] ml-1">*</span>
        </label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
          Selecciona las técnicas que aplicas en tu oficio. Puedes elegir
          varias.
        </p>
        <TechniqueMultiPicker
          craftId={data.craftId}
          selectedIds={data.techniqueIds ?? []}
          onChange={(ids) => onChange({ techniqueIds: ids })}
        />
      </section>

      {/* Materiales */}
      <section
        className="p-5 rounded-lg border border-[#e2d5cf]/20"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px -2px rgba(0,0,0,0.02)",
        }}
      >
        <div className="flex justify-between items-center mb-1">
          <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60">
            Materiales principales
            <span className="text-[#ef4444] ml-1">*</span>
          </label>
          {(data.materialIds ?? []).length > 0 && (
            <span className="text-[10px] font-[600] text-[#ec6d13]">
              {(data.materialIds ?? []).length} seleccionado
              {(data.materialIds ?? []).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
          Selecciona los materiales que usas en tu oficio. Los que elijas quedan
          guardados en tu perfil artesanal.
        </p>
        <MaterialPicker
          artisanId={user?.id ?? ""}
          userId={user?.id ?? ""}
          selectedIds={data.materialIds ?? []}
          onChange={(ids) => onChange({ materialIds: ids })}
        />
      </section>

      {/* Tiempo de elaboración */}
      <section
        className="p-5 rounded-lg border border-[#e2d5cf]/20"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px -2px rgba(0,0,0,0.02)",
        }}
      >
        <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-3">
          Tiempo promedio de elaboración
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TIME_OPTIONS.map((opt) => {
            const isCustom = opt.value === "__custom";
            const isActive = isCustom
              ? showCustomTime
              : data.averageTime === opt.value && !showCustomTime;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (isCustom) {
                    setShowCustomTime(true);
                    onChange({ averageTime: "" });
                  } else {
                    setShowCustomTime(false);
                    onChange({ averageTime: opt.value });
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[#ec6d13] shadow-sm"
                    : "border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm"
                }`}
                style={
                  isActive
                    ? { background: "rgba(236,109,19,0.06)" }
                    : { background: "#ffffff" }
                }
              >
                <span
                  className="material-symbols-outlined text-[20px] transition-colors"
                  style={{
                    color: isActive ? "#ec6d13" : "rgba(84,67,62,0.38)",
                  }}
                >
                  {opt.icon}
                </span>
                <span
                  className="text-[9px] font-[800] uppercase tracking-wide leading-tight text-center transition-colors"
                  style={{
                    color: isActive ? "#ec6d13" : "rgba(84,67,62,0.55)",
                  }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {showCustomTime && (
          <input
            type="text"
            autoFocus
            value={data.averageTime ?? ""}
            onChange={(e) => onChange({ averageTime: e.target.value })}
            placeholder="Ej: 3 meses, 45 días..."
            className="mt-3 w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
            style={{ background: "rgba(247,244,239,0.4)" }}
          />
        )}
      </section>

      {/* Diferenciación */}
      <section
        className="p-5 rounded-lg border border-[#e2d5cf]/20"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px -2px rgba(0,0,0,0.02)",
        }}
      >
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
          ¿Qué hace especial tu trabajo?{" "}
          <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          rows={5}
          value={data.uniqueness}
          onChange={(e) => onChange({ uniqueness: e.target.value })}
          placeholder="Describe qué diferencia tu forma de crear: técnica, acabado, intención, detalle, tradición o mezcla de estilos."
          className="w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
          style={{ background: "rgba(247,244,239,0.4)" }}
        />
      </section>

      {/* Estilo artesanal */}
      <section
        className="p-5 rounded-lg border border-[#e2d5cf]/20"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px -2px rgba(0,0,0,0.02)",
        }}
      >
        <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
          Estilo artesanal
        </label>
        <p className="text-[11px] text-[#54433e]/60 mb-3">
          ¿Cómo se relaciona tu trabajo con la tradición? Puedes elegir varios.
        </p>
        <div className="flex flex-col gap-2">
          {CRAFT_STYLES.map((s) => {
            const active = data.craftStyle.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleItem("craftStyle", s.id)}
                className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  background: active
                    ? "rgba(236,109,19,0.07)"
                    : "rgba(255,255,255,0.6)",
                  border: active
                    ? "1.5px solid rgba(236,109,19,0.4)"
                    : "1px solid rgba(226,213,207,0.35)",
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: active ? "#ec6d13" : "rgba(84,67,62,0.25)",
                  }}
                >
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
                  )}
                </div>
                <div>
                  <span
                    className="text-[10px] font-[800] uppercase tracking-wider block mb-0.5"
                    style={{ color: active ? "#ec6d13" : "#54433e" }}
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
      </section>
    </div>
  );
};
