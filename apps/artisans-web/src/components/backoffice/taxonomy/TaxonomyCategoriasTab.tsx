import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/services/categories.actions';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';
<<<<<<< HEAD

const PURPLE = '#7c3aed';
=======
import { GRAY_100, GRAY_400, GRAY_500, GRAY_700, GRAY_900, GRAY_200, GRAY_50 } from '@/components/dashboard/dashboardStyles';

const PURPLE = 'hsl(var(--domain-business))';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

function getDescendantIds(id: string, all: Category[]): string[] {
  const children = all.filter((c) => c.parentId === id);
  return [id, ...children.flatMap((c) => getDescendantIds(c.id, all))];
}

export function TaxonomyCategoriasTab() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
      setCategories(data);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar las categorías', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function getParentName(parentId?: string | null) {
    if (!parentId) return '—';
    return categories.find((c) => c.id === parentId)?.name ?? '—';
  }

  async function handleSave(data: Record<string, unknown>) {
    if (editTarget) {
      const updated = await updateCategory(editTarget.id, data as any);
      setCategories((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ title: 'Actualizado', description: `"${updated.name}" guardado.` });
    } else {
      const created = await createCategory(data as any);
      setCategories((prev) => [...prev, created].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
      toast({ title: 'Creada', description: `"${created.name}" creada.` });
    }
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminada', description: `"${deleteTarget.name}" eliminada.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar (puede tener hijos o productos vinculados)', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const filtered = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const roots = filtered.filter((c) => !c.parentId);
  const subs = filtered.filter((c) => !!c.parentId);

  const excludeIds = editTarget ? getDescendantIds(editTarget.id, categories) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
<<<<<<< HEAD
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: "'League Spartan', system-ui, sans-serif" }}>
            Categorías
          </h2>
          {!loading && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
=======
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: GRAY_900, fontFamily: "'League Spartan', system-ui, sans-serif" }}>
            Categorías
          </h2>
          {!loading && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: GRAY_400 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
              {roots.length} categoría{roots.length !== 1 ? 's' : ''} · {subs.length} subcategoría{subs.length !== 1 ? 's' : ''}
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
<<<<<<< HEAD
            boxShadow: '0 3px 12px rgba(124,58,237,0.3)',
=======
            boxShadow: '0 3px 12px hsl(var(--domain-business) / 0.3)',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            fontFamily: "'League Spartan', system-ui, sans-serif",
          }}
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
<<<<<<< HEAD
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
=======
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: GRAY_400 }} />
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categorías…"
          style={{
            width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
<<<<<<< HEAD
            background: 'white', border: '1px solid #e5e7eb', borderRadius: 9,
            fontSize: 13, color: '#374151', outline: 'none',
=======
            background: 'white', border: `1px solid ${GRAY_200}`, borderRadius: 9,
            fontSize: 13, color: GRAY_700, outline: 'none',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            fontFamily: "'League Spartan', system-ui, sans-serif",
            boxSizing: 'border-box',
          }}
        />
      </div>

      {loading ? (
<<<<<<< HEAD
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>Cargando…</div>
=======
        <div style={{ textAlign: 'center', padding: '40px 0', color: GRAY_400, fontSize: 13 }}>Cargando…</div>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Categorías raíz */}
          <Section
            title="Categorías"
            subtitle={`${roots.length} en total`}
<<<<<<< HEAD
            color="#7c3aed"
=======
            color="hsl(var(--domain-business))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            items={roots}
            showParent={false}
            getParentName={getParentName}
            onEdit={(cat) => { setEditTarget(cat); setModalOpen(true); }}
            onDelete={setDeleteTarget}
            search={search}
          />

          {/* Subcategorías */}
          <Section
            title="Subcategorías"
            subtitle={`${subs.length} en total`}
<<<<<<< HEAD
            color="#0369a1"
=======
            color="hsl(var(--status-info))"
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            items={subs}
            showParent={true}
            getParentName={getParentName}
            onEdit={(cat) => { setEditTarget(cat); setModalOpen(true); }}
            onDelete={setDeleteTarget}
            search={search}
          />
        </div>
      )}

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant="category"
        initialData={editTarget ?? undefined}
        categories={categories}
        excludeCategoryIds={excludeIds}
      />

      <TaxonomyDeleteConfirm
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  subtitle: string;
  color: string;
  items: Category[];
  showParent: boolean;
  getParentName: (id?: string | null) => string;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  search: string;
}

function Section({ title, subtitle, color, items, showParent, getParentName, onEdit, onDelete }: SectionProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{
          fontSize: 13, fontWeight: 800, color,
          fontFamily: "'League Spartan', system-ui, sans-serif",
        }}>
          {title}
        </span>
<<<<<<< HEAD
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{subtitle}</span>
      </div>

      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#9ca3af', fontSize: 13 }}>
=======
        <span style={{ fontSize: 11, color: GRAY_400 }}>{subtitle}</span>
      </div>

      <div style={{
        background: 'white', borderRadius: 14, border: `1px solid ${GRAY_200}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: GRAY_400, fontSize: 13 }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
            Sin {title.toLowerCase()}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
<<<<<<< HEAD
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
=======
              <tr style={{ borderBottom: `2px solid ${GRAY_100}` }}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                <th style={thStyle}>Nombre</th>
                {showParent && <th style={thStyle}>Categoría padre</th>}
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Orden</th>
                <th style={thStyle}>Activa</th>
                <th style={{ ...thStyle, textAlign: 'right', width: 90 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat) => (
<<<<<<< HEAD
                <tr key={cat.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.1s' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#111827' }}>{cat.name}</td>
                  {showParent && (
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: 12 }}>{getParentName(cat.parentId)}</td>
                  )}
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{cat.skuCode ?? '—'}</td>
                  <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 12 }}>{cat.displayOrder ?? 0}</td>
                  <td style={tdStyle}>
                    <span style={{
                      borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                      background: cat.isActive ? '#dcfce7' : '#f3f4f6',
                      color: cat.isActive ? '#15803d' : '#6b7280',
=======
                <tr key={cat.id} style={{ borderBottom: `1px solid ${GRAY_50}`, transition: 'background 0.1s' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: GRAY_900 }}>{cat.name}</td>
                  {showParent && (
                    <td style={{ ...tdStyle, color: GRAY_500, fontSize: 12 }}>{getParentName(cat.parentId)}</td>
                  )}
                  <td style={{ ...tdStyle, color: GRAY_500, fontSize: 12, fontFamily: 'monospace' }}>{cat.skuCode ?? '—'}</td>
                  <td style={{ ...tdStyle, color: GRAY_400, fontSize: 12 }}>{cat.displayOrder ?? 0}</td>
                  <td style={tdStyle}>
                    <span style={{
                      borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                      background: cat.isActive ? '#dcfce7' : GRAY_100,
                      color: cat.isActive ? 'hsl(var(--domain-moderation))' : GRAY_500,
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                    }}>
                      {cat.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button onClick={() => onEdit(cat)} style={btnEditStyle} title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => onDelete(cat)} style={btnDeleteStyle} title="Eliminar"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
<<<<<<< HEAD
  textAlign: 'left', fontSize: 10, fontWeight: 800, color: '#9ca3af',
=======
  textAlign: 'left', fontSize: 10, fontWeight: 800, color: GRAY_400,
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
  letterSpacing: 1, textTransform: 'uppercase', padding: '8px 12px',
  fontFamily: "'League Spartan', system-ui, sans-serif",
};
const tdStyle: React.CSSProperties = {
<<<<<<< HEAD
  padding: '11px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle',
};
const btnEditStyle: React.CSSProperties = {
  background: '#f3f4f6', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center',
};
const btnDeleteStyle: React.CSSProperties = {
  background: '#fef2f2', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center',
=======
  padding: '11px 12px', fontSize: 13, color: GRAY_700, verticalAlign: 'middle',
};
const btnEditStyle: React.CSSProperties = {
  background: GRAY_100, border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: GRAY_700, display: 'flex', alignItems: 'center',
};
const btnDeleteStyle: React.CSSProperties = {
  background: '#fef2f2', border: 'none', borderRadius: 6,
  padding: '5px 8px', cursor: 'pointer', color: 'hsl(var(--status-error))', display: 'flex', alignItems: 'center',
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
};
