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

const PURPLE = '#7c3aed';

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

export function TaxonomyTecnicasTab() {
  const { toast } = useToast();
  const [crafts, setCrafts] = useState<TaxonomyItemAdmin[]>([]);
  const [selectedCraftId, setSelectedCraftId] = useState<string>('');
  const [loadingCrafts, setLoadingCrafts] = useState(true);
  const [items, setItems] = useState<TaxonomyItemWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TaxonomyItemAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItemAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAllTaxonomyItems('crafts', { status: 'approved' })
      .then(setCrafts)
      .catch(() => {})
      .finally(() => setLoadingCrafts(false));
  }, []);

  const loadTechniques = useCallback(async () => {
    if (!selectedCraftId) return;
    setLoading(true);
    try {
      const data = await getAllTaxonomyItems('techniques', {
        craftId: selectedCraftId,
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
  }, [selectedCraftId, search, statusFilter, toast]);

  useEffect(() => {
    if (selectedCraftId) loadTechniques();
    else setItems([]);
  }, [selectedCraftId, loadTechniques]);

  useEffect(() => {
    if (!selectedCraftId) return;
    const t = setTimeout(() => loadTechniques(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSave(data: Record<string, unknown>) {
    const payload = { ...data, craftId: selectedCraftId };
    if (editTarget) {
      const updated = await updateTaxonomyItem('techniques', editTarget.id, payload as any);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ title: 'Actualizado', description: `"${updated.name}" guardado.` });
    } else {
      const created = await createTaxonomyItem('techniques', payload as any);
      setItems((prev) => [created, ...prev]);
      toast({ title: 'Creado', description: `"${created.name}" creado.` });
    }
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTaxonomyItem('techniques', deleteTarget.id);
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminado', description: `"${deleteTarget.name}" eliminado.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const selectedCraft = crafts.find((c) => c.id === selectedCraftId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 800, color: '#111827',
            fontFamily: "'League Spartan', system-ui, sans-serif",
          }}>
            Técnicas
          </h2>
          {selectedCraft && !loading && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
              {items.length} técnica{items.length !== 1 ? 's' : ''} en {selectedCraft.name}
            </p>
          )}
        </div>
        {selectedCraftId && (
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
            <Plus size={14} /> Nueva técnica
          </button>
        )}
      </div>

      {/* Craft selector */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '14px 18px',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{
          fontWeight: 700, fontSize: 13, color: '#374151',
          fontFamily: "'League Spartan', system-ui, sans-serif",
        }}>
          Oficio:
        </span>
        <Select
          value={selectedCraftId}
          onValueChange={(v) => { setSelectedCraftId(v); setSearch(''); setStatusFilter('all'); }}
          disabled={loadingCrafts}
        >
          <SelectTrigger style={{ width: 260 }}>
            <SelectValue placeholder={loadingCrafts ? 'Cargando…' : 'Selecciona un oficio'} />
          </SelectTrigger>
          <SelectContent>
            {crafts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCraftId ? (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          color: '#9ca3af', fontSize: 14,
          fontFamily: "'League Spartan', system-ui, sans-serif",
        }}>
          Selecciona un oficio para ver y gestionar sus técnicas
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 160 }}>
              <Search size={14} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: '#9ca3af',
              }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar técnicas…"
                style={{
                  width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 9,
                  fontSize: 13, color: '#374151', outline: 'none',
                  fontFamily: "'League Spartan', system-ui, sans-serif",
                  boxSizing: 'border-box',
                }}
              />
            </div>
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
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Productos</th>
                  <th style={thStyle}>Creado</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: 90 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 13 }}>
                      Cargando…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 13 }}>
                      Sin técnicas{search ? ` con "${search}"` : ` para ${selectedCraft?.name}`}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f9fafb',
                        background: item.status === 'pending' ? '#fefce8' : 'white',
                        transition: 'background 0.1s',
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#111827' }}>{item.name}</td>
                      <td style={tdStyle}>
                        <TaxonomyStatusBadge status={item.status} />
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: (item.productCount ?? 0) > 0 ? '#f0fdf4' : '#f9fafb',
                          color: (item.productCount ?? 0) > 0 ? '#15803d' : '#9ca3af',
                        }}>
                          <Package size={10} />
                          {item.productCount ?? 0}
                        </span>
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
            {!loading && items.length > 0 && (
              <div style={{
                padding: '8px 16px', borderTop: '1px solid #f3f4f6',
                fontSize: 11, color: '#9ca3af',
              }}>
                {items.length} técnica{items.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </>
      )}

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant="taxonomy"
        taxonomyType="techniques"
        initialData={editTarget ? { ...editTarget, craftId: selectedCraftId } : { craftId: selectedCraftId }}
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
