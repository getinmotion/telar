import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  LayoutGrid,
  ListOrdered,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getFeaturedCollections,
  createFeaturedCollection,
  updateFeaturedCollection,
  deleteFeaturedCollection,
  getMarketplaceAssignments,
  assignToMarketplace,
  removeFromMarketplace,
  type MarketplaceKey,
  type FeaturedCollection,
  type MarketplaceAssignment,
} from '@/services/curation.actions';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const MARKETPLACES: { key: MarketplaceKey; label: string; description: string; color: string }[] = [
  { key: 'premium', label: 'Premium', description: 'Piezas de alto valor artesanal', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'regional', label: 'Regional', description: 'Artesanías por territorio', color: 'bg-green-50 text-green-800 border-green-200' },
  { key: 'sponsor', label: 'Patrocinado', description: 'Contenido con aliados', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'hotel', label: 'Hotelería', description: 'Programa compra local para hoteles', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { key: 'design', label: 'Diseño', description: 'Colaboraciones con diseñadores', color: 'bg-purple-50 text-purple-800 border-purple-200' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CollectionCardProps {
  collection: FeaturedCollection;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, productIds: string[]) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onToggleActive,
  onDelete,
  onReorder,
}) => {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveProduct = (productId: string) => {
    setRemoving(productId);
    const updated = collection.productIds.filter((id) => id !== productId);
    onReorder(collection.id, updated);
    setRemoving(null);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#151b2d] truncate">{collection.title}</p>
            {!collection.isActive && (
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 shrink-0">
                Inactiva
              </Badge>
            )}
          </div>
          {collection.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{collection.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {collection.productIds.length} producto{collection.productIds.length !== 1 ? 's' : ''}
            · orden {collection.displayOrder}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
            onClick={() => onToggleActive(collection.id, !collection.isActive)}
            title={collection.isActive ? 'Desactivar' : 'Activar'}
          >
            {collection.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(collection.id)}
            title="Eliminar colección"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Product ID list (editable order) */}
      {collection.productIds.length > 0 && (
        <div className="space-y-1">
          {collection.productIds.map((pid, idx) => (
            <div
              key={pid}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50 text-xs"
            >
              <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <span className="text-gray-400 w-4 shrink-0">{idx + 1}</span>
              <span className="font-mono text-gray-600 flex-1 truncate">{pid}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(pid)}
                disabled={removing === pid}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AssignmentRowProps {
  assignment: MarketplaceAssignment;
  onRemove: (id: string) => void;
}

const AssignmentRow: React.FC<AssignmentRowProps> = ({ assignment, onRemove }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-white text-xs">
    <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
    <span className="font-mono text-gray-600 flex-1 truncate">{assignment.productId}</span>
    <span className="text-gray-400 shrink-0">
      {new Date(assignment.assignedAt).toLocaleDateString('es-CO')}
    </span>
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
      onClick={() => onRemove(assignment.id)}
      title="Quitar del marketplace"
    >
      <X className="w-3 h-3" />
    </Button>
  </div>
);

// ─── New Collection Form ──────────────────────────────────────────────────────

interface NewCollectionFormProps {
  marketplaceKey: MarketplaceKey;
  onCreated: () => void;
  onCancel: () => void;
}

const NewCollectionForm: React.FC<NewCollectionFormProps> = ({ marketplaceKey, onCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createFeaturedCollection({ title: title.trim(), description: description.trim() || undefined, marketplaceKey });
      toast.success('Colección creada');
      onCreated();
    } catch {
      toast.error('Error al crear colección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-600">Nueva colección</p>
      <Input
        placeholder="Título de la colección..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xs h-8"
        autoFocus
      />
      <Input
        placeholder="Descripción editorial (opcional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-xs h-8"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={loading || !title.trim()}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
          Crear
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

// ─── Assign Product Form ──────────────────────────────────────────────────────

interface AssignProductFormProps {
  marketplaceKey: MarketplaceKey;
  onAssigned: () => void;
  onCancel: () => void;
}

const AssignProductForm: React.FC<AssignProductFormProps> = ({ marketplaceKey, onAssigned, onCancel }) => {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) return;
    setLoading(true);
    try {
      await assignToMarketplace({ productId: productId.trim(), marketplaceKey });
      toast.success('Producto asignado al marketplace');
      setProductId('');
      onAssigned();
    } catch {
      toast.error('Error al asignar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="ID del producto a asignar..."
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="text-xs h-7 flex-1 font-mono"
        autoFocus
      />
      <Button type="submit" size="sm" className="h-7 text-xs" disabled={loading || !productId.trim()}>
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Asignar'}
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
        Cancelar
      </Button>
    </form>
  );
};

// ─── Per-marketplace panel ────────────────────────────────────────────────────

interface MarketplacePanelProps {
  marketplaceKey: MarketplaceKey;
  label: string;
}

const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ marketplaceKey, label }) => {
  const qc = useQueryClient();
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showAssignProduct, setShowAssignProduct] = useState(false);
  const [view, setView] = useState<'collections' | 'assignments'>('collections');

  const collectionsQuery = useQuery({
    queryKey: ['featured-collections', marketplaceKey],
    queryFn: () => getFeaturedCollections(marketplaceKey),
  });

  const assignmentsQuery = useQuery({
    queryKey: ['marketplace-assignments', marketplaceKey],
    queryFn: () => getMarketplaceAssignments(marketplaceKey),
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['featured-collections', marketplaceKey] });
    qc.invalidateQueries({ queryKey: ['marketplace-assignments', marketplaceKey] });
  }, [qc, marketplaceKey]);

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateFeaturedCollection(id, { isActive }),
    onSuccess: () => { invalidate(); toast.success('Colección actualizada'); },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => deleteFeaturedCollection(id),
    onSuccess: () => { invalidate(); toast.success('Colección eliminada'); },
    onError: () => toast.error('Error al eliminar'),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) =>
      updateFeaturedCollection(id, { productIds }),
    onSuccess: () => invalidate(),
    onError: () => toast.error('Error al reordenar'),
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (id: string) => removeFromMarketplace(id, 'Removido por curador'),
    onSuccess: () => { invalidate(); toast.success('Producto removido del marketplace'); },
    onError: () => toast.error('Error al remover'),
  });

  const collections = collectionsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const loading = collectionsQuery.isLoading || assignmentsQuery.isLoading;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setView('collections')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              view === 'collections' ? 'bg-white text-[#151b2d] shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Colecciones ({collections.length})
          </button>
          <button
            type="button"
            onClick={() => setView('assignments')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              view === 'assignments' ? 'bg-white text-[#151b2d] shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Productos ({assignments.length})
          </button>
        </div>
        <div className="flex gap-1">
          {view === 'collections' && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setShowNewCollection(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva colección
            </Button>
          )}
          {view === 'assignments' && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setShowAssignProduct(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Asignar producto
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400"
            onClick={invalidate}
            title="Actualizar"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Forms */}
      {showNewCollection && view === 'collections' && (
        <NewCollectionForm
          marketplaceKey={marketplaceKey}
          onCreated={() => { setShowNewCollection(false); invalidate(); }}
          onCancel={() => setShowNewCollection(false)}
        />
      )}
      {showAssignProduct && view === 'assignments' && (
        <AssignProductForm
          marketplaceKey={marketplaceKey}
          onAssigned={() => { setShowAssignProduct(false); invalidate(); }}
          onCancel={() => setShowAssignProduct(false)}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : view === 'collections' ? (
        collections.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hay colecciones para {label}
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
                onDelete={(id) => deleteCollectionMutation.mutate(id)}
                onReorder={(id, productIds) => reorderMutation.mutate({ id, productIds })}
              />
            ))}
          </div>
        )
      ) : (
        assignments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hay productos asignados a {label}
          </div>
        ) : (
          <div className="space-y-1.5">
            {assignments.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                onRemove={(id) => removeAssignmentMutation.mutate(id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const MarketplaceCurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketplaceKey>('premium');
  const active = MARKETPLACES.find((m) => m.key === activeTab)!;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#151b2d]">Curaduría Marketplace</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestiona colecciones editoriales y productos por canal de venta
        </p>
      </div>

      {/* Marketplace tabs */}
      <div className="flex gap-2 flex-wrap">
        {MARKETPLACES.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-[#151b2d] text-white border-[#151b2d]'
                : cn('bg-white hover:border-gray-300', color),
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active marketplace description */}
      <div className={cn('rounded-xl border p-4', active.color)}>
        <p className="text-sm font-medium">{active.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{active.description}</p>
      </div>

      {/* Panel */}
      <MarketplacePanel key={activeTab} marketplaceKey={activeTab} label={active.label} />
    </div>
  );
};

export default MarketplaceCurationPage;
