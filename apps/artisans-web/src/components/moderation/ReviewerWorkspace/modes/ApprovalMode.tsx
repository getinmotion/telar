import React, { useState } from 'react';
import { CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
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
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-sm font-medium text-emerald-800">Aprobación simple</p>
        <p className="text-xs text-emerald-700 mt-0.5">
          Esta pieza cumple con todos los criterios del marketplace.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="with-note"
          checked={withNote}
          onChange={(e) => setWithNote(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="with-note" className="text-xs cursor-pointer">
          <MessageSquare className="inline h-3 w-3 mr-1" />
          Agregar observación para el artesano
        </Label>
      </div>

      {withNote && (
        <div className="space-y-1.5">
          <Textarea
            placeholder="Ej: Excelente trabajo. Te recomendamos agregar más fotos de detalle en futuras piezas."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            Esta nota es positiva — el artesano la verá como retroalimentación.
          </p>
        </div>
      )}

      <Button
        onClick={handleApprove}
        disabled={moderating}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {moderating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        {withNote ? 'Aprobar con observación' : 'Aprobar'}
      </Button>
    </div>
  );
};
