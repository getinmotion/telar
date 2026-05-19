import React, { useState } from 'react';
import { MapPin, AlertTriangle, Edit2, Check, X, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { telarApi } from '@/integrations/api/telarApi';
import { cn } from '@/lib/utils';

export interface ArtisanOriginData {
  department?: string | null;
  city?: string | null;
  daneCity?: number | null;
  municipality?: string | null;
  culturalMeaning?: string | null;
  mainStory?: string | null;
}

interface ArtisanOriginDisplayProps {
  userId: string;
  origin: ArtisanOriginData;
  onUpdated?: (origin: ArtisanOriginData) => void;
  className?: string;
}

interface EditForm {
  department: string;
  city: string;
  municipality: string;
}

export const ArtisanOriginDisplay: React.FC<ArtisanOriginDisplayProps> = ({
  userId,
  origin,
  onUpdated,
  className,
}) => {
  const [confirmingEdit, setConfirmingEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    department: origin.department ?? '',
    city: origin.city ?? origin.municipality ?? '',
    municipality: origin.municipality ?? '',
  });

  const hasOrigin = origin.department || origin.city || origin.municipality;

  const handleConfirmEdit = () => {
    setConfirmingEdit(false);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await telarApi.patch(`/artisan-profile/${userId}`, {
        department: form.department || null,
        city: form.city || null,
        municipality: form.municipality || null,
      });
      const updated: ArtisanOriginData = {
        ...origin,
        department: form.department || null,
        city: form.city || null,
        municipality: form.municipality || null,
      };
      onUpdated?.(updated);
      setEditing(false);
      toast.success('Origen artesanal actualizado');
    } catch {
      toast.error('Error al actualizar el origen');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setConfirmingEdit(false);
    setForm({
      department: origin.department ?? '',
      city: origin.city ?? origin.municipality ?? '',
      municipality: origin.municipality ?? '',
    });
  };

  return (
    <div className={cn('rounded-2xl border border-[#151b2d]/8 bg-white p-5 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#151b2d]" />
          <h3 className="text-sm font-semibold text-[#151b2d]">Origen artesanal</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400 border-gray-200">
            Desde el registro
          </Badge>
        </div>

        {!editing && !confirmingEdit && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-400 hover:text-[#151b2d] gap-1"
            onClick={() => setConfirmingEdit(true)}
          >
            <Edit2 className="w-3 h-3" />
            Editar origen
          </Button>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmingEdit && !editing && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                ¿Seguro que quieres modificar tu origen artesanal?
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Tu origen cultural identifica tu trabajo y es parte de tu perfil público.
                Cambios incorrectos pueden afectar la confianza de tus compradores.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setConfirmingEdit(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs bg-amber-600 hover:bg-amber-700"
              onClick={handleConfirmEdit}
            >
              Sí, quiero editar
            </Button>
          </div>
        </div>
      )}

      {/* Read-only display */}
      {!editing && (
        <div className="space-y-2">
          {hasOrigin ? (
            <div className="grid grid-cols-2 gap-3">
              {origin.department && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Departamento</p>
                  <p className="text-sm font-medium text-[#151b2d] mt-0.5">{origin.department}</p>
                </div>
              )}
              {(origin.city || origin.municipality) && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Municipio</p>
                  <p className="text-sm font-medium text-[#151b2d] mt-0.5">
                    {origin.city ?? origin.municipality}
                  </p>
                </div>
              )}
              {origin.culturalMeaning && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Significado cultural</p>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{origin.culturalMeaning}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No hay información de origen registrada.</p>
          )}

          {/* Explanatory note */}
          <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-gray-50">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="font-medium">Origen cultural ≠ dirección de envío.</strong>{' '}
              La dirección logística para tus pedidos se gestiona en{' '}
              <a href="/mi-tienda/configurar" className="underline hover:text-[#151b2d]">
                Configuración de tienda →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Departamento</label>
              <Input
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="Ej: Nariño"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Municipio</label>
              <Input
                value={form.city || form.municipality}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, municipality: e.target.value }))}
                placeholder="Ej: Pasto"
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="w-3 h-3" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
