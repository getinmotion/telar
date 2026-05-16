import React, { useState } from 'react';
import { MessageCircle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RequestChangesModeProps {
  onRequestChanges: (comment: string) => Promise<void>;
  moderating: boolean;
}

const CHANGE_TEMPLATES = [
  'Necesitamos al menos 3 fotos con fondo neutro y buena iluminación.',
  'La descripción debe contar la historia de la pieza y los materiales usados.',
  'Revisa la categoría — parece que no corresponde con el tipo de artesanía.',
  'Agrega el peso y dimensiones para que el cálculo de envío sea correcto.',
  'Los materiales indicados no coinciden con lo que se ve en las fotos.',
];

export const RequestChangesMode: React.FC<RequestChangesModeProps> = ({
  onRequestChanges,
  moderating,
}) => {
  const [comment, setComment] = useState('');
  const canSubmit = comment.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onRequestChanges(comment.trim());
  };

  const applyTemplate = (text: string) => {
    setComment((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n${text}` : text;
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header colaborativo */}
      <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-500 px-5 py-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
          <MessageCircle className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Pedir ajustes al artesano</p>
          <p className="text-xs text-amber-100 mt-0.5">
            La pieza queda en espera. El artesano puede corregirla y reenviarla.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 p-4">
        {/* Templates rápidos */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
            Sugerencias comunes
          </Label>
          <div className="space-y-1.5">
            {CHANGE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="flex w-full items-start gap-2 rounded-lg border border-amber-100 bg-white/70 px-3 py-2.5 text-left text-xs text-amber-900 transition-colors hover:border-amber-300 hover:bg-white"
              >
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">{tmpl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campo de texto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Mensaje al artesano
            </Label>
            <span className={cn(
              'text-[10px] font-medium',
              canSubmit ? 'text-amber-600' : 'text-gray-400',
            )}>
              {comment.trim().length}/20 mín.
            </span>
          </div>
          <Textarea
            placeholder="Explica qué necesita mejorar para que la pieza sea aprobada. Sé específico y constructivo."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="text-sm bg-white border-amber-200 focus-visible:ring-amber-400 resize-none"
          />
          <p className="text-[10px] text-amber-700">
            El artesano recibirá este mensaje y podrá editar y reenviar su pieza.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-amber-200 bg-amber-50/80 p-5">
        <Button
          onClick={handleSubmit}
          disabled={moderating || !canSubmit}
          className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm disabled:opacity-40"
        >
          {moderating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4 mr-2" />
          )}
          Enviar solicitud de ajustes
        </Button>
      </div>
    </div>
  );
};
