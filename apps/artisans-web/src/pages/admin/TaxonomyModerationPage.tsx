import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, Merge, Edit3, Loader2, RefreshCw, GitMerge, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getPendingTaxonomies,
  updateTaxonomyStatus,
  searchTaxonomy,
  type TaxonomyType,
  type TaxonomyItem,
} from '@/services/taxonomy.actions';
import { createTaxonomyAlias, type TaxonomyAliasType } from '@/services/curation.actions';
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

// Alias type mapping (taxonomy type → alias canonical type)
const ALIAS_TYPE_MAP: Partial<Record<TaxonomyType, TaxonomyAliasType>> = {
  crafts: 'craft',
  techniques: 'technique',
  materials: 'material',
  styles: 'style',
};

interface PendingEntry {
  item: TaxonomyItem;
  type: TaxonomyType;
}

type ActionType = 'approve' | 'reject' | 'merge' | 'normalize' | 'alias';

interface ActionState {
  itemId: string;
  action: ActionType;
  value?: string;
  searchResults?: TaxonomyItem[];
  searching?: boolean;
}

/** Levenshtein distance — fuzzy match for duplicate detection */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

interface DuplicatePair {
  a: PendingEntry;
  b: PendingEntry;
  score: number;
}

const TaxonomyModerationPage: React.FC = () => {
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionState | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaxonomyType | 'all' | 'duplicates'>('all');

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

  // Compute duplicate pairs (same type, similarity > 0.75)
  const duplicatePairs = useMemo<DuplicatePair[]>(() => {
    const pairs: DuplicatePair[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        if (a.type !== b.type) continue;
        const score = similarity(a.item.name, b.item.name);
        if (score >= 0.75 && a.item.id !== b.item.id) {
          pairs.push({ a, b, score });
        }
      }
    }
    return pairs.sort((x, y) => y.score - x.score).slice(0, 20);
  }, [entries]);

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

  const handleMergeWithSearch = async (entry: PendingEntry, targetItem: TaxonomyItem) => {
    setProcessingId(entry.item.id);
    try {
      // 1. Rechazar el término duplicado (merge = marcar como alias del canónico)
      await updateTaxonomyStatus(entry.type, entry.item.id, 'rejected', targetItem.id);
      // 2. Crear alias en la nueva tabla
      const aliasType = ALIAS_TYPE_MAP[entry.type];
      if (aliasType) {
        await createTaxonomyAlias({
          canonicalId: targetItem.id,
          canonicalType: aliasType,
          aliasName: entry.item.name,
        });
      }
      removeEntry(entry.item.id);
      setActiveAction(null);
      toast.success(`"${entry.item.name}" fusionado con "${targetItem.name}"`);
    } catch {
      toast.error('Error al fusionar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAlias = async (entry: PendingEntry, aliasName: string) => {
    if (!aliasName.trim()) { toast.warning('Ingresa el nombre del alias'); return; }
    setProcessingId(entry.item.id);
    try {
      const aliasType = ALIAS_TYPE_MAP[entry.type];
      if (!aliasType) { toast.error('Tipo de taxonomía no soporta alias'); return; }
      await createTaxonomyAlias({
        canonicalId: entry.item.id,
        canonicalType: aliasType,
        aliasName: aliasName.trim(),
      });
      setActiveAction(null);
      toast.success(`Alias "${aliasName}" creado para "${entry.item.name}"`);
    } catch {
      toast.error('Error al crear alias');
    } finally {
      setProcessingId(null);
    }
  };

  const handleNormalize = async (entry: PendingEntry, newName: string) => {
    if (!newName.trim()) { toast.warning('Ingresa el nombre normalizado'); return; }
    setProcessingId(entry.item.id);
    try {
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

  const searchForMergeTarget = async (entry: PendingEntry, query: string) => {
    if (query.length < 2) {
      setActiveAction((prev) => prev ? { ...prev, searchResults: [], searching: false } : null);
      return;
    }
    setActiveAction((prev) => prev ? { ...prev, searching: true } : null);
    try {
      const results = await searchTaxonomy(entry.type, query, 'approved');
      setActiveAction((prev) => prev ? { ...prev, searchResults: results.slice(0, 6), searching: false } : null);
    } catch {
      setActiveAction((prev) => prev ? { ...prev, searching: false } : null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return entries;
    if (filter === 'duplicates') {
      const dupIds = new Set<string>();
      duplicatePairs.forEach(({ a, b }) => { dupIds.add(a.item.id); dupIds.add(b.item.id); });
      return entries.filter((e) => dupIds.has(e.item.id));
    }
    return entries.filter((e) => e.type === filter);
  }, [entries, filter, duplicatePairs]);

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
            {duplicatePairs.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {duplicatePairs.length} posible{duplicatePairs.length !== 1 ? 's' : ''} duplicado{duplicatePairs.length !== 1 ? 's' : ''}
              </span>
            )}
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

      {/* KPI cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(TYPE_LABELS) as TaxonomyType[]).map((type) => {
            const count = counts[type] ?? 0;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-all',
                  filter === type ? 'border-[#151b2d] bg-[#151b2d] text-white' : 'border-gray-100 bg-white hover:border-gray-300',
                )}
              >
                <p className={cn('text-2xl font-bold leading-none mb-1', count > 0 ? (filter === type ? 'text-white' : 'text-orange-500') : (filter === type ? 'text-white/60' : 'text-gray-300'))}>
                  {count}
                </p>
                <p className={cn('text-xs font-medium', filter === type ? 'text-white/70' : 'text-gray-500')}>
                  {TYPE_LABELS[type]}
                </p>
              </button>
            );
          })}
        </div>
      )}

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
        {duplicatePairs.length > 0 && (
          <button
            type="button"
            onClick={() => setFilter('duplicates')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all gap-1 flex items-center',
              filter === 'duplicates'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400',
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            Duplicados ({duplicatePairs.length})
          </button>
        )}
      </div>

      {/* Duplicate pairs banner */}
      {filter === 'duplicates' && duplicatePairs.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Posibles duplicados detectados por similitud de nombre
          </p>
          <div className="space-y-2">
            {duplicatePairs.map(({ a, b, score }) => (
              <div key={`${a.item.id}-${b.item.id}`} className="flex items-center gap-2 text-xs text-amber-900">
                <Badge variant="outline" className={cn('shrink-0', TYPE_COLORS[a.type])}>
                  {TYPE_LABELS[a.type]}
                </Badge>
                <span className="font-medium">{a.item.name}</span>
                <span className="text-amber-500">↔</span>
                <span className="font-medium">{b.item.name}</span>
                <span className="text-amber-500 ml-auto shrink-0">{Math.round(score * 100)}% similar</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            const hasAliasSupport = !!ALIAS_TYPE_MAP[type];

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
                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-green-600 hover:bg-green-50"
                      onClick={() => handleApprove({ item, type })}
                      disabled={isProcessing}
                    >
                      {isProcessing && action === null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-red-500 hover:bg-red-50"
                      onClick={() => handleReject({ item, type })}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-blue-500 hover:bg-blue-50"
                      onClick={() => setActiveAction(action?.action === 'merge' ? null : { itemId: item.id, action: 'merge', value: '', searchResults: [] })}
                      disabled={isProcessing}
                      title="Fusionar con término aprobado"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      Fusionar
                    </Button>
                    {hasAliasSupport && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-violet-600 hover:bg-violet-50"
                        onClick={() => setActiveAction(action?.action === 'alias' ? null : { itemId: item.id, action: 'alias', value: '' })}
                        disabled={isProcessing}
                        title="Crear nombre alternativo (alias)"
                      >
                        <Merge className="w-3.5 h-3.5" />
                        Alias
                      </Button>
                    )}
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

                {/* Inline merge with search */}
                {action?.action === 'merge' && (
                  <div className="space-y-2 pl-2 border-l-2 border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Busca el término canónico al que se va a fusionar:</p>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          placeholder={`Buscar en ${TYPE_LABELS[type]}...`}
                          value={action.value ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setActiveAction({ ...action, value: v });
                            searchForMergeTarget({ item, type }, v);
                          }}
                          className="text-xs h-7 pl-7"
                          autoFocus
                        />
                        {action.searching && (
                          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400" />
                        )}
                      </div>
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
                    {(action.searchResults ?? []).length > 0 && (
                      <div className="space-y-1">
                        {(action.searchResults ?? []).map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => handleMergeWithSearch({ item, type }, result)}
                            disabled={isProcessing}
                            className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 text-xs transition-all"
                          >
                            <span className="font-medium text-[#151b2d]">{result.name}</span>
                            <span className="text-gray-400 ml-2">→ fusionar aquí</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {action.value && action.value.length >= 2 && !action.searching && (action.searchResults ?? []).length === 0 && (
                      <p className="text-xs text-gray-400 pl-1">Sin resultados para "{action.value}"</p>
                    )}
                  </div>
                )}

                {/* Inline alias creation */}
                {action?.action === 'alias' && (
                  <div className="space-y-2 pl-2 border-l-2 border-violet-300">
                    <p className="text-xs text-violet-700 font-medium">Agrega un nombre alternativo para "{item.name}":</p>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nombre alternativo..."
                        value={action.value ?? ''}
                        onChange={(e) => setActiveAction({ ...action, value: e.target.value })}
                        className="text-xs h-7 flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-xs bg-violet-600 hover:bg-violet-700"
                        onClick={() => handleCreateAlias({ item, type }, action.value ?? '')}
                        disabled={isProcessing || !action.value?.trim()}
                      >
                        Crear alias
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
