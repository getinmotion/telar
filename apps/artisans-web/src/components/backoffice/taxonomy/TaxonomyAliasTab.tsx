import React, { useEffect, useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getTaxonomyAliases, deleteTaxonomyAlias, type TaxonomyAlias } from '@/services/curation.actions';
import { TaxonomyDeleteConfirm } from './TaxonomyDeleteConfirm';

const TYPE_LABELS: Record<string, string> = {
  craft: 'Oficio',
  material: 'Material',
  technique: 'Técnica',
  style: 'Estilo',
};

export function TaxonomyAliasTab() {
  const { toast } = useToast();
  const [aliases, setAliases] = useState<TaxonomyAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyAlias | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getTaxonomyAliases()
      .then(setAliases)
      .catch(() => toast({ title: 'Error', description: 'No se pudo cargar los aliases', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTaxonomyAlias(deleteTarget.id);
      setAliases((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast({ title: 'Eliminado', description: `Alias "${deleteTarget.aliasName}" eliminado.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Info note */}
      <div
        style={{
          background: 'rgba(236,109,19,0.08)',
          border: '1px solid rgba(236,109,19,0.25)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: '#9a3412',
        }}
      >
        <span>Los aliases se crean desde el flujo de moderación (fusionar / normalizar).</span>
        <a
          href="/backoffice/taxonomia/moderacion"
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#c2410c', fontWeight: 600, textDecoration: 'none' }}
        >
          Ir a moderación <ExternalLink size={13} />
        </a>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid rgba(21,128,61,0.12)', overflow: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'rgba(21,128,61,0.06)' }}>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Alias</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Tipo</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>ID Canónico</TableHead>
              <TableHead style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>Creado</TableHead>
              <TableHead style={{ width: 60 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>Cargando…</TableCell></TableRow>
            ) : aliases.length === 0 ? (
              <TableRow><TableCell colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>No hay aliases registrados</TableCell></TableRow>
            ) : (
              aliases.map((alias) => (
                <TableRow key={alias.id}>
                  <TableCell style={{ fontWeight: 500 }}>{alias.aliasName}</TableCell>
                  <TableCell style={{ fontSize: 13 }}>{TYPE_LABELS[alias.canonicalType] ?? alias.canonicalType}</TableCell>
                  <TableCell style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{alias.canonicalId.slice(0, 8)}…</TableCell>
                  <TableCell style={{ color: '#9ca3af', fontSize: 13 }}>
                    {new Date(alias.createdAt).toLocaleDateString('es-CL')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(alias)} style={{ padding: '4px 8px', color: '#dc2626' }}>
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && aliases.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#9ca3af' }}>
            {aliases.length} alias{aliases.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      <TaxonomyDeleteConfirm
        open={!!deleteTarget}
        itemName={deleteTarget?.aliasName ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
