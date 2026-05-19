import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Package,
  Store,
  Image,
  Layers,
  Tag,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { useSubdomain } from '@/hooks/useSubdomain';
import { ModerationHeader } from '@/components/moderation/ModerationHeader';
import type { NameCount } from '@/services/analytics.actions';

const COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

// ─── Helper: horizontal bar chart for name/count data ─────────
const DistributionChart: React.FC<{ data: NameCount[]; label?: string }> = ({
  data,
  label = 'Productos',
}) => {
  if (!data.length) return <p className="text-sm text-muted-foreground">Sin datos</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" />
        <YAxis
          dataKey="name"
          type="category"
          width={140}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar dataKey="count" name={label} fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Helper: small stat metric ─────────────────────────────────
const Metric: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      {icon && (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

// ─── Helper: data table ────────────────────────────────────────
const DataTable: React.FC<{
  columns: { key: string; label: string }[];
  rows: Record<string, any>[];
  maxHeight?: string;
}> = ({ columns, rows, maxHeight = '400px' }) => (
  <div className="overflow-auto border rounded-md" style={{ maxHeight }}>
    <table className="w-full text-sm">
      <thead className="bg-muted sticky top-0">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="px-3 py-2 text-left font-medium">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t hover:bg-muted/50">
            {columns.map((col) => (
              <td key={col.key} className="px-3 py-2">
                {row[col.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const ProductAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isModerationSubdomain } = useSubdomain();
  const { data, loading, fetchAnalytics } = useProductAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const goBack = () => {
    if (isModerationSubdomain) {
      navigate('/');
    } else {
      navigate('/moderacion');
    }
  };

  return (
    <div className="min-h-screen">
      {isModerationSubdomain && <ModerationHeader />}

      <div className={isModerationSubdomain ? 'pt-16' : ''}>
        {/* Title bar */}
        <div className="border-b border-white/50 glass-header">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">
                    Analytics Global — Productos Migrados
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Vista consolidada de distribucion, calidad y completitud
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalytics}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 space-y-8">
          {loading && !data ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No hay datos disponibles. Ejecuta la migracion batch primero.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ─── TOP METRICS ─────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Metric
                  label="Productos"
                  value={data.topMetrics.totalProducts}
                  icon={<Package className="w-5 h-5 text-primary" />}
                />
                <Metric
                  label="Tiendas"
                  value={data.topMetrics.totalStores}
                  icon={<Store className="w-5 h-5 text-primary" />}
                />
                <Metric
                  label="Variantes"
                  value={data.topMetrics.totalVariants}
                  icon={<Layers className="w-5 h-5 text-primary" />}
                />
                <Metric
                  label="Imagenes"
                  value={data.topMetrics.totalImages}
                  icon={<Image className="w-5 h-5 text-primary" />}
                />
                <Metric
                  label="Links Material"
                  value={data.topMetrics.totalMaterialLinks}
                  icon={<Tag className="w-5 h-5 text-primary" />}
                />
              </div>

              {/* ─── 1. TAXONOMY ─────────────────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  1. Distribucion Taxonomica
                </h2>
                <Tabs defaultValue="craft">
                  {/* Actualizamos el menú de pestañas para soportar ambas categorías */}
                  <TabsList className="flex flex-wrap h-auto">
                    <TabsTrigger value="craft">Oficio</TabsTrigger>
                    <TabsTrigger value="tech">Tecnica</TabsTrigger>
                    <TabsTrigger value="cat_main">Categoría Principal</TabsTrigger>
                    <TabsTrigger value="cat_cur">Categoría Curatorial</TabsTrigger>
                    <TabsTrigger value="mat">Material</TabsTrigger>
                    <TabsTrigger value="style">Estilo/Tipo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="craft">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="pt-4">
                            <DistributionChart data={data.taxonomyDistribution.crafts} />
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Detalle</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Oficio' },
                              { key: 'count', label: 'Productos' },
                            ]}
                            rows={[
                              ...data.taxonomyDistribution.crafts,
                              ...(data.taxonomyDistribution.noCraft > 0
                                ? [{ name: 'Sin asignar', count: data.taxonomyDistribution.noCraft }]
                                : []),
                            ]}
                            maxHeight="300px"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="tech">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="pt-4">
                            <DistributionChart data={data.taxonomyDistribution.techniques} />
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardContent className="pt-4">
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Tecnica' },
                              { key: 'count', label: 'Productos' },
                            ]}
                            rows={data.taxonomyDistribution.techniques}
                            maxHeight="300px"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* NUEVA PESTAÑA: Categoría Principal */}
                  <TabsContent value="cat_main">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="pt-4">
                            <DistributionChart data={data.taxonomyDistribution.categories || []} />
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardContent className="pt-4">
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Categoría Principal' },
                              { key: 'count', label: 'Productos' },
                            ]}
                            rows={[
                              ...(data.taxonomyDistribution.categories || []),
                              ...(data.taxonomyDistribution.noCategory > 0
                                ? [{ name: 'Sin asignar', count: data.taxonomyDistribution.noCategory }]
                                : []),
                            ]}
                            maxHeight="300px"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* PESTAÑA ACTUALIZADA: Categoría Curatorial */}
                  <TabsContent value="cat_cur">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="pt-4">
                            <DistributionChart data={data.taxonomyDistribution.curatorialCategories} />
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardContent className="pt-4">
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Categoria Curatorial' },
                              { key: 'count', label: 'Productos' },
                            ]}
                            rows={[
                              ...data.taxonomyDistribution.curatorialCategories,
                              ...(data.taxonomyDistribution.noCuratorialCategory > 0
                                ? [{ name: 'Sin asignar', count: data.taxonomyDistribution.noCuratorialCategory }]
                                : []),
                            ]}
                            maxHeight="300px"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="mat">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="pt-4">
                            <DistributionChart data={data.taxonomyDistribution.materials} />
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardContent className="pt-4">
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Material' },
                              { key: 'count', label: 'Productos' },
                            ]}
                            rows={data.taxonomyDistribution.materials}
                            maxHeight="300px"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="style">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Tipo de Pieza</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Tipo' },
                              { key: 'count', label: 'Cant' },
                            ]}
                            rows={data.taxonomyDistribution.pieceTypes}
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Estilo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Estilo' },
                              { key: 'count', label: 'Cant' },
                            ]}
                            rows={data.taxonomyDistribution.styles}
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Proceso</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Proceso' },
                              { key: 'count', label: 'Cant' },
                            ]}
                            rows={data.taxonomyDistribution.processTypes}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>

              {/* ─── 2. PHYSICAL STATS ───────────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  2. Dimensiones Fisicas y Envio
                </h2>
                <Tabs defaultValue="physical">
                  <TabsList>
                    <TabsTrigger value="physical">Specs Fisicas</TabsTrigger>
                    <TabsTrigger value="shipping">Specs Envio</TabsTrigger>
                  </TabsList>

                  <TabsContent value="physical">
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-4">
                          <DataTable
                            columns={[
                              { key: 'stat', label: 'Estadistica' },
                              { key: 'height', label: 'Alto cm' },
                              { key: 'width', label: 'Ancho cm' },
                              { key: 'length', label: 'Largo cm' },
                              { key: 'weight', label: 'Peso kg' },
                            ]}
                            rows={[
                              {
                                stat: 'Promedio',
                                height: data.physicalStats.specs.avg_height,
                                width: data.physicalStats.specs.avg_width,
                                length: data.physicalStats.specs.avg_length,
                                weight: data.physicalStats.specs.avg_weight,
                              },
                              {
                                stat: 'Minimo',
                                height: data.physicalStats.specs.min_height,
                                width: data.physicalStats.specs.min_width,
                                length: data.physicalStats.specs.min_length,
                                weight: data.physicalStats.specs.min_weight,
                              },
                              {
                                stat: 'Maximo',
                                height: data.physicalStats.specs.max_height,
                                width: data.physicalStats.specs.max_width,
                                length: data.physicalStats.specs.max_length,
                                weight: data.physicalStats.specs.max_weight,
                              },
                            ]}
                          />
                        </CardContent>
                      </Card>

                      {data.physicalStats.outlierCount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-md text-sm">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          {data.physicalStats.outlierCount} productos con valores
                          atipicos (peso &gt; 10kg o dimension &gt; 100cm)
                        </div>
                      )}

                      {data.physicalStats.defaultDimensionsCount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-md text-sm">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          {data.physicalStats.defaultDimensionsCount} productos con
                          dimensiones estimadas (10x10x10cm = default)
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Distribucion Fragilidad
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {data.physicalStats.fragilityDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={data.physicalStats.fragilityDistribution}
                                  dataKey="count"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={70}
                                  label={({ name, count }) => `${name}: ${count}`}
                                >
                                  {data.physicalStats.fragilityDistribution.map(
                                    (_, i) => (
                                      <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin datos</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Distribucion Empaque
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'name', label: 'Empaque' },
                              { key: 'count', label: 'Cantidad' },
                            ]}
                            rows={data.physicalStats.packagingDistribution}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>

              {/* ─── 3. COMPLETENESS ─────────────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  3. Completitud de Datos
                </h2>
                <div className="space-y-4">
                  <DataTable
                    columns={[
                      { key: 'layer', label: 'Capa' },
                      { key: 'complete', label: 'Completos' },
                      { key: 'empty', label: 'Vacios' },
                      { key: 'percentage', label: '%' },
                    ]}
                    rows={data.completeness.layers.map((l) => ({
                      ...l,
                      percentage: `${l.percentage}%`,
                    }))}
                  />

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Completitud Promedio
                        </span>
                        <span className="text-lg font-bold">
                          {data.completeness.avgCompleteness}%
                        </span>
                      </div>
                      <Progress value={data.completeness.avgCompleteness} />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* ─── 4. STORE QUALITY ────────────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  4. Calidad por Tienda
                </h2>
                {data.storeQuality.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'storeName', label: 'Tienda' },
                      { key: 'totalProducts', label: 'Productos' },
                      { key: 'withImages', label: 'Con Imagenes' },
                      { key: 'withMaterials', label: 'Con Materiales' },
                      { key: 'pctImages', label: '% Imagenes' },
                      { key: 'pctMaterials', label: '% Materiales' },
                    ]}
                    rows={data.storeQuality.map((s) => ({
                      ...s,
                      pctImages: `${s.pctImages}%`,
                      pctMaterials: `${s.pctMaterials}%`,
                    }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay datos por tienda.
                  </p>
                )}
              </section>

{/* ─── 5. PRICE DISTRIBUTION ───────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  5. Distribucion de Precios
                </h2>
                {/* --- NUEVA TABLA DE RESUMEN POR CATEGORÍA --- */}
                {data.priceDistribution.byCategory?.length > 0 && (
                  <Card className="mb-6 border-primary/20 shadow-sm">
                    <CardHeader className="pb-2 bg-primary/5">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Resumen Consolidado por Categoría Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <DataTable
                        columns={[
                          { key: 'categoryName', label: 'Categoría' },
                          { key: 'totalCount', label: 'Total Prod.' },
                          { key: 'weightedAvg', label: 'Precio Promedio' },
                          { key: 'absMin', label: 'Precio Mínimo' },
                          { key: 'absMax', label: 'Precio Máximo' },
                        ]}
                        rows={data.priceDistribution.byCategory.map(cat => {
                          const totalCount = cat.techniques.reduce((acc, t) => acc + t.count, 0);
                          
                          // Calculamos el promedio ponderado (weighted average)
                          const weightedSum = cat.techniques.reduce((acc, t) => acc + (t.avg_price * t.count), 0);
                          const avg = totalCount > 0 ? weightedSum / totalCount : 0;
                          
                          // Buscamos los extremos reales de toda la categoría
                          const min = Math.min(...cat.techniques.map(t => t.min_price));
                          const max = Math.max(...cat.techniques.map(t => t.max_price));

                          return {
                            categoryName: cat.categoryName,
                            totalCount: totalCount,
                            weightedAvg: `$${Math.round(avg).toLocaleString()}`,
                            absMin: `$${Math.round(min).toLocaleString()}`,
                            absMax: `$${Math.round(max).toLocaleString()}`,
                          };
                        })}
                      />
                    </CardContent>
                  </Card>
                )}
                <Tabs defaultValue="general">
                  <TabsList className="mb-4">
                    <TabsTrigger value="general">Visión General</TabsTrigger>
                    <TabsTrigger value="grouped">Por Categoría y Técnica</TabsTrigger>
                  </TabsList>

                  {/* PESTAÑA 1: Lo que ya tenías */}
                  <TabsContent value="general">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Estadisticas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: 'stat', label: 'Estadistica' },
                              { key: 'value', label: 'Valor COP' },
                            ]}
                            rows={[
                              { stat: 'Total variantes', value: data.priceDistribution.stats.total },
                              { stat: 'Promedio', value: `$${Number(data.priceDistribution.stats.avg_price || 0).toLocaleString()}` },
                              { stat: 'Minimo', value: `$${Number(data.priceDistribution.stats.min_price || 0).toLocaleString()}` },
                              { stat: 'Maximo', value: `$${Number(data.priceDistribution.stats.max_price || 0).toLocaleString()}` },
                              { stat: 'Mediana', value: `$${Number(data.priceDistribution.stats.median_price || 0).toLocaleString()}` },
                            ]}
                          />
                          {data.priceDistribution.suspiciousCheapCount > 0 && (
                            <div className="mt-3 flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-md text-sm">
                              <AlertTriangle className="w-4 h-4 text-warning" />
                              {data.priceDistribution.suspiciousCheapCount} productos con
                              precio &le; $1 COP (probable fallback de migracion)
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Rangos de Precio
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DistributionChart
                            data={data.priceDistribution.ranges}
                            label="Productos"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* PESTAÑA 2: Nueva agrupación por Categorías y Técnicas */}
                  <TabsContent value="grouped" className="space-y-4">
                    {/* Si la data viene del backend, usamos data.priceDistribution.byCategory. 
                        Si aún no la tienes, esto evitará que se rompa mostrando un estado vacío */}
                    {data.priceDistribution.byCategory?.length > 0 ? (
                      data.priceDistribution.byCategory.map((categoryGroup, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-base font-bold text-primary">
                              Categoría: {categoryGroup.categoryName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <DataTable
                              columns={[
                                { key: 'technique', label: 'Técnica' },
                                { key: 'count', label: 'Cant. Productos' },
                                { key: 'avg', label: 'Precio Promedio' },
                                { key: 'min', label: 'Mínimo' },
                                { key: 'max', label: 'Máximo' },
                              ]}
                              rows={categoryGroup.techniques.map(tech => ({
                                technique: tech.name,
                                count: tech.count,
                                avg: `$${Number(tech.avg_price).toLocaleString()}`,
                                min: `$${Number(tech.min_price).toLocaleString()}`,
                                max: `$${Number(tech.max_price).toLocaleString()}`,
                              }))}
                            />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          Aún no hay datos agrupados por categoría y técnica disponibles.
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </section>

              {/* ─── 7. CATALOG QUALITY ──────────────────────── */}
              {data.catalogQuality && (
                <section>
                  <h2 className="text-lg font-semibold mb-1">7. Calidad del Catálogo</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Productos con información incompleta que necesitan atención.
                  </p>

                  {/* Alert cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {[
                      { label: 'Sin fotos', value: data.catalogQuality.withoutImages, icon: <Image className="w-4 h-4" /> },
                      { label: 'Sin descripción', value: data.catalogQuality.withoutDescription, icon: <Tag className="w-4 h-4" /> },
                      { label: 'Sin identidad artesanal', value: data.catalogQuality.withoutArtisanalIdentity, icon: <Layers className="w-4 h-4" /> },
                      { label: 'Sin materiales', value: data.catalogQuality.withoutMaterials, icon: <Package className="w-4 h-4" /> },
                      { label: 'Sin categoría', value: data.catalogQuality.withoutCategory, icon: <AlertTriangle className="w-4 h-4" /> },
                    ].map((item) => (
                      <Card key={item.label} className={item.value > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                            {item.icon}
                            <span className="text-xs font-medium">{item.label}</span>
                          </div>
                          <p className={`text-2xl font-bold ${item.value > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {item.value}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Rejection reasons */}
                  {data.catalogQuality.rejectionReasons.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold mb-3">Razones de rechazo más frecuentes (últimos 90 días)</h3>
                      <DistributionChart
                        data={data.catalogQuality.rejectionReasons.map((r) => ({ name: r.reason, count: r.count }))}
                        label="Rechazos"
                      />
                    </>
                  )}
                </section>
              )}

              {/* ─── 6. VOLUMETRIC ANALYSIS ──────────────────── */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  6. Analisis Volumetrico de Pesos
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Detecta productos con pesos anomalos usando la formula:
                  peso_volumetrico = (L x W x H) / 400. Si peso_real &gt;
                  10x peso_volumetrico O peso_real &gt; 50kg = probable error
                  de unidades (g a kg).
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Metric
                    label="Total Analizados"
                    value={data.volumetricAnalysis.totalAnalyzed}
                  />
                  <Metric
                    label="Anomalias Detectadas"
                    value={data.volumetricAnalysis.anomaliesDetected}
                  />
                  <Metric
                    label="% Anomalos"
                    value={`${data.volumetricAnalysis.anomalyPercentage}%`}
                  />
                </div>

                {data.volumetricAnalysis.anomaliesDetected > 0 ? (
                  <>
                    <div className="flex items-center gap-2 p-3 mb-4 bg-warning/10 border border-warning/30 rounded-md text-sm">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      {data.volumetricAnalysis.anomaliesDetected} producto(s) con
                      peso anomalo. Probablemente estan en gramos en vez de
                      kilogramos.
                    </div>
                    <DataTable
                      columns={[
                        { key: 'productName', label: 'Producto' },
                        { key: 'storeName', label: 'Tienda' },
                        { key: 'dims', label: 'Dims (cm)' },
                        { key: 'realWeightKg', label: 'Peso Real (kg)' },
                        { key: 'volWeightKg', label: 'Peso Vol (kg)' },
                        { key: 'correctedWeightKg', label: 'Peso Corregido' },
                        { key: 'packWeightKg', label: 'Pack (kg)' },
                      ]}
                      rows={data.volumetricAnalysis.anomalyProducts}
                      maxHeight="500px"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-md text-sm">
                    <Package className="w-4 h-4 text-success" />
                    No se detectaron anomalias volumetricas. Todos los pesos son
                    coherentes.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
