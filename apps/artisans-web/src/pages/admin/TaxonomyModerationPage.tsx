import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Merge, Edit3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getPendingTaxonomies,
  updateTaxonomyStatus,
  type TaxonomyType,
  type TaxonomyItem,
} from '@/services/taxonomy.actions';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<TaxonomyType, string> = {
  crafts: 'Oficios',
  techniques: 'Técnicas',
  materials: 'Materiales',
  styles: 'Estilos',
  herramientas: 'Herramientas',
};

const TYPE_COLORS: Record<TaxonomyType, string> = {
  crafts: 'bg-blue-50 text-blue-700 border-blue-200',
  techniques: 'bg-purple-50 text-purple-700 border-purple-200',
  materials: 'bg-green-50 text-green-700 border-green-200',
  styles: 'bg-orange-50 text-orange-700 border-orange-200',
  herramientas: 'bg-pink-50 text-pink-700 border-pink-200',
};

interface PendingEntry {
  item: TaxonomyItem;
  type: TaxonomyType;
}

type ActionType = 'approve' | 'reject' | 'merge' | 'normalize';

interface ActionState {
  itemId: string;
  action: ActionType;
  value?: string;
}

const TaxonomyModerationPage: React.FC = () => {
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionState | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaxonomyType | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPendingTaxonomies();
      const flat: PendingEntry[] = [];
      (Object.entries(result) as [TaxonomyType, TaxonomyItem[]][]).forEach(([type, items]) => {
        items.forEach((item) => flat.push({ item, type }));
      });
      flat.sort((a, b) => new Date(b.item.createdAt ?? 0).getTime() - new Date(a.item.createdAt ?? 0).getTime());
      setEntries(flat);
    } catch {
      toast.error('Error al cargar entradas pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.item.id !== id));

  const handleApprove = async (entry: PendingEntry) => {
    setProcessingId(entry.item.id);
    try {
      await updateTaxonomyStatus(entry.type, entry.item.id, 'approved');
      removeEntry(entry.item.id);
      toast.success(`"${entry.item.name}" aprobado`);
    } catch {
      toast.error('Error al aprobar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (entry: PendingEntry) => {
    setProcessingId(entry.item.id);
    try {
      await updateTaxonomyStatus(entry.type, entry.item.id, 'rejected');
      removeEntry(entry.item.id);
      toast.success(`"${entry.item.name}" rechazado`);
    } catch {
      toast.error('Error al rechazar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMerge = async (entry: PendingEntry, mergeIntoId: string) => {
    if (!mergeIntoId.trim()) { toast.warning('Ingresa el ID del elemento destino'); return; }
    setProcessingId(entry.item.id);
    try {
      await updateTaxonomyStatus(entry.type, entry.item.id, 'rejected', mergeIntoId.trim());
      removeEntry(entry.item.id);
      setActiveAction(null);
      toast.success(`"${entry.item.name}" fusionado`);
    } catch {
      toast.error('Error al fusionar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleNormalize = async (entry: PendingEntry, newName: string) => {
    if (!newName.trim()) { toast.warning('Ingresa el nombre normalizado'); return; }
    setProcessingId(entry.item.id);
    try {
      // Update name then approve
      const endpoint = `/taxonomy/${entry.type.replace('crafts', 'crafts').replace('techniques', 'techniques').replace('materials', 'materials')}/${entry.item.id}`;
      // Use updateTaxonomyStatus after rename — rename via PATCH
      await import('@/integrations/api/telarApi').then(({ telarApi }) =>
        telarApi.patch(
          entry.type === 'styles' ? `/taxonomy/styles/${entry.item.id}`
          : entry.type === 'herramientas' ? `/taxonomy/herramientas/${entry.item.id}`
          : `/${entry.type}/${entry.item.id}`,
          { name: newName.trim() },
        ),
      );
      await updateTaxonomyStatus(entry.type, entry.item.id, 'approved');
      removeEntry(entry.item.id);
      setActiveAction(null);
      toast.success(`"${entry.item.name}" normalizado a "${newName}" y aprobado`);
    } catch {
      toast.error('Error al normalizar');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
  const counts = entries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {} as Record<TaxonomyType, number>);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#151b2d]">Moderación de taxonomías</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entries.length} entrada{entries.length !== 1 ? 's' : ''} pendiente{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-1"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            filter === 'all'
              ? 'bg-[#151b2d] text-white border-[#151b2d]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
          )}
        >
          Todos ({entries.length})
        </button>
        {(Object.keys(TYPE_LABELS) as TaxonomyType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === type
                ? 'bg-[#151b2d] text-white border-[#151b2d]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
            )}
          >
            {TYPE_LABELS[type]} {counts[type] ? `(${counts[type]})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No hay entradas pendientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ item, type }) => {
            const isProcessing = processingId === item.id;
            const action = activeAction?.itemId === item.id ? activeAction : null;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className={cn('text-xs shrink-0', TYPE_COLORS[type])}>
                    {TYPE_LABELS[type]}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#151b2d]">{item.name}</p>
                    {item.suggestedBy && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Sugerido por: {item.suggestedBy}
                      </p>
                    )}
                    {item.createdAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-green-600 hover:bg-green-50"
                      onClick={() => handleApprove({ item, type })}
                      disabled={isProcessing}
                      title="Aprobar"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-red-500 hover:bg-red-50"
                      onClick={() => handleReject({ item, type })}
                      disabled={isProcessing}
                      title="Rechazar"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-blue-500 hover:bg-blue-50"
                      onClick={() => setActiveAction(action?.action === 'merge' ? null : { itemId: item.id, action: 'merge' })}
                      disabled={isProcessing}
                      title="Fusionar con otro"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      Fusionar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-amber-600 hover:bg-amber-50"
                      onClick={() => setActiveAction(action?.action === 'normalize' ? null : { itemId: item.id, action: 'normalize', value: item.name })}
                      disabled={isProcessing}
                      title="Normalizar nombre y aprobar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Normalizar
                    </Button>
                  </div>
                </div>

                {/* Inline merge input */}
                {action?.action === 'merge' && (
                  <div className="flex items-center gap-2 pl-2 border-l-2 border-blue-200">
                    <Input
                      placeholder="ID del elemento destino..."
                      value={action.value ?? ''}
                      onChange={(e) => setActiveAction({ ...action, value: e.target.value })}
                      className="text-xs h-7 flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleMerge({ item, type }, action.value ?? '')}
                      disabled={isProcessing}
                    >
                      Confirmar fusión
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setActiveAction(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {/* Inline normalize input */}
                {action?.action === 'normalize' && (
                  <div className="flex items-center gap-2 pl-2 border-l-2 border-amber-300">
                    <Input
                      placeholder="Nombre normalizado..."
                      value={action.value ?? ''}
                      onChange={(e) => setActiveAction({ ...action, value: e.target.value })}
                      className="text-xs h-7 flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleNormalize({ item, type }, action.value ?? '')}
                      disabled={isProcessing}
                    >
                      Normalizar y aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setActiveAction(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaxonomyModerationPage;
