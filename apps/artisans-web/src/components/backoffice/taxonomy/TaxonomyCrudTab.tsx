import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  getAllTaxonomyItems,
  createTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type TaxonomyType,
  type TaxonomyItemAdmin,
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

type AnyItem = TaxonomyItemAdmin | CuratorialCategory;

const GREEN = '#15803d';

export function TaxonomyCrudTab({ type, label }: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AnyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const isCuratorial = type === 'curatorial';
  const hasCraftsCategory = type === 'crafts';

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
        });
        setItems(data);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la lista', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [type, search, statusFilter, isCuratorial, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (hasCraftsCategory) {
      getAllCategories().then(setCategories).catch(() => {});
    }
  }, [hasCraftsCategory]);

  // Debounce search
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

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar ${label.toLowerCase()}…`}
            style={{ paddingLeft: 32 }}
          />
        </div>
        {!isCuratorial && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger style={{ width: 160 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          style={{ background: GREEN, color: '#fff', gap: 6 }}
        >
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid rgba(21,128,61,0.12)', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'rgba(21,128,61,0.06)' }}>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Nombre</TableHead>
              {!isCuratorial && (
                <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Estado</TableHead>
              )}
              {type === 'materials' && (
                <>
                  <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Org.</TableHead>
                  <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Sost.</TableHead>
                </>
              )}
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Creado</TableHead>
              <TableHead style={{ width: 80 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                  Cargando…
                </TableCell>
              </TableRow>
            ) : displayItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                  No hay {label.toLowerCase()} {search ? `con "${search}"` : ''}
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((item) => {
                const taxItem = item as TaxonomyItemAdmin;
                return (
                  <TableRow key={item.id}>
                    <TableCell style={{ fontWeight: 500 }}>{item.name}</TableCell>
                    {!isCuratorial && (
                      <TableCell>
                        <TaxonomyStatusBadge status={taxItem.status ?? 'approved'} />
                      </TableCell>
                    )}
                    {type === 'materials' && (
                      <>
                        <TableCell>{taxItem.isOrganic ? '✓' : '—'}</TableCell>
                        <TableCell>{taxItem.isSustainable ? '✓' : '—'}</TableCell>
                      </>
                    )}
                    <TableCell style={{ color: '#9ca3af', fontSize: 13 }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : '—'}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditTarget(item); setModalOpen(true); }}
                          style={{ padding: '4px 8px' }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          style={{ padding: '4px 8px', color: '#dc2626' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {!loading && displayItems.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#9ca3af' }}>
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
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
