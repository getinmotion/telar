import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const GREEN = '#15803d';

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

  const displayed = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const excludeIds = editTarget ? getDescendantIds(editTarget.id, categories) : [];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar categorías…" style={{ paddingLeft: 32 }} />
        </div>
        <Button onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{ background: GREEN, color: '#fff', gap: 6 }}>
          <Plus size={16} /> Nueva categoría
        </Button>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid rgba(21,128,61,0.12)', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'rgba(21,128,61,0.06)' }}>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Nombre</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Padre</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>SKU</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Orden</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Activa</TableHead>
              <TableHead style={{ width: 80 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>Cargando…</TableCell></TableRow>
            ) : displayed.length === 0 ? (
              <TableRow><TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>No hay categorías{search ? ` con "${search}"` : ''}</TableCell></TableRow>
            ) : (
              displayed.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell style={{ fontWeight: 500 }}>
                    {cat.parentId && <span style={{ color: '#d1d5db', marginRight: 6 }}>└</span>}
                    {cat.name}
                  </TableCell>
                  <TableCell style={{ color: '#6b7280', fontSize: 13 }}>{getParentName(cat.parentId)}</TableCell>
                  <TableCell style={{ color: '#6b7280', fontSize: 13 }}>{cat.skuCode ?? '—'}</TableCell>
                  <TableCell style={{ color: '#6b7280', fontSize: 13 }}>{cat.displayOrder ?? 0}</TableCell>
                  <TableCell>
                    <span style={{
                      borderRadius: 8,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: cat.isActive ? '#dcfce7' : '#f3f4f6',
                      color: cat.isActive ? GREEN : '#6b7280',
                      border: `1px solid ${cat.isActive ? '#bbf7d0' : '#d1d5db'}`,
                    }}>
                      {cat.isActive ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => { setEditTarget(cat); setModalOpen(true); }} style={{ padding: '4px 8px' }}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(cat)} style={{ padding: '4px 8px', color: '#dc2626' }}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && displayed.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#9ca3af' }}>
            {displayed.length} categoría{displayed.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

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
