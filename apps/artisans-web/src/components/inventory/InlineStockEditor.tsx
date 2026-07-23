import React, { useState, useEffect } from "react";
import { Minus, Plus, Check, Package } from "lucide-react";
import type { InventoryVariant } from "@/hooks/useInventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const SANS = "'Manrope', sans-serif";

const dotColor = (n: number) => (n === 0 ? "#ef4444" : n < 4 ? "#eab308" : "#22c55e");

const StockDot: React.FC<{ n: number }> = ({ n }) => (
  <span
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: dotColor(n),
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

interface InlineStockEditorProps {
  productName: string;
  /** Stock mostrado cuando no hay variantes editables (fallback). */
  inventory: number;
  variants?: InventoryVariant[];
  disabled?: boolean;
  /** Persiste el stock de una variante. Devuelve true si tuvo éxito. */
  onSave: (variantId: string, newStock: number) => Promise<boolean>;
}

// ── Botón redondo del stepper ────────────────────────────────────────────────
const StepBtn: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}> = ({ icon, onClick, disabled, label }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className="flex items-center justify-center rounded-full transition-colors"
    style={{
      width: 28,
      height: 28,
      background: disabled ? "rgba(21,27,45,0.03)" : "rgba(21,27,45,0.05)",
      border: "1px solid rgba(21,27,45,0.08)",
      color: disabled ? "rgba(21,27,45,0.25)" : "#151b2d",
      cursor: disabled ? "not-allowed" : "pointer",
      flexShrink: 0,
    }}
  >
    {icon}
  </button>
);

// ── Editor de una sola variante (stepper + campo) ────────────────────────────
const SingleVariantEditor: React.FC<{
  variantId: string;
  stock: number;
  disabled?: boolean;
  onSave: (variantId: string, newStock: number) => Promise<boolean>;
}> = ({ variantId, stock, disabled, onSave }) => {
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(String(stock));
  }, [stock]);

  const parsed = Math.max(0, parseInt(value, 10) || 0);
  const dirty = parsed !== stock && value.trim() !== "";

  const commit = async (next: number) => {
    const clean = Math.max(0, Math.floor(next));
    if (clean === stock) {
      setValue(String(stock));
      return;
    }
    setSaving(true);
    const ok = await onSave(variantId, clean);
    setSaving(false);
    if (!ok) setValue(String(stock)); // revertir si falla
  };

  return (
    <div className="flex items-center gap-1.5">
      <StockDot n={parsed} />
      <StepBtn
        label="Restar una unidad"
        icon={<Minus className="w-3.5 h-3.5" />}
        disabled={disabled || saving || parsed <= 0}
        onClick={() => commit(parsed - 1)}
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        disabled={disabled || saving}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => commit(parsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
        }}
        className="text-center rounded-lg focus:outline-none"
        style={{
          width: 46,
          height: 28,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 700,
          color: "#151b2d",
          border: dirty ? "1px solid #ec6d13" : "1px solid rgba(21,27,45,0.12)",
          background: "white",
          MozAppearance: "textfield",
        }}
      />
      <StepBtn
        label="Sumar una unidad"
        icon={<Plus className="w-3.5 h-3.5" />}
        disabled={disabled || saving}
        onClick={() => commit(parsed + 1)}
      />
      {saving && (
        <span
          className="material-symbols-outlined animate-spin"
          style={{ fontSize: 16, color: "#ec6d13" }}
        >
          progress_activity
        </span>
      )}
    </div>
  );
};

// ── Editor multi-variante (mini-modal) ───────────────────────────────────────
const MultiVariantEditor: React.FC<{
  productName: string;
  variants: InventoryVariant[];
  disabled?: boolean;
  onSave: (variantId: string, newStock: number) => Promise<boolean>;
}> = ({ productName, variants, disabled, onSave }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const total = variants.reduce((acc, v) => acc + (v.stock_quantity ?? 0), 0);

  const openModal = () => {
    setDraft(
      Object.fromEntries(variants.map((v) => [v.id, String(v.stock_quantity ?? 0)]))
    );
    setOpen(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const v of variants) {
        const next = Math.max(0, parseInt(draft[v.id], 10) || 0);
        if (next !== (v.stock_quantity ?? 0)) {
          await onSave(v.id, next);
        }
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors hover:bg-black/5"
        style={{
          border: "1px solid rgba(21,27,45,0.12)",
          background: "white",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        title="Editar stock por variante"
      >
        <StockDot n={total} />
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#151b2d" }}>
          {total}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: "rgba(84,67,62,0.5)" }}>
          · {variants.length} var.
        </span>
      </button>

      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: SANS }}>Editar stock</DialogTitle>
            <DialogDescription style={{ fontFamily: SANS }}>
              {productName} — {variants.length} variantes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto py-1">
            {variants.map((v) => {
              const val = draft[v.id] ?? "";
              const n = Math.max(0, parseInt(val, 10) || 0);
              return (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(21,27,45,0.03)" }}
                >
                  <Package className="w-4 h-4 shrink-0" style={{ color: "rgba(84,67,62,0.4)" }} />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#151b2d",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v.variant_name || v.sku || "Variante"}
                    </p>
                    {v.sku && v.variant_name && (
                      <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(84,67,62,0.4)" }}>
                        {v.sku}
                      </p>
                    )}
                  </div>
                  <StockDot n={n} />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={val}
                    disabled={saving}
                    onChange={(e) => setDraft((d) => ({ ...d, [v.id]: e.target.value }))}
                    onFocus={(e) => e.currentTarget.select()}
                    className="text-center rounded-lg focus:outline-none"
                    style={{
                      width: 60,
                      height: 34,
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#151b2d",
                      border: "1px solid rgba(21,27,45,0.15)",
                      background: "white",
                    }}
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-full transition-opacity hover:opacity-80"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(84,67,62,0.7)",
                background: "rgba(21,27,45,0.05)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                background: "#ec6d13",
                border: "none",
                cursor: saving ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(236,109,19,0.25)",
              }}
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>
                  progress_activity
                </span>
              ) : (
                <Check className="w-4 h-4" />
              )}
              Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Editor de stock inline para la fila del inventario.
 * - 1 variante  → stepper + campo numérico (guarda al salir/Enter/stepper).
 * - >1 variante → botón con total que abre un mini-modal por variante.
 * - sin variantes → solo lectura (no editable).
 * En todos los casos usa el endpoint de stock que NO pasa por moderación.
 */
export const InlineStockEditor: React.FC<InlineStockEditorProps> = ({
  productName,
  inventory,
  variants,
  disabled,
  onSave,
}) => {
  const list = variants ?? [];

  if (list.length === 0) {
    // Sin variantes: no hay a qué asociar el stock → solo lectura.
    return (
      <div className="flex items-center gap-2">
        <StockDot n={inventory} />
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#151b2d" }}>
          {inventory}
        </span>
      </div>
    );
  }

  if (list.length === 1) {
    return (
      <SingleVariantEditor
        variantId={list[0].id}
        stock={list[0].stock_quantity ?? 0}
        disabled={disabled}
        onSave={onSave}
      />
    );
  }

  return (
    <MultiVariantEditor
      productName={productName}
      variants={list}
      disabled={disabled}
      onSave={onSave}
    />
  );
};

export default InlineStockEditor;
