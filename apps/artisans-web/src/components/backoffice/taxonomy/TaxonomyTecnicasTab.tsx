import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getAllTaxonomyItems,
  createTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type TaxonomyItemAdmin,
  type TaxonomyItemWithCount,
} from '@/services/taxonomy.actions';
import { TaxonomyStatusBadge } from './TaxonomyStatusBadge';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';
import { GRAY_50, GRAY_100, GRAY_200, GRAY_400, GRAY_500, GRAY_700, GRAY_900 } from '@/components/dashboard/dashboardStyles';

const PURPLE = 'hsl(var(--domain-business))';

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

const STATUS_PILLS: {
  value: StatusFilter;
  label: string;
  activeStyle: React.CSSProperties;
  inactiveStyle: React.CSSProperties;
}[] = [
  {
    value: 'all',
    label: 'Todos',
    activeStyle: { background: GRAY_900, color: 'white', borderColor: GRAY_900 },
    inactiveStyle: { background: 'white', color: GRAY_700, borderColor: GRAY_200 },
  },
  {
    value: 'approved',
    label: '✓ Aprobados',
    activeStyle: { background: '#dcfce7', color: 'hsl(var(--domain-moderation))', borderColor: '#bbf7d0' },
    inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 },
  },
  {
    value: 'pending',
    label: '⏳ Pendientes',
    activeStyle: { background: '#fef9c3', color: '#a16207', borderColor: '#fde68a' },
    inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 },
  },
  {
    value: 'rejected',
    label: '✗ Rechazados',
    activeStyle: { background: '#fee2e2', color: 'hsl(var(--status-error))', borderColor: '#fecaca' },
    inactiveStyle: { background: 'white', color: GRAY_500, borderColor: GRAY_200 },
  },
];

export function TaxonomyTecnicasTab() {
  const { toast } = useToast();

  const [crafts, setCrafts] = useState<TaxonomyItemAdmin[]>([]);
  const [craftFilter, setCraftFilter] = useState<string>('all');

  const [items, setItems] = useState<TaxonomyItemWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TaxonomyItemAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItemAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllTaxonomyItems('crafts', { status: 'approved' })
      .then(setCrafts)
      .catch(() => {});
  }, []);

  const craftMap = React.useMemo(
    () => new Map(crafts.map((c) => [c.id, c.name])),
    [crafts],
  );

  const loadTechniques = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTaxonomyItems('techniques', {
        craftId: craftFilter !== 'all' ? craftFilter : undefined,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        withProductCount: true,
      });
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar las técnicas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [craftFilter, search, statusFilter, toast]);

  useEffect(() => { loadTechniques(); }, [loadTechniques]);

  useEffect(() => {
    const t = setTimeout(() => loadTechniques(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSave(data: Record<string, unknown>) {
    const payload = { ...data };
    if (editTarget) {
      const updated = await updateTaxonomyItem('techniques', editTarget.id, payload as any);
      setItems((prev) => prev.map((x) => (x.id === updated.id
        ? { ...updated, productCount: (x as TaxonomyItemWithCount).productCount }
        : x)));
      toast({ title: 'Actualizado', description: `"${updated.name}" guardado.` });
    } else {
      const created = await createTaxonomyItem('techniques', payload as any);
      setItems((prev) => [{
        ...created,
        productCount: 0,
        craftIds: (payload.craftIds as string[]) ?? [],
      }, ...prev]);
      toast({ title: 'Creada', description: `"${created.name}" creada.` });
    }
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTaxonomyItem('techniques', deleteTarget.id);
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminada', description: `"${deleteTarget.name}" eliminada.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 800, color: GRAY_900,
            fontFamily: "'League Spartan', system-ui, sans-serif",
          }}>
            Técnicas
          </h2>
          {!loading && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: GRAY_400 }}>
              {items.length} técnica{items.length !== 1 ? 's' : ''}
              {craftFilter !== 'all' && craftMap.get(craftFilter)
                ? ` en ${craftMap.get(craftFilter)}`
                : ' en todos los oficios'}
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
            boxShadow: '0 3px 12px hsl(var(--domain-business) / 0.3)',
            fontFamily: "'League Spartan', system-ui, sans-serif",
          }}
        >
          <Plus size={14} /> Nueva técnica
        </button>
      </div>

      {/* Toolbar: search + craft filter + status pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: GRAY_400,
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar técnicas…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'white', border: `1px solid ${GRAY_200}`, borderRadius: 9,
              fontSize: 13, color: GRAY_700, outline: 'none',
              fontFamily: "'League Spartan', system-ui, sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>

        <Select value={craftFilter} onValueChange={setCraftFilter}>
          <SelectTrigger style={{ width: 200, background: 'white' }}>
            <SelectValue placeholder="Todos los oficios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los oficios</SelectItem>
            {crafts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: 14,
        border: `1px solid ${GRAY_200}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${GRAY_100}` }}>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Oficio</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Productos</th>
              <th style={thStyle}>Creado</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: GRAY_400, padding: '40px 0', fontSize: 13 }}>
                  Cargando…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: GRAY_400, padding: '40px 0', fontSize: 13 }}>
                  Sin técnicas{search ? ` con "${search}"` : ''}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: `1px solid ${GRAY_50}`,
                    background: item.status === 'pending' ? '#fefce8' : 'white',
                    transition: 'background 0.1s',
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 700, color: GRAY_900 }}>{item.name}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    {(() => {
                      const ids = item.craftIds?.length
                        ? item.craftIds
                        : item.craftId ? [item.craftId] : [];
                      if (!ids.length) return <span style={{ color: GRAY_400 }}>—</span>;
                      return (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {ids.map((cid) => (
                            <span key={cid} style={{
                              display: 'inline-block',
                              background: 'hsl(var(--domain-business) / 0.08)',
                              color: PURPLE,
                              borderRadius: 20,
                              padding: '2px 9px',
                              fontSize: 11,
                              fontWeight: 700,
                            }}>
                              {craftMap.get(cid) ?? cid}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td style={tdStyle}>
                    <TaxonomyStatusBadge status={item.status} />
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: (item.productCount ?? 0) > 0 ? '#f0fdf4' : GRAY_50,
                      color: (item.productCount ?? 0) > 0 ? 'hsl(var(--domain-moderation))' : GRAY_400,
                    }}>
                      <Package size={10} />
                      {item.productCount ?? 0}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: GRAY_400, fontSize: 12 }}>
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
              ))
            )}
          </tbody>
        </table>
        {!loading && items.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${GRAY_100}`, fontSize: 11, color: GRAY_400 }}>
            {items.length} técnica{items.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant="taxonomy"
        taxonomyType="techniques"
        initialData={editTarget ?? undefined}
        crafts={crafts}
      />

      <TaxonomyDeleteConfirm
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        usageCount={deleteTarget?.productCount}
        countLabel="Productos"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 10, fontWeight: 800, color: GRAY_400,
  letterSpacing: 1, textTransform: 'uppercase', padding: '8px 12px',
  fontFamily: "'League Spartan', system-ui, sans-serif",
};
const tdStyle: React.CSSProperties = {
  padding: '11px 12px', fontSize: 13, color: GRAY_700, verticalAlign: 'middle',
};
const btnEditStyle: React.CSSProperties = {
  background: GRAY_100, border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: GRAY_700, display: 'flex', alignItems: 'center',
};
const btnDeleteStyle: React.CSSProperties = {
  background: '#fef2f2', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: 'hsl(var(--status-error))', display: 'flex', alignItems: 'center',
};
