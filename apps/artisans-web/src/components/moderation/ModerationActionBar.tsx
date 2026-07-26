import React, { useState } from "react";
import { CheckCheck, MessageCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Lenguaje de acciones ÚNICO de moderación, compartido por todos los Studios
 * (Producto, Tienda, Taxonomía) y el Inbox. Tres acciones canónicas —
 * Aprobar · Pedir cambios · Rechazar — con etiquetas, íconos y colores idénticos.
 *
 * "Aprobar con ajustes" se eliminó deliberadamente: no aportaba un flujo real
 * y rompía la consistencia.
 */
export type ModerationDecision = "approve" | "request_changes" | "reject";

export const MODERATION_ACTIONS: Record<
  ModerationDecision,
  { label: string; icon: React.ComponentType<{ className?: string }>; needsComment: boolean }
> = {
  approve: { label: "Aprobar", icon: CheckCheck, needsComment: false },
  request_changes: { label: "Pedir cambios", icon: MessageCircle, needsComment: true },
  reject: { label: "Rechazar", icon: XCircle, needsComment: true },
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Borrador", color: "#6b7280", bg: "#f3f4f6" },
  pending_moderation: { label: "Pendiente", color: "#ec6d13", bg: "#fff7ed" },
  changes_requested: { label: "Con cambios", color: "#c29200", bg: "#fffbeb" },
  approved: { label: "Aprobado", color: "#166534", bg: "#f0fdf4" },
  approved_with_edits: { label: "Aprobado", color: "#166534", bg: "#f0fdf4" },
  rejected: { label: "Rechazado", color: "#dc2626", bg: "#fef2f2" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABEL[status] ?? STATUS_LABEL.draft;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

interface ModerationActionBarProps {
  status?: string;
  busy?: boolean;
  onAction: (action: ModerationDecision, comment?: string) => void | Promise<void>;
  /** Longitud mínima del comentario para rechazar / pedir cambios. */
  minComment?: number;
  /**
   * Acciones a mostrar. Por defecto las tres. Las tiendas no tienen estado
   * "changes_requested", así que ahí se pasa ['approve','reject'].
   */
  actions?: ModerationDecision[];
}

/**
 * Barra de decisión de un Studio. Aprobar es inmediato; Pedir cambios y
 * Rechazar revelan un comentario obligatorio (el historial de auditoría lo exige).
 */
export const ModerationActionBar: React.FC<ModerationActionBarProps> = ({
  status,
  busy = false,
  onAction,
  minComment = 10,
  actions = ["approve", "request_changes", "reject"],
}) => {
  const [pending, setPending] = useState<ModerationDecision | null>(null);
  const [comment, setComment] = useState("");
  const show = (a: ModerationDecision) => actions.includes(a);

  const start = (action: ModerationDecision) => {
    if (MODERATION_ACTIONS[action].needsComment) {
      setPending(action);
      setComment("");
    } else {
      void onAction(action);
    }
  };

  const confirm = () => {
    if (pending && comment.trim().length >= minComment) {
      void onAction(pending, comment.trim());
      setPending(null);
      setComment("");
    }
  };

  return (
    <div
      className="flex-shrink-0 space-y-2 border-t px-4 py-3"
      style={{ borderColor: "rgba(20,34,57,0.12)", background: "#f8fafc" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Decisión
          </span>
          {status && <StatusBadge status={status} />}
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {!pending && (
        <div className="flex flex-wrap gap-2">
          {show("approve") && (
            <Button type="button" size="sm" disabled={busy} onClick={() => start("approve")}
              className="gap-1.5 bg-green-700 text-xs text-white hover:bg-green-800">
              <CheckCheck className="h-3.5 w-3.5" /> Aprobar
            </Button>
          )}
          {show("request_changes") && (
            <Button type="button" size="sm" disabled={busy} onClick={() => start("request_changes")}
              className="gap-1.5 bg-amber-600 text-xs text-white hover:bg-amber-700">
              <MessageCircle className="h-3.5 w-3.5" /> Pedir cambios
            </Button>
          )}
          {show("reject") && (
            <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => start("reject")}
              className="gap-1.5 text-xs">
              <XCircle className="h-3.5 w-3.5" /> Rechazar
            </Button>
          )}
        </div>
      )}

      {pending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              {pending === "request_changes" ? "Mensaje al artesano" : "Motivo de rechazo"}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPending(null)}
              className="h-auto py-0 text-[10px] text-slate-400 hover:text-slate-600">
              Cancelar
            </Button>
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
            placeholder={`Mín. ${minComment} caracteres…`}
            className="resize-none border-slate-200 bg-white text-xs" />
          <Button type="button" size="sm" disabled={comment.trim().length < minComment || busy} onClick={confirm}
            className={cn("w-full text-xs font-semibold text-white",
              pending === "request_changes" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700")}>
            Confirmar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModerationActionBar;
