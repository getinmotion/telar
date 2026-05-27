import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Wrench,
  ListTree,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Percent,
  Coins,
  Sparkles,
  ChevronRight,
  Search,
  Save,
  X,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

// ─── Datos / modelo ──────────────────────────────────────────────────────────
type ChargeType = 'percentage' | 'flat';
type Scope = 'global' | 'category' | 'product' | 'shop';

interface FeeRule {
  id: string;
  name: string;
  description?: string;
  chargeType: ChargeType;
  value: number;
  scope: Scope;
  targetLabel: string;
  minOrderCop?: number;
  priority: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'cms_payment_fee_rules_v1';

const CATEGORIES = [
  'Cerámica',
  'Textil',
  'Joyería',
  'Madera',
  'Cuero',
  'Cestería',
  'Vidrio',
  'Metal',
  'Marroquinería',
];

const SCOPE_LABEL: Record<Scope, string> = {
  global: 'Todas las ventas',
  category: 'Categoría',
  product: 'Producto',
  shop: 'Tienda',
};

const SCOPE_ICON: Record<Scope, React.ReactNode> = {
  global: <Sparkles className="w-3 h-3" />,
  category: <Tag className="w-3 h-3" />,
  product: <Tag className="w-3 h-3" />,
  shop: <Tag className="w-3 h-3" />,
};

function seedRules(): FeeRule[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      name: 'Comisión plataforma estándar',
      description: 'Cargo base sobre todas las ventas confirmadas.',
      chargeType: 'percentage',
      value: 8,
      scope: 'global',
      targetLabel: 'Todas las ventas',
      priority: 100,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'seed-2',
      name: 'Recargo Cerámica premium',
      description: 'Cargo adicional sobre piezas de cerámica de alto valor.',
      chargeType: 'percentage',
      value: 2.5,
      scope: 'category',
      targetLabel: 'Cerámica',
      minOrderCop: 500000,
      priority: 50,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'seed-3',
      name: 'Cargo fijo logística textil',
      description: 'Tarifa plana por orden de productos textiles.',
      chargeType: 'flat',
      value: 3500,
      scope: 'category',
      targetLabel: 'Textil',
      priority: 30,
      active: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function loadRules(): FeeRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedRules();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seedRules();
  }
}

function saveRules(rules: FeeRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

function formatValue(rule: FeeRule): string {
  if (rule.chargeType === 'percentage') return `${rule.value}%`;
  return `$${rule.value.toLocaleString('es-CO')} COP`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DevOps interno — referenciado en código pero SIN punto de acceso desde la UI.
// Flag siempre en `false`: el bloque <Collapsible> queda como dead code para
// activarlo más adelante cambiando esta constante.
// ─────────────────────────────────────────────────────────────────────────────
const DEVOPS_PANEL_ENABLED = false;

// ─── DevOps (oculto) ─────────────────────────────────────────────────────────
type SvcStatus = 'unknown' | 'up' | 'down' | 'checking';
interface CheckResult {
  status: SvcStatus;
  latencyMs?: number;
  body?: string;
  error?: string;
  at: number;
}
const DEFAULT_BASE_URL =
  (import.meta.env.VITE_PAYMENTS_SVC_URL as string) || 'http://localhost:8080';

const SCHEMA_OBJECTS = [
  { kind: 'schema', name: 'payments', purpose: 'Schema dedicado del servicio' },
  { kind: 'table', name: 'payments.checkouts', purpose: 'Sesiones de checkout creadas vía /checkout' },
  { kind: 'table', name: 'payments.transactions', purpose: 'Transacciones confirmadas (autorización / captura)' },
  { kind: 'table', name: 'payments.refunds', purpose: 'Reembolsos parciales y totales' },
  { kind: 'table', name: 'payments.webhooks_inbox', purpose: 'Bandeja idempotente para webhooks de Cobre' },
  { kind: 'table', name: 'payments.payouts', purpose: 'Liquidaciones programadas hacia las tiendas' },
  { kind: 'table', name: 'payments.fee_rules', purpose: 'Reglas de cargos sobre venta (este admin)' },
  { kind: 'index', name: 'idx_checkouts_shop_status', purpose: 'Búsqueda por tienda + estado' },
];
const ENV_VARS = [
  { key: 'PAYMENTS_DB_HOST', required: true, hint: 'Host Postgres dedicado a payment-svc' },
  { key: 'PAYMENTS_DB_NAME', required: true, hint: 'Schema lógico: `payments`' },
  { key: 'COBRE_API_KEY', required: true, hint: 'Credencial sandbox/prod de Cobre' },
  { key: 'COBRE_WEBHOOK_SECRET', required: true, hint: 'HMAC para validar webhooks entrantes' },
  { key: 'PAYMENTS_BASE_URL', required: false, hint: 'URL pública para callbacks (opcional en dev)' },
];

// ─── Página ──────────────────────────────────────────────────────────────────
const BackofficePaymentsSvcPage: React.FC = () => {
  const navigate = useNavigate();

  // ─ Reglas (estado primario) ────────────────────────────────────────
  const [rules, setRules] = useState<FeeRule[]>([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<FeeRule | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<FeeRule, 'id' | 'createdAt' | 'updatedAt'>>(emptyForm());

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const filteredRules = useMemo(() => {
    if (!q.trim()) return rules;
    const term = q.toLowerCase();
    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.targetLabel.toLowerCase().includes(term) ||
        (r.description?.toLowerCase().includes(term) ?? false),
    );
  }, [rules, q]);

  const stats = useMemo(() => {
    const active = rules.filter((r) => r.active);
    const lastUpdate = Math.max(0, ...rules.map((r) => r.updatedAt));
    const avgPct =
      active
        .filter((r) => r.chargeType === 'percentage')
        .reduce((acc, r) => acc + r.value, 0) /
      Math.max(1, active.filter((r) => r.chargeType === 'percentage').length);
    return {
      total: rules.length,
      active: active.length,
      avgPct: Number.isFinite(avgPct) ? avgPct.toFixed(2) : '0.00',
      flatRules: active.filter((r) => r.chargeType === 'flat').length,
      lastUpdate,
    };
  }, [rules]);

  function startCreate() {
    setForm(emptyForm());
    setCreating(true);
    setEditing(null);
  }

  function startEdit(rule: FeeRule) {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = rule;
    setForm(rest);
    setEditing(rule);
    setCreating(false);
  }

  function persist(next: FeeRule[]) {
    setRules(next);
    saveRules(next);
  }

  function submit() {
    if (!form.name.trim()) {
      toast.error('Falta el nombre de la regla');
      return;
    }
    if (!Number.isFinite(form.value) || form.value < 0) {
      toast.error('El valor debe ser un número ≥ 0');
      return;
    }
    if (form.chargeType === 'percentage' && form.value > 100) {
      toast.error('El porcentaje no puede ser mayor a 100');
      return;
    }
    if (form.scope !== 'global' && !form.targetLabel.trim()) {
      toast.error('Indica a qué se aplica la regla');
      return;
    }

    const now = Date.now();
    if (editing) {
      const next = rules.map((r) =>
        r.id === editing.id ? { ...editing, ...form, updatedAt: now } : r,
      );
      persist(next);
      toast.success('Regla actualizada');
    } else {
      const id = `rule-${now}-${Math.random().toString(36).slice(2, 6)}`;
      persist([{ id, createdAt: now, updatedAt: now, ...form }, ...rules]);
      toast.success('Regla creada');
    }
    setCreating(false);
    setEditing(null);
  }

  function toggle(id: string) {
    persist(
      rules.map((r) =>
        r.id === id ? { ...r, active: !r.active, updatedAt: Date.now() } : r,
      ),
    );
  }

  function remove(id: string) {
    persist(rules.filter((r) => r.id !== id));
    toast.success('Regla eliminada');
  }

  // ─ DevOps (oculto) ─────────────────────────────────────────────────
  const [devopsOpen, setDevopsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [health, setHealth] = useState<CheckResult>({ status: 'unknown', at: 0 });

  const checkHealth = useCallback(async () => {
    setHealth({ status: 'checking', at: Date.now() });
    const t0 = performance.now();
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health`);
      const text = await res.text().catch(() => '');
      const latency = Math.round(performance.now() - t0);
      setHealth({
        status: res.ok ? 'up' : 'down',
        latencyMs: latency,
        body: text.slice(0, 200),
        at: Date.now(),
      });
    } catch (e: any) {
      setHealth({ status: 'down', error: e?.message ?? 'fetch error', at: Date.now() });
    }
  }, [baseUrl]);

  useEffect(() => {
    if (devopsOpen && health.status === 'unknown') {
      checkHealth();
    }
  }, [devopsOpen, health.status, checkHealth]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/50 glass-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/backoffice/pagos')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Coins className="w-5 h-5" /> Admin de cargos sobre ventas
              </h1>
              <p className="text-sm text-muted-foreground">
                Configura comisiones y recargos por categoría, producto o tienda
              </p>
            </div>
          </div>
          <Button onClick={startCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva regla
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Activity className="w-4 h-4" />}
            label="Reglas activas"
            value={`${stats.active}`}
            sub={`${stats.total} en total`}
            accent="emerald"
          />
          <KpiCard
            icon={<Percent className="w-4 h-4" />}
            label="Comisión promedio"
            value={`${stats.avgPct}%`}
            sub="solo reglas % activas"
            accent="violet"
          />
          <KpiCard
            icon={<Coins className="w-4 h-4" />}
            label="Cargos fijos activos"
            value={`${stats.flatRules}`}
            sub="tarifas planas"
            accent="amber"
          />
          <KpiCard
            icon={<Sparkles className="w-4 h-4" />}
            label="Último cambio"
            value={stats.lastUpdate ? timeAgo(stats.lastUpdate) : '—'}
            sub="auditoría local"
          />
        </div>

        {/* Tabla de reglas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base">Reglas de cargo</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Las reglas se aplican por orden de prioridad (mayor → menor).
                Las desactivadas no se evalúan.
              </p>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar regla, categoría…"
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Activa</th>
                    <th className="px-3 py-2 text-left font-medium">Regla</th>
                    <th className="px-3 py-2 text-left font-medium">Aplica a</th>
                    <th className="px-3 py-2 text-right font-medium">Cargo</th>
                    <th className="px-3 py-2 text-right font-medium">Mínimo</th>
                    <th className="px-3 py-2 text-center font-medium">Prio</th>
                    <th className="px-3 py-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules
                    .slice()
                    .sort((a, b) => b.priority - a.priority)
                    .map((r) => (
                      <tr
                        key={r.id}
                        className={`border-t hover:bg-muted/50 ${r.active ? '' : 'opacity-60'}`}
                      >
                        <td className="px-3 py-2">
                          <Switch checked={r.active} onCheckedChange={() => toggle(r.id)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{r.name}</div>
                          {r.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                              {r.description}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className="gap-1 text-[10px]">
                            {SCOPE_ICON[r.scope]} {SCOPE_LABEL[r.scope]}
                          </Badge>
                          {r.scope !== 'global' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {r.targetLabel}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          {formatValue(r)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                          {r.minOrderCop
                            ? `$${r.minOrderCop.toLocaleString('es-CO')}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-center text-xs">{r.priority}</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(r)}
                            title="Editar"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(r.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  {filteredRules.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-muted-foreground text-sm"
                      >
                        Sin reglas. Crea la primera con el botón <strong>Nueva regla</strong>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* DevOps interno — sin punto de acceso desde la UI (DEVOPS_PANEL_ENABLED = false). */}
        {DEVOPS_PANEL_ENABLED && (
        <Collapsible open={devopsOpen} onOpenChange={setDevopsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm text-muted-foreground border border-dashed"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-3 h-3" />
                Operaciones del servicio (DevOps)
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${devopsOpen ? 'rotate-90' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Health del servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={health.status} />
                  <span className="text-xs text-muted-foreground">
                    {health.status !== 'unknown' &&
                      `revisado ${timeAgo(health.at)} · ${health.latencyMs ?? '—'} ms`}
                  </span>
                  <Button variant="outline" size="sm" onClick={checkHealth} className="gap-2 ml-auto">
                    <RefreshCw className={`w-3 h-3 ${health.status === 'checking' ? 'animate-spin' : ''}`} />
                    Re-chequear
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Base URL</Label>
                    <Input
                      className="font-mono"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Endpoint</Label>
                    <div className="font-mono text-xs py-2">
                      GET {baseUrl.replace(/\/$/, '')}/health
                    </div>
                  </div>
                </div>
                {health.body && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {health.body}
                  </pre>
                )}
                {health.error && (
                  <div className="text-xs text-destructive">{health.error}</div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="schema" className="space-y-4">
              <TabsList>
                <TabsTrigger value="schema" className="gap-1">
                  <Database className="w-3 h-3" /> Esquema
                </TabsTrigger>
                <TabsTrigger value="env" className="gap-1">
                  <ListTree className="w-3 h-3" /> Configuración
                </TabsTrigger>
                <TabsTrigger value="tools" className="gap-1">
                  <Wrench className="w-3 h-3" /> Herramientas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="schema">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Esquema de pagos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Tipo</th>
                            <th className="px-3 py-2 text-left font-medium">Nombre</th>
                            <th className="px-3 py-2 text-left font-medium">Propósito</th>
                            <th className="px-3 py-2 text-left font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SCHEMA_OBJECTS.map((o) => (
                            <tr key={o.name} className="border-t">
                              <td className="px-3 py-2 text-xs uppercase text-muted-foreground">
                                {o.kind}
                              </td>
                              <td className="px-3 py-2 font-mono text-xs">{o.name}</td>
                              <td className="px-3 py-2 text-xs">{o.purpose}</td>
                              <td className="px-3 py-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  pendiente verificación
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="env">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variables de entorno requeridas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ENV_VARS.map((v) => (
                      <div
                        key={v.key}
                        className="flex items-start justify-between gap-3 border rounded px-3 py-2"
                      >
                        <div>
                          <div className="font-mono text-sm">{v.key}</div>
                          <div className="text-xs text-muted-foreground">{v.hint}</div>
                        </div>
                        <Badge
                          variant={v.required ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {v.required ? 'requerida' : 'opcional'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Herramientas operativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ToolRow
                      label="Ejecutar migraciones"
                      hint="Aplica las migraciones SQL del schema payments contra la DB actual."
                      cta="Próximamente"
                      disabled
                    />
                    <ToolRow
                      label="Replay de webhooks"
                      hint="Re-procesar entradas en payments.webhooks_inbox que fallaron."
                      cta="Próximamente"
                      disabled
                    />
                    <ToolRow
                      label="Smoke test end-to-end"
                      hint="Crea un checkout sandbox y confirma un cobro contra Cobre."
                      cta="Próximamente"
                      disabled
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
        )}
      </div>

      {/* Editor de regla */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar regla de cargo' : 'Nueva regla de cargo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nombre de la regla</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Comisión cerámica premium"
              />
            </div>

            <div>
              <Label className="text-xs">Descripción (opcional)</Label>
              <Input
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Cargo adicional sobre piezas de alto valor"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo de cargo</Label>
                <Select
                  value={form.chargeType}
                  onValueChange={(v: ChargeType) => setForm({ ...form, chargeType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="flat">Cargo fijo (COP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">
                  {form.chargeType === 'percentage' ? 'Porcentaje' : 'Monto COP'}
                </Label>
                <Input
                  type="number"
                  step={form.chargeType === 'percentage' ? '0.1' : '100'}
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: parseFloat(e.target.value) || 0 })
                  }
                  placeholder={form.chargeType === 'percentage' ? '5.5' : '3500'}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Alcance</Label>
              <Select
                value={form.scope}
                onValueChange={(v: Scope) =>
                  setForm({
                    ...form,
                    scope: v,
                    targetLabel: v === 'global' ? 'Todas las ventas' : form.targetLabel,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Todas las ventas</SelectItem>
                  <SelectItem value="category">Categoría específica</SelectItem>
                  <SelectItem value="product">Producto específico</SelectItem>
                  <SelectItem value="shop">Tienda específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.scope === 'category' && (
              <div>
                <Label className="text-xs">Categoría</Label>
                <Select
                  value={form.targetLabel}
                  onValueChange={(v) => setForm({ ...form, targetLabel: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(form.scope === 'product' || form.scope === 'shop') && (
              <div>
                <Label className="text-xs">
                  {form.scope === 'product' ? 'Producto (id o nombre)' : 'Tienda (id o nombre)'}
                </Label>
                <Input
                  value={form.targetLabel}
                  onChange={(e) => setForm({ ...form, targetLabel: e.target.value })}
                  placeholder={form.scope === 'product' ? 'sku-001 o "Bolso wayuu"' : 'shop-id o "Telar de Boyacá"'}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monto mínimo de orden (COP, opcional)</Label>
                <Input
                  type="number"
                  step="1000"
                  value={form.minOrderCop ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minOrderCop: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="500000"
                />
              </div>
              <div>
                <Label className="text-xs">Prioridad</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded border px-3 py-2">
              <div>
                <div className="text-sm font-medium">Regla activa</div>
                <div className="text-xs text-muted-foreground">
                  Si se desactiva, no se aplica al calcular cargos.
                </div>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(c) => setForm({ ...form, active: c })}
              />
            </div>
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

// ─── Helpers presentacionales ────────────────────────────────────────────────
function emptyForm(): Omit<FeeRule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    chargeType: 'percentage',
    value: 0,
    scope: 'category',
    targetLabel: '',
    minOrderCop: undefined,
    priority: 10,
    active: true,
  };
}

const ACCENT_COLOR: Record<string, string> = {
  emerald: '#10b981',
  violet: '#7c3aed',
  amber: '#f59e0b',
  default: '#475569',
};

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: 'emerald' | 'violet' | 'amber';
}> = ({ icon, label, value, sub, accent }) => {
  const color = ACCENT_COLOR[accent ?? 'default'];
  return (
    <Card>
      <CardContent className="p-4">
        <div
          className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wide"
          style={{ color }}
        >
          {icon}
          {label}
        </div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: SvcStatus }> = ({ status }) => {
  if (status === 'up')
    return (
      <Badge className="gap-1 bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="w-3 h-3" /> UP
      </Badge>
    );
  if (status === 'down')
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" /> DOWN
      </Badge>
    );
  if (status === 'checking')
    return (
      <Badge variant="secondary" className="gap-1">
        <RefreshCw className="w-3 h-3 animate-spin" /> Chequeando…
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1">
      <AlertCircle className="w-3 h-3" /> Desconocido
    </Badge>
  );
};

const ToolRow: React.FC<{
  label: string;
  hint: string;
  cta: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ label, hint, cta, disabled, onClick }) => (
  <div className="flex items-center justify-between gap-3 border rounded px-3 py-2">
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
    <Button size="sm" variant="outline" disabled={disabled} onClick={onClick}>
      {cta}
    </Button>
  </div>
);

function timeAgo(at: number): string {
  if (!at) return '';
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return `hace ${h} h`;
}

export default BackofficePaymentsSvcPage;
