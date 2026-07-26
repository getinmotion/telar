import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/services/categories.actions';
import { TaxonomyStatusBadge } from './TaxonomyStatusBadge';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';
import { GRAY_50, GRAY_100, GRAY_200, GRAY_400, GRAY_500, GRAY_700, GRAY_900 } from '@/components/dashboard/dashboardStyles';

/**
 * TaxonomyManager — componente genérico ÚNICO para administrar cualquier taxonomía.
 *
 * Reemplaza a TaxonomyCrudTab + TaxonomyTecnicasTab + TaxonomyCategoriasTab: todos
 * los tipos (oficios, técnicas, materiales, estilos, herramientas, categorías
 * curatoriales y categorías/subcategorías) se ven y operan igual — misma tabla,
 * misma toolbar — y cada uno muestra la DEPENDENCIA (padre) a la que pertenece.
 * Los tipos planos (materiales/estilos/herramientas/curatoriales) muestran "Global".
 */

export type TaxonomyManagerKind = 'taxonomy' | 'curatorial' | 'category';
export type ParentKind = 'category' | 'craft' | 'categorySelf' | 'global';

export interface TaxonomyManagerConfig {
  kind: TaxonomyManagerKind;
  label: string;
  singular: string;
  taxonomyType?: TaxonomyType;          // requerido cuando kind === 'taxonomy'
  parent: ParentKind;                   // dependencia mostrada en la columna "Depende de"
  count?: 'product' | 'artisan';        // columna de uso (solo taxonomy)
  scope?: 'root' | 'sub';               // solo category: independientes (raíz) vs subcategorías
}

const PURPLE = 'hsl(var(--domain-business))';

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

const STATUS_PILLS: { value: StatusFilter; label: string; activeStyle: React.CSSProperties; inactiveStyle: React.CSSProperties }[] = [
  { value: 'all', label: 'Todos', activeStyle: { background: GRAY_900, color: 'white', borderColor: GRAY_900 }, inactiveStyle: { background: 'white', color: GRAY_700, borderColor: GRAY_200 } },
  { value: 'approved', label: '✓ Aprobados', activeStyle: { background: '#dcfce7', color: 'hsl(var(--domain-moderation))', borderColor: '#bbf7d0' }, inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 } },
  { value: 'pending', label: '⏳ Pendientes', activeStyle: { background: '#fef9c3', color: '#a16207', borderColor: '#fde68a' }, inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 } },
  { value: 'rejected', label: '✗ Rechazados', activeStyle: { background: '#fee2e2', color: 'hsl(var(--status-error))', borderColor: '#fecaca' }, inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 } },
];

// Fila genérica: unión laxa de los tres modelos, se accede por campo opcional.
type Row = TaxonomyItemWithCount & Category & CuratorialCategory;

const PARENT_LABEL: Record<ParentKind, string> = {
  category: 'Categoría',
  craft: 'Oficio',
  categorySelf: 'Categoría padre',
  global: 'Depende de',
};

function UsagePill({ count, isArtisan }: { count: number; isArtisan: boolean }) {
  const hasUse = count > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: hasUse ? '#f0fdf4' : GRAY_50, color: hasUse ? 'hsl(var(--domain-moderation))' : GRAY_400,
    }}>
      {isArtisan ? <User size={10} /> : <Package size={10} />}
      {count}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', background: 'hsl(var(--domain-business) / 0.08)', color: PURPLE,
      borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

export function TaxonomyManager({ config }: { config: TaxonomyManagerConfig }) {
  const { kind, label, singular, taxonomyType, parent, count, scope } = config;
  const { toast } = useToast();

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auxiliares para resolver la dependencia (padre) y alimentar el modal.
  const [categories, setCategories] = useState<Category[]>([]);
  const [crafts, setCrafts] = useState<TaxonomyItemAdmin[]>([]);

  const isTaxonomy = kind === 'taxonomy';
  const isCategory = kind === 'category';
  const isCuratorial = kind === 'curatorial';
  const showStatus = isTaxonomy;
  const showMaterialCols = isTaxonomy && taxonomyType === 'materials';
  const countLabel = count === 'artisan' ? 'Artesanos' : 'Productos';
  // El filtro/búsqueda de taxonomy es server-side; category/curatorial es client-side.
  const serverFiltered = isTaxonomy;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isCuratorial) {
        setItems((await getCuratorialCategories()) as Row[]);
      } else if (isCategory) {
        const data = await getAllCategories();
        data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
        setItems(data as Row[]);
      } else {
        const data = await getAllTaxonomyItems(taxonomyType as TaxonomyType, {
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          withProductCount: !!count,
        });
        setItems(data as Row[]);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la lista', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [isCuratorial, isCategory, taxonomyType, search, statusFilter, count, toast]);

  useEffect(() => { load(); }, [load]);

  // Debounce de la búsqueda server-side (solo taxonomy).
  useEffect(() => {
    if (!serverFiltered) return;
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar categorías (padre de oficios) o oficios (padre de técnicas) para columnas/filtro/modal.
  useEffect(() => {
    if (parent === 'category') getAllCategories().then(setCategories).catch(() => {});
    if (parent === 'craft') getAllTaxonomyItems('crafts', { status: 'approved' }).then(setCrafts).catch(() => {});
  }, [parent]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const craftMap = useMemo(() => new Map(crafts.map((c) => [c.id, c.name])), [crafts]);
  const selfMap = useMemo(() => new Map(items.map((i) => [i.id, i.name])), [items]);

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  async function handleSave(data: Record<string, unknown>) {
    try {
      if (isCuratorial) {
        if (editTarget) {
          const u = await updateCuratorialCategory(editTarget.id, data as any);
          setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...u } as Row : x)));
        } else {
          const c = await createCuratorialCategory(data as any);
          setItems((prev) => [c as Row, ...prev]);
        }
      } else if (isCategory) {
        if (editTarget) {
          const u = await updateCategory(editTarget.id, data as any);
          setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...u } as Row : x)));
        } else {
          const c = await createCategory(data as any);
          setItems((prev) => [...prev, c as Row].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        }
      } else {
        if (editTarget) {
          const u = await updateTaxonomyItem(taxonomyType as TaxonomyType, editTarget.id, data as any);
          setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...u } as Row : x)));
        } else {
          const c = await createTaxonomyItem(taxonomyType as TaxonomyType, data as any);
          setItems((prev) => [c as Row, ...prev]);
        }
      }
      toast({ title: editTarget ? 'Actualizado' : 'Creado', description: `"${data.name}" guardado correctamente.` });
      setEditTarget(null);
    } catch (err: any) {
      // Surface el error real (antes el modal lo tragaba en silencio → "no funciona").
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
      toast({ title: 'No se pudo guardar', description: Array.isArray(msg) ? msg.join(', ') : String(msg), variant: 'destructive' });
      throw err; // el modal permanece abierto
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (isCuratorial) await deleteCuratorialCategory(deleteTarget.id);
      else if (isCategory) await deleteCategory(deleteTarget.id);
      else await deleteTaxonomyItem(taxonomyType as TaxonomyType, deleteTarget.id);
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminado', description: `"${deleteTarget.name}" eliminado.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar (puede tener hijos o usos vinculados)', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ─── Dependencia (padre) ──────────────────────────────────────────────────────
  const renderParent = (item: Row): React.ReactNode => {
    if (parent === 'global') return <span style={{ color: GRAY_400, fontSize: 12 }}>Global</span>;
    if (parent === 'category') {
      return item.categoryId ? <Chip>{categoryMap.get(item.categoryId) ?? '—'}</Chip> : <span style={{ color: GRAY_400 }}>—</span>;
    }
    if (parent === 'categorySelf') {
      return item.parentId ? <Chip>{selfMap.get(item.parentId) ?? '—'}</Chip> : <span style={{ color: GRAY_400 }}>—</span>;
    }
    // craft (técnicas): puede tener varios oficios
    const ids = item.craftIds?.length ? item.craftIds : item.craftId ? [item.craftId] : [];
    if (!ids.length) return <span style={{ color: GRAY_400 }}>—</span>;
    return <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{ids.map((id) => <Chip key={id}>{craftMap.get(id) ?? id}</Chip>)}</div>;
  };

  // Opciones del filtro por dependencia.
  const parentOptions = useMemo(() => {
    if (parent === 'category') return categories.map((c) => ({ id: c.id, name: c.name }));
    if (parent === 'craft') return crafts.map((c) => ({ id: c.id, name: c.name }));
    if (parent === 'categorySelf') return items.filter((i) => !i.parentId).map((c) => ({ id: c.id, name: c.name }));
    return [];
  }, [parent, categories, crafts, items]);

  const matchesParent = (item: Row): boolean => {
    if (parentFilter === 'all' || parent === 'global') return true;
    if (parent === 'category') return item.categoryId === parentFilter;
    if (parent === 'categorySelf') return item.parentId === parentFilter;
    const ids = item.craftIds?.length ? item.craftIds : item.craftId ? [item.craftId] : [];
    return ids.includes(parentFilter);
  };

  // ─── Filtrado en cliente ───────────────────────────────────────────────────────
  const displayItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((it) => {
      if (scope === 'root' && it.parentId) return false;
      if (scope === 'sub' && !it.parentId) return false;
      if (!serverFiltered && q && !it.name.toLowerCase().includes(q)) return false;
      if (!serverFiltered && statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (!matchesParent(it)) return false;
      return true;
    });
  }, [items, search, statusFilter, parentFilter, serverFiltered, parent, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const approvedCount = items.filter((x) => x.status === 'approved').length;
  const pendingCount = items.filter((x) => x.status === 'pending').length;

  const excludeIds = isCategory && editTarget ? getDescendantIds(editTarget.id, items as Category[]) : [];

  // Columnas dinámicas → colSpan del estado vacío.
  const colCount = 1 /*nombre*/ + 1 /*depende*/ + (showStatus ? 1 : 0)
    + (showMaterialCols ? 2 : 0) + (count ? 1 : 0)
    + (isCategory ? 3 : 0) /*sku/orden/activa*/ + 1 /*creado*/ + 1 /*acciones*/;

  const modalVariant = isCuratorial ? 'curatorial' : isCategory ? 'category' : 'taxonomy';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: GRAY_900, fontFamily: "'League Spartan', system-ui, sans-serif" }}>
            {label}
          </h2>
          {!loading && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: GRAY_400 }}>
              {isCategory
                ? `${displayItems.length} ${displayItems.length === 1 ? singular.toLowerCase() : label.toLowerCase()}`
                : isCuratorial
                ? `${items.length} categoría${items.length !== 1 ? 's' : ''}`
                : `${items.length} término${items.length !== 1 ? 's' : ''} · ${approvedCount} aprobado${approvedCount !== 1 ? 's' : ''} · ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{
            background: PURPLE, color: 'white', border: 'none', borderRadius: 9, padding: '9px 18px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 3px 12px hsl(var(--domain-business) / 0.3)', fontFamily: "'League Spartan', system-ui, sans-serif",
          }}
        >
          <Plus size={14} /> Nuevo {singular.toLowerCase()}
        </button>
      </div>

      {/* Toolbar: búsqueda + filtro de dependencia + estado */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: GRAY_400 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar ${label.toLowerCase()}…`}
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'white', border: `1px solid ${GRAY_200}`, borderRadius: 9,
              fontSize: 13, color: GRAY_700, outline: 'none',
              fontFamily: "'League Spartan', system-ui, sans-serif", boxSizing: 'border-box',
            }}
          />
        </div>

        {parent !== 'global' && parentOptions.length > 0 && (
          <select
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
            style={{
              height: 37, background: 'white', border: `1px solid ${GRAY_200}`, borderRadius: 9,
              padding: '0 10px', fontSize: 12, color: GRAY_700, outline: 'none',
              fontFamily: "'League Spartan', system-ui, sans-serif", cursor: 'pointer',
            }}
          >
            <option value="all">Todas las {PARENT_LABEL[parent].toLowerCase()}s</option>
            {parentOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        {showStatus && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_PILLS.map((pill) => {
              const isActive = statusFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value)}
                  style={{
                    border: '1.5px solid', borderRadius: 20, padding: '5px 12px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'League Spartan', system-ui, sans-serif", transition: 'all 0.15s',
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

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${GRAY_200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${GRAY_100}` }}>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>{PARENT_LABEL[parent]}</th>
              {showStatus && <th style={thStyle}>Estado</th>}
              {showMaterialCols && (<><th style={thStyle}>Org.</th><th style={thStyle}>Sost.</th></>)}
              {count && <th style={thStyle}>{countLabel}</th>}
              {isCategory && (<><th style={thStyle}>SKU</th><th style={thStyle}>Orden</th><th style={thStyle}>Activa</th></>)}
              <th style={thStyle}>Creado</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colCount} style={{ textAlign: 'center', color: GRAY_400, padding: '40px 0', fontSize: 13 }}>Cargando…</td></tr>
            ) : displayItems.length === 0 ? (
              <tr><td colSpan={colCount} style={{ textAlign: 'center', color: GRAY_400, padding: '40px 0', fontSize: 13 }}>No hay {label.toLowerCase()}{search ? ` con "${search}"` : ''}</td></tr>
            ) : (
              displayItems.map((item) => {
                const isPending = item.status === 'pending';
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${GRAY_50}`, background: isPending ? '#fefce8' : 'white', transition: 'background 0.1s' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: GRAY_900 }}>{item.name}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{renderParent(item)}</td>
                    {showStatus && <td style={tdStyle}><TaxonomyStatusBadge status={item.status ?? 'approved'} /></td>}
                    {showMaterialCols && (<><td style={tdStyle}>{item.isOrganic ? '✓' : '—'}</td><td style={tdStyle}>{item.isSustainable ? '✓' : '—'}</td></>)}
                    {count && (
                      <td style={tdStyle}>
                        {(() => {
                          const c = count === 'artisan' ? item.artisanCount : item.productCount;
                          return c !== undefined ? <UsagePill count={c} isArtisan={count === 'artisan'} /> : <span style={{ color: GRAY_400, fontSize: 12 }}>—</span>;
                        })()}
                      </td>
                    )}
                    {isCategory && (
                      <>
                        <td style={{ ...tdStyle, color: GRAY_500, fontSize: 12, fontFamily: 'monospace' }}>{item.skuCode ?? '—'}</td>
                        <td style={{ ...tdStyle, color: GRAY_400, fontSize: 12 }}>{item.displayOrder ?? 0}</td>
                        <td style={tdStyle}>
                          <span style={{ borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700, background: item.isActive ? '#dcfce7' : GRAY_100, color: item.isActive ? 'hsl(var(--domain-moderation))' : GRAY_500 }}>
                            {item.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                      </>
                    )}
                    <td style={{ ...tdStyle, color: GRAY_400, fontSize: 12 }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditTarget(item); setModalOpen(true); }} style={btnEditStyle} title="Editar"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(item)} style={btnDeleteStyle} title="Eliminar"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!loading && displayItems.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${GRAY_100}`, fontSize: 11, color: GRAY_400 }}>
            {displayItems.length} {label.toLowerCase()}
          </div>
        )}
      </div>

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant={modalVariant}
        taxonomyType={isTaxonomy ? taxonomyType : undefined}
        initialData={editTarget ?? undefined}
        crafts={crafts}
        categories={isCategory ? (items as Category[]) : categories}
        excludeCategoryIds={excludeIds}
      />

      <TaxonomyDeleteConfirm
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        usageCount={count ? (count === 'artisan' ? deleteTarget?.artisanCount : deleteTarget?.productCount) : undefined}
        countLabel={countLabel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function getDescendantIds(id: string, all: Category[]): string[] {
  const children = all.filter((c) => c.parentId === id);
  return [id, ...children.flatMap((c) => getDescendantIds(c.id, all))];
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 10, fontWeight: 800, color: GRAY_400,
  letterSpacing: 1, textTransform: 'uppercase', padding: '8px 12px',
  fontFamily: "'League Spartan', system-ui, sans-serif",
};
const tdStyle: React.CSSProperties = { padding: '11px 12px', fontSize: 13, color: GRAY_700, verticalAlign: 'middle' };
const btnEditStyle: React.CSSProperties = { background: GRAY_100, border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: GRAY_700, display: 'flex', alignItems: 'center' };
const btnDeleteStyle: React.CSSProperties = { background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'hsl(var(--status-error))', display: 'flex', alignItems: 'center' };
