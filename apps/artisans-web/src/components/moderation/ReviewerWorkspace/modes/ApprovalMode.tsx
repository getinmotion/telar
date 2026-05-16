import React, { useState } from 'react';
import { CheckCircle, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApprovalModeProps {
  onApprove: (comment?: string) => Promise<void>;
  moderating: boolean;
}

export const ApprovalMode: React.FC<ApprovalModeProps> = ({ onApprove, moderating }) => {
  const [withNote, setWithNote] = useState(false);
  const [note, setNote] = useState('');

  const handleApprove = async () => {
    await onApprove(withNote ? note.trim() || undefined : undefined);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero — ocupa el espacio visual dominante */}
      <div className="flex flex-col items-center justify-center gap-5 px-8 py-12 text-center border-b border-emerald-100/80">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
            <CheckCircle className="h-10 w-10 text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-emerald-900">Lista para el marketplace</h3>
          <p className="text-sm text-emerald-700 max-w-[260px] mx-auto leading-relaxed">
            Esta pieza cumple con todos los criterios de calidad de TELAR.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
          <Sparkles className="h-3 w-3" />
          Estado: Aprobada y visible
        </span>
      </div>

      {/* Nota opcional */}
      <div className="flex-1 p-6 space-y-4">
        <button
          type="button"
          onClick={() => setWithNote((v) => !v)}
          className="flex w-full items-start gap-3 rounded-xl border border-dashed border-emerald-200 bg-white/70 px-4 py-3.5 text-left transition-colors hover:border-emerald-300 hover:bg-white"
        >
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-emerald-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">
              {withNote ? 'Quitar observación' : 'Agregar observación positiva'}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Opcional — el artesano la verá junto con la notificación de aprobación
            </p>
          </div>
        </button>

        {withNote && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Mensaje al artesano
            </Label>
            <Textarea
              placeholder="Ej: Excelente trabajo. Las fotos son muy claras y la descripción cuenta bien la historia de la pieza."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="text-sm bg-white border-emerald-200 focus-visible:ring-emerald-400 resize-none"
            />
          </div>
        )}
      </div>

      {/* CTA pegado al fondo */}
      <div className="border-t border-emerald-100 bg-emerald-50/80 p-5">
        <Button
          onClick={handleApprove}
          disabled={moderating}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
        >
          {moderating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {withNote ? 'Aprobar con observación' : 'Aprobar y publicar'}
        </Button>
      </div>
    </div>
  );
};
