import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllTaxonomyItems,
  createTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type TaxonomyType,
  type TaxonomyItemAdmin,
  type TaxonomyItemWithCount,
} from '@/services/taxonomy.actions';
import {
  getCuratorialCategories,
  createCuratorialCategory,
  updateCuratorialCategory,
  deleteCuratorialCategory,
  type CuratorialCategory,
} from '@/services/curatorial-categories.actions';
import { getAllCategories, type Category } from '@/services/categories.actions';
import { TaxonomyStatusBadge } from './TaxonomyStatusBadge';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';

type TabType = TaxonomyType | 'curatorial';

interface Props {
  type: TabType;
  label: string;
}

type AnyItem = TaxonomyItemWithCount | CuratorialCategory;

const PURPLE = '#7c3aed';

const PRODUCT_COUNT_TYPES: TabType[] = ['crafts', 'materials', 'techniques'];
const ARTISAN_COUNT_TYPES: TabType[] = ['styles', 'herramientas'];

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

const STATUS_PILLS: { value: StatusFilter; label: string; activeStyle: React.CSSProperties; inactiveStyle: React.CSSProperties }[] = [
  {
    value: 'all',
    label: 'Todos',
    activeStyle: { background: '#111827', color: 'white', borderColor: '#111827' },
    inactiveStyle: { background: 'white', color: '#374151', borderColor: '#e5e7eb' },
  },
  {
    value: 'approved',
    label: '✓ Aprobados',
    activeStyle: { background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' },
    inactiveStyle: { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' },
  },
  {
    value: 'pending',
    label: '⏳ Pendientes',
    activeStyle: { background: '#fef9c3', color: '#a16207', borderColor: '#fde68a' },
    inactiveStyle: { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' },
  },
  {
    value: 'rejected',
    label: '✗ Rechazados',
    activeStyle: { background: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' },
    inactiveStyle: { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' },
  },
];

function UsagePill({ count, isArtisan }: { count: number; isArtisan: boolean }) {
  const hasUse = count > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: hasUse ? '#f0fdf4' : '#f9fafb',
      color: hasUse ? '#15803d' : '#9ca3af',
    }}>
      {isArtisan ? <User size={10} /> : <Package size={10} />}
      {count}
    </span>
  );
}

export function TaxonomyCrudTab({ type, label }: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AnyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const isCuratorial = type === 'curatorial';
  const hasCraftsCategory = type === 'crafts';
  const showProductCount = PRODUCT_COUNT_TYPES.includes(type);
  const showArtisanCount = ARTISAN_COUNT_TYPES.includes(type);
  const showCount = showProductCount || showArtisanCount;
  const countLabel = showArtisanCount ? 'Artesanos' : 'Productos';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isCuratorial) {
        const data = await getCuratorialCategories();
        setItems(data);
      } else {
        const data = await getAllTaxonomyItems(type as TaxonomyType, {
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          withProductCount: showCount,
        });
        setItems(data);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la lista', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [type, search, statusFilter, isCuratorial, showCount, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (hasCraftsCategory) {
      getAllCategories().then(setCategories).catch(() => {});
    }
  }, [hasCraftsCategory]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSave(data: Record<string, unknown>) {
    if (isCuratorial) {
      if (editTarget) {
        const updated = await updateCuratorialCategory(editTarget.id, data as any);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await createCuratorialCategory(data as any);
        setItems((prev) => [created, ...prev]);
      }
    } else {
      if (editTarget) {
        const updated = await updateTaxonomyItem(type as TaxonomyType, editTarget.id, data as any);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await createTaxonomyItem(type as TaxonomyType, data as any);
        setItems((prev) => [created, ...prev]);
      }
    }
    toast({ title: editTarget ? 'Actualizado' : 'Creado', description: `"${data.name}" guardado correctamente.` });
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (isCuratorial) {
        await deleteCuratorialCategory(deleteTarget.id);
      } else {
        await deleteTaxonomyItem(type as TaxonomyType, deleteTarget.id);
      }
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminado', description: `"${deleteTarget.name}" eliminado.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const filteredItems = isCuratorial || statusFilter === 'all'
    ? items
    : items.filter((x) => (x as TaxonomyItemAdmin).status === statusFilter);

  const displayItems = search && isCuratorial
    ? filteredItems.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()))
    : filteredItems;

  const getUsageCount = (item: AnyItem): number | undefined => {
    const i = item as TaxonomyItemWithCount;
    if (showProductCount) return i.productCount;
    if (showArtisanCount) return i.artisanCount;
    return undefined;
  };

  const approvedCount = items.filter((x) => (x as TaxonomyItemAdmin).status === 'approved').length;
  const pendingCount = items.filter((x) => (x as TaxonomyItemAdmin).status === 'pending').length;

  const extraCols = (showCount ? 1 : 0) + (hasCraftsCategory ? 1 : 0) + (type === 'materials' ? 2 : 0);
  const baseColSpan = isCuratorial ? 2 : 3;
  const totalColSpan = baseColSpan + extraCols + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: "'League Spartan', system-ui, sans-serif" }}>
            {label}
          </h2>
          {!loading && !isCuratorial && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
              {items.length} término{items.length !== 1 ? 's' : ''} · {approvedCount} aprobado{approvedCount !== 1 ? 's' : ''} · {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{
            background: PURPLE, color: 'white', border: 'none',
            borderRadius: 9, padding: '9px 18px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 3px 12px rgba(124,58,237,0.3)',
            fontFamily: "'League Spartan', system-ui, sans-serif",
          }}
        >
          <Plus size={14} /> Nuevo {label.toLowerCase()}
        </button>
      </div>

      {/* Toolbar: search + status pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 160 }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#9ca3af',
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar ${label.toLowerCase()}…`}
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 9,
              fontSize: 13, color: '#374151', outline: 'none',
              fontFamily: "'League Spartan', system-ui, sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>
        {!isCuratorial && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_PILLS.map((pill) => {
              const isActive = statusFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  style={{
                    border: '1.5px solid',
                    borderRadius: 20, padding: '5px 12px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'League Spartan', system-ui, sans-serif",
                    transition: 'all 0.15s',
                    ...(isActive ? pill.activeStyle : pill.inactiveStyle),
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: 14,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              <th style={thStyle}>Nombre</th>
              {!isCuratorial && <th style={thStyle}>Estado</th>}
              {hasCraftsCategory && <th style={thStyle}>Categoría</th>}
              {type === 'materials' && (
                <>
                  <th style={thStyle}>Org.</th>
                  <th style={thStyle}>Sost.</th>
                </>
              )}
              {showCount && <th style={thStyle}>{countLabel}</th>}
              <th style={thStyle}>Creado</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalColSpan} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 13 }}>
                  Cargando…
                </td>
              </tr>
            ) : displayItems.length === 0 ? (
              <tr>
                <td colSpan={totalColSpan} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 13 }}>
                  No hay {label.toLowerCase()}{search ? ` con "${search}"` : ''}
                </td>
              </tr>
            ) : (
              displayItems.map((item) => {
                const taxItem = item as TaxonomyItemWithCount;
                const usageCount = getUsageCount(item);
                const categoryName = hasCraftsCategory && taxItem.categoryId
                  ? categories.find((c) => c.id === taxItem.categoryId)?.name ?? '—'
                  : null;
                const isPending = (taxItem.status) === 'pending';
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f9fafb',
                      background: isPending ? '#fefce8' : 'white',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#111827' }}>{item.name}</td>
                    {!isCuratorial && (
                      <td style={tdStyle}>
                        <TaxonomyStatusBadge status={taxItem.status ?? 'approved'} />
                      </td>
                    )}
                    {hasCraftsCategory && (
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 12 }}>
                        {categoryName ?? '—'}
                      </td>
                    )}
                    {type === 'materials' && (
                      <>
                        <td style={tdStyle}>{taxItem.isOrganic ? '✓' : '—'}</td>
                        <td style={tdStyle}>{taxItem.isSustainable ? '✓' : '—'}</td>
                      </>
                    )}
                    {showCount && (
                      <td style={tdStyle}>
                        {usageCount !== undefined
                          ? <UsagePill count={usageCount} isArtisan={showArtisanCount} />
                          : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>}
                      </td>
                    )}
                    <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 12 }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setEditTarget(item); setModalOpen(true); }}
                          style={btnEditStyle}
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          style={btnDeleteStyle}
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!loading && displayItems.length > 0 && (
          <div style={{
            padding: '8px 16px', borderTop: '1px solid #f3f4f6',
            fontSize: 11, color: '#9ca3af',
          }}>
            {displayItems.length} {label.toLowerCase()}
          </div>
        )}
      </div>

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant={isCuratorial ? 'curatorial' : 'taxonomy'}
        taxonomyType={isCuratorial ? undefined : type as TaxonomyType}
        initialData={editTarget ?? undefined}
        categories={categories}
      />

      <TaxonomyDeleteConfirm
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        usageCount={deleteTarget ? getUsageCount(deleteTarget) : undefined}
        countLabel={countLabel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 10, fontWeight: 800, color: '#9ca3af',
  letterSpacing: 1, textTransform: 'uppercase',
  padding: '8px 12px',
  fontFamily: "'League Spartan', system-ui, sans-serif",
};

const tdStyle: React.CSSProperties = {
  padding: '11px 12px', fontSize: 13, color: '#374151',
  verticalAlign: 'middle',
};

const btnEditStyle: React.CSSProperties = {
  background: '#f3f4f6', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: '#374151',
  display: 'flex', alignItems: 'center',
};

const btnDeleteStyle: React.CSSProperties = {
  background: '#fef2f2', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: '#dc2626',
  display: 'flex', alignItems: 'center',
};
