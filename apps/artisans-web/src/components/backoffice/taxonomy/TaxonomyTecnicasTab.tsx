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
  type TaxonomyItemAdmin,
} from '@/services/taxonomy.actions';
import { TaxonomyStatusBadge } from './TaxonomyStatusBadge';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';

const GREEN = '#15803d';

export function TaxonomyTecnicasTab() {
  const { toast } = useToast();
  const [crafts, setCrafts] = useState<TaxonomyItemAdmin[]>([]);
  const [selectedCraftId, setSelectedCraftId] = useState<string>('');
  const [loadingCrafts, setLoadingCrafts] = useState(true);
  const [items, setItems] = useState<TaxonomyItemAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // Debounce search
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
    <div>
      {/* Craft selector */}
      <div
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: '1px solid rgba(21,128,61,0.15)',
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600, fontSize: 14, color: '#374151' }}>
          Oficio:
        </span>
        <Select value={selectedCraftId} onValueChange={(v) => { setSelectedCraftId(v); setSearch(''); setStatusFilter('all'); }} disabled={loadingCrafts}>
          <SelectTrigger style={{ width: 260 }}>
            <SelectValue placeholder={loadingCrafts ? 'Cargando…' : 'Selecciona un oficio'} />
          </SelectTrigger>
          <SelectContent>
            {crafts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCraft && (
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {items.length} técnica{items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!selectedCraftId ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontFamily: "'League Spartan', sans-serif", fontSize: 15 }}>
          Selecciona un oficio para ver y gestionar sus técnicas
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar técnicas…" style={{ paddingLeft: 32 }} />
            </div>
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
            <Button onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{ background: GREEN, color: '#fff', gap: 6 }}>
              <Plus size={16} /> Nueva técnica
            </Button>
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid rgba(21,128,61,0.12)', overflow: 'hidden' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: 'rgba(21,128,61,0.06)' }}>
                  <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Nombre</TableHead>
                  <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Estado</TableHead>
                  <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Creado</TableHead>
                  <TableHead style={{ width: 80 }} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>Cargando…</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>Sin técnicas{search ? ` con "${search}"` : ` para ${selectedCraft?.name}`}</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell><TaxonomyStatusBadge status={item.status} /></TableCell>
                      <TableCell style={{ color: '#9ca3af', fontSize: 13 }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : '—'}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => { setEditTarget(item); setModalOpen(true); }} style={{ padding: '4px 8px' }}><Pencil size={14} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)} style={{ padding: '4px 8px', color: '#dc2626' }}><Trash2 size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
