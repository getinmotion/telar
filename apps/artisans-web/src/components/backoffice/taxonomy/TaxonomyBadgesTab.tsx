import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getBadges, createBadge, updateBadge, deleteBadge, type TaxonomyBadge } from '@/services/badges.actions';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';
import { TaxonomyItemFormModal } from './TaxonomyItemFormModal';

const GREEN = '#15803d';

export function TaxonomyBadgesTab() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<TaxonomyBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TaxonomyBadge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyBadge | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getBadges()
      .then(setBadges)
      .catch(() => toast({ title: 'Error', description: 'No se pudo cargar los badges', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(data: Record<string, unknown>) {
    if (editTarget) {
      const updated = await updateBadge(editTarget.id, data as any);
      setBadges((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ title: 'Actualizado', description: `"${updated.name}" guardado.` });
    } else {
      const created = await createBadge(data as any);
      setBadges((prev) => [created, ...prev]);
      toast({ title: 'Creado', description: `"${created.name}" creado.` });
    }
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBadge(deleteTarget.id);
      setBadges((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminado', description: `"${deleteTarget.name}" eliminado.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const TARGET_LABEL: Record<string, string> = { shop: 'Tienda', product: 'Producto' };
  const ASSIGN_LABEL: Record<string, string> = { curated: 'Curada', automated: 'Automática' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{ background: GREEN, color: '#fff', gap: 6 }}>
          <Plus size={16} /> Nuevo badge
        </Button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid rgba(21,128,61,0.12)', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'rgba(21,128,61,0.06)' }}>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Código</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Nombre</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Destino</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Asignación</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Activo</TableHead>
              <TableHead style={{ width: 80 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>Cargando…</TableCell></TableRow>
            ) : badges.length === 0 ? (
              <TableRow><TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>No hay badges</TableCell></TableRow>
            ) : (
              badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell style={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280' }}>{badge.code}</TableCell>
                  <TableCell style={{ fontWeight: 500 }}>{badge.name}</TableCell>
                  <TableCell style={{ fontSize: 13 }}>{TARGET_LABEL[badge.targetType] ?? badge.targetType}</TableCell>
                  <TableCell style={{ fontSize: 13 }}>{ASSIGN_LABEL[badge.assignmentType] ?? badge.assignmentType}</TableCell>
                  <TableCell>
                    <span style={{
                      borderRadius: 8,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: badge.isActive ? '#dcfce7' : '#f3f4f6',
                      color: badge.isActive ? GREEN : '#6b7280',
                      border: `1px solid ${badge.isActive ? '#bbf7d0' : '#d1d5db'}`,
                    }}>
                      {badge.isActive ? 'Sí' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => { setEditTarget(badge); setModalOpen(true); }} style={{ padding: '4px 8px' }}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(badge)} style={{ padding: '4px 8px', color: '#dc2626' }}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && badges.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#9ca3af' }}>
            {badges.length} badge{badges.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <TaxonomyItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        mode={editTarget ? 'edit' : 'create'}
        variant="badge"
        initialData={editTarget ?? undefined}
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
