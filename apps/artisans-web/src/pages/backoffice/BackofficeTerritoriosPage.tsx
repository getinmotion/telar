import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  X,
  Download,
  Upload,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  COLOMBIA_COORDS,
  DEPT_FALLBACK_COORDS,
} from '@/data/colombiaCoords';

const STORAGE_KEY = 'cms_territories_overrides_v1';

interface Territory {
  /** Llave compuesta DEPARTAMENTO|MUNICIPIO (normalizada). */
  key: string;
  department: string;
  municipality: string;
  lat: number;
  lng: number;
  /** Origen del registro: default (en código), override (editado o nuevo). */
  source: 'default' | 'override';
}

function splitKey(k: string): [string, string] {
  const [d, m = ''] = k.split('|');
  return [d, m];
}

function makeKey(dept: string, muni: string): string {
  return `${dept.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()}|${muni
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()}`;
}

function loadOverrides(): Record<string, [number, number]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveOverrides(o: Record<string, [number, number]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
}

function buildList(
  overrides: Record<string, [number, number]>,
): Territory[] {
  const merged: Record<string, Territory> = {};
  // base municipios
  for (const [k, v] of Object.entries(COLOMBIA_COORDS)) {
    const [d, m] = splitKey(k);
    merged[k] = {
      key: k,
      department: d,
      municipality: m,
      lat: v[0],
      lng: v[1],
      source: 'default',
    };
  }
  // overrides (pueden añadir nuevos o sobrescribir)
  for (const [k, v] of Object.entries(overrides)) {
    const [d, m] = splitKey(k);
    merged[k] = {
      key: k,
      department: d,
      municipality: m,
      lat: v[0],
      lng: v[1],
      source: 'override',
    };
  }
  return Object.values(merged).sort((a, b) =>
    `${a.department}|${a.municipality}`.localeCompare(
      `${b.department}|${b.municipality}`,
      'es',
    ),
  );
}

const BackofficeTerritoriosPage: React.FC = () => {
  const navigate = useNavigate();
  const [overrides, setOverrides] = useState<Record<string, [number, number]>>(
    {},
  );
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Territory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    department: '',
    municipality: '',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  const list = useMemo(() => buildList(overrides), [overrides]);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const term = q.toLowerCase();
    return list.filter(
      (t) =>
        t.department.toLowerCase().includes(term) ||
        t.municipality.toLowerCase().includes(term),
    );
  }, [list, q]);

  const departments = useMemo(() => {
    const set = new Map<string, number>();
    for (const t of list) set.set(t.department, (set.get(t.department) ?? 0) + 1);
    return Array.from(set.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [list]);

  function startCreate() {
    setForm({ department: '', municipality: '', lat: '', lng: '' });
    setCreating(true);
    setEditing(null);
  }

  function startEdit(t: Territory) {
    setForm({
      department: t.department,
      municipality: t.municipality,
      lat: String(t.lat),
      lng: String(t.lng),
    });
    setEditing(t);
    setCreating(false);
  }

  function submit() {
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!form.department.trim() || !form.municipality.trim()) {
      toast.error('Departamento y municipio son obligatorios');
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('lat/lng deben ser números');
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordenadas fuera de rango');
      return;
    }
    const key = makeKey(form.department, form.municipality);
    const next = { ...overrides, [key]: [lat, lng] as [number, number] };
    setOverrides(next);
    saveOverrides(next);
    toast.success(creating ? 'Territorio creado' : 'Territorio actualizado');
    setCreating(false);
    setEditing(null);
  }

  function remove(t: Territory) {
    if (t.source === 'default') {
      toast.error('No se puede borrar un territorio del catálogo base');
      return;
    }
    const next = { ...overrides };
    delete next[t.key];
    setOverrides(next);
    saveOverrides(next);
    toast.success('Override eliminado');
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(overrides, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'territories-overrides.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('formato inválido');
        const next: Record<string, [number, number]> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (
            Array.isArray(v) &&
            v.length === 2 &&
            typeof v[0] === 'number' &&
            typeof v[1] === 'number'
          ) {
            next[k] = [v[0], v[1]];
          }
        }
        setOverrides(next);
        saveOverrides(next);
        toast.success(`Importados ${Object.keys(next).length} territorios`);
      } catch (e: any) {
        toast.error(`Error: ${e.message}`);
      }
    });
    ev.target.value = '';
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/50 glass-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/backoffice/home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5" /> CMS de Territorios
              </h1>
              <p className="text-sm text-muted-foreground">
                Catálogo de departamentos / municipios con coordenadas geográficas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportJson} className="gap-2">
              <Download className="w-4 h-4" /> Exportar overrides
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <span>
                  <Upload className="w-4 h-4" /> Importar
                </span>
              </Button>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importJson}
              />
            </label>
            <Dialog
              open={creating}
              onOpenChange={(o) => {
                setCreating(o);
                if (!o) setEditing(null);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={startCreate} className="gap-2">
                  <Plus className="w-4 h-4" /> Nuevo
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Territorios base</span>
                <strong>{Object.keys(COLOMBIA_COORDS).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overrides locales</span>
                <strong>{Object.keys(overrides).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departamentos</span>
                <strong>{departments.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fallbacks (centroides)</span>
                <strong>{Object.keys(DEPT_FALLBACK_COORDS).length}</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                Departamentos cubiertos
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {filtered.length} resultados
              </span>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {departments.map(([d, count]) => (
                <Badge
                  key={d}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setQ(d)}
                >
                  {d} <span className="ml-1 text-muted-foreground">({count})</span>
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Territorios</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar departamento o municipio…"
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border rounded-md" style={{ maxHeight: 540 }}>
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Departamento</th>
                    <th className="px-3 py-2 text-left font-medium">Municipio</th>
                    <th className="px-3 py-2 text-right font-medium">Lat</th>
                    <th className="px-3 py-2 text-right font-medium">Lng</th>
                    <th className="px-3 py-2 text-center font-medium">Origen</th>
                    <th className="px-3 py-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.key} className="border-t hover:bg-muted/50">
                      <td className="px-3 py-2">{t.department}</td>
                      <td className="px-3 py-2">{t.municipality}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {t.lat.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {t.lng.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge
                          variant={t.source === 'override' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {t.source}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(t)}
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(t)}
                          disabled={t.source === 'default'}
                          title={
                            t.source === 'default'
                              ? 'Solo overrides pueden borrarse'
                              : 'Eliminar'
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-muted-foreground text-sm"
                      >
                        Sin resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor (create / edit) */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar territorio' : 'Nuevo territorio'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Departamento</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                disabled={!!editing && editing.source === 'default'}
              />
            </div>
            <div>
              <Label className="text-xs">Municipio</Label>
              <Input
                value={form.municipality}
                onChange={(e) =>
                  setForm({ ...form, municipality: e.target.value })
                }
                disabled={!!editing && editing.source === 'default'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Latitud</Label>
                <Input
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="4.7110"
                />
              </div>
              <div>
                <Label className="text-xs">Longitud</Label>
                <Input
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  placeholder="-74.0721"
                />
              </div>
            </div>
            {editing && editing.source === 'default' && (
              <p className="text-xs text-muted-foreground">
                Este territorio viene del catálogo base. Guardar creará un override
                con las nuevas coordenadas.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="gap-1"
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button onClick={submit} className="gap-1">
              <Save className="w-4 h-4" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackofficeTerritoriosPage;
