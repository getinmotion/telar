import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Rocket } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import type { ShopWithProducts, ProductSpec } from '@/hooks/useShippingAnalytics';
import { quoteStandalone } from '@/services/shipping.actions';

interface BulkQuoterTabProps {
  shopsData: ShopWithProducts[];
}

interface QuoteResult {
  shopName: string;
  productName: string;
  priceCop: number;
  shippingCost: number;
  impactPct: number;
  weightKg: number;
  dimensions: string;
  error?: string;
}

export const BulkQuoterTab: React.FC<BulkQuoterTabProps> = ({ shopsData }) => {
  const { departments, getMunicipalities, getDaneCode } = useColombiaLocations();

  const [destinoDepto, setDestinoDepto] = useState('');
  const [destinoMuni, setDestinoMuni] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<QuoteResult[]>([]);

  const destinoMunicipios = destinoDepto ? getMunicipalities(destinoDepto) : [];

  const handleBulkQuote = async () => {
    const destinoDane = getDaneCode(destinoDepto, destinoMuni);
    if (!destinoDane) return;

    setLoading(true);
    setProgress(0);
    setResults([]);

    // Collect all quotable products
    const quotableItems: { shop: ShopWithProducts; product: ProductSpec; origenDane: string }[] = [];

    for (const shop of shopsData) {
      const origenDane = getDaneCode(shop.department, shop.municipality);
      if (!origenDane) continue;

      for (const product of shop.products) {
        if (product.weightKg <= 0 || product.lengthCm <= 0) continue;
        quotableItems.push({ shop, product, origenDane });
      }
    }

    const allResults: QuoteResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < quotableItems.length; i += batchSize) {
      const batch = quotableItems.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async ({ shop, product, origenDane }) => {
          try {
            const res = await quoteStandalone({
              pieces: [{
                peso: Math.max(product.weightKg, 0.5),
                largo: Math.max(product.lengthCm, 10),
                ancho: Math.max(product.widthCm, 10),
                alto: Math.max(product.heightCm, 10),
              }],
              valorDeclarado: Math.max(product.priceCop, 30000),
              idCityOrigen: String(origenDane),
              idCityDestino: String(destinoDane),
            });

            return {
              shopName: shop.shopName,
              productName: product.productName,
              priceCop: product.priceCop,
              shippingCost: res.shippingCost,
              impactPct: product.priceCop > 0 ? (res.shippingCost / product.priceCop) * 100 : 0,
              weightKg: product.weightKg,
              dimensions: `${product.lengthCm}x${product.widthCm}x${product.heightCm}`,
              error: res.error,
            };
          } catch {
            return {
              shopName: shop.shopName,
              productName: product.productName,
              priceCop: product.priceCop,
              shippingCost: 0,
              impactPct: 0,
              weightKg: product.weightKg,
              dimensions: `${product.lengthCm}x${product.widthCm}x${product.heightCm}`,
              error: 'Error de conexion',
            };
          }
        }),
      );

      allResults.push(...batchResults);
      setProgress(Math.min(((i + batchSize) / quotableItems.length) * 100, 100));
    }

    setResults(allResults);
    setLoading(false);
  };

  // Summary stats
  const successResults = results.filter((r) => r.shippingCost > 0);
  const avgCost = successResults.length > 0
    ? successResults.reduce((s, r) => s + r.shippingCost, 0) / successResults.length
    : 0;
  const avgImpact = successResults.length > 0
    ? successResults.reduce((s, r) => s + r.impactPct, 0) / successResults.length
    : 0;

  // Cost by shop chart
  const shopCostMap = new Map<string, { total: number; count: number }>();
  for (const r of successResults) {
    const entry = shopCostMap.get(r.shopName) || { total: 0, count: 0 };
    entry.total += r.shippingCost;
    entry.count += 1;
    shopCostMap.set(r.shopName, entry);
  }
  const chartData = Array.from(shopCostMap.entries())
    .map(([name, d]) => ({ name: name.substring(0, 20), promedio: Math.round(d.total / d.count) }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 15);

  const canQuote = destinoDepto && destinoMuni && shopsData.length > 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="font-semibold">Ciudad Destino</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={destinoDepto} onValueChange={(v) => { setDestinoDepto(v); setDestinoMuni(''); }}>
                  <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={destinoMuni} onValueChange={setDestinoMuni} disabled={!destinoDepto}>
                  <SelectTrigger><SelectValue placeholder="Municipio" /></SelectTrigger>
                  <SelectContent>
                    {destinoMunicipios.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleBulkQuote} disabled={!canQuote || loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Cotizar Catalogo Completo
            </Button>
          </div>
          {loading && (
            <div className="mt-4 space-y-1">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Productos Cotizados</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Exitosos</p>
                <p className="text-2xl font-bold text-green-600">{successResults.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Costo Promedio</p>
                <p className="text-2xl font-bold">${Math.round(avgCost).toLocaleString('es-CO')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Impacto Flete Prom.</p>
                <p className="text-2xl font-bold">{avgImpact.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Costo Promedio por Tienda</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 28)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString('es-CO')}`} />
                      <Bar dataKey="promedio" name="Costo Prom." fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle por Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto border rounded-md" style={{ maxHeight: '400px' }}>
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium">Tienda</th>
                        <th className="px-2 py-2 text-left font-medium">Producto</th>
                        <th className="px-2 py-2 text-right font-medium">Precio</th>
                        <th className="px-2 py-2 text-right font-medium">Flete</th>
                        <th className="px-2 py-2 text-right font-medium">% Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-t hover:bg-muted/50">
                          <td className="px-2 py-2 text-xs">{r.shopName}</td>
                          <td className="px-2 py-2 text-xs">{r.productName}</td>
                          <td className="px-2 py-2 text-right">${r.priceCop.toLocaleString('es-CO')}</td>
                          <td className="px-2 py-2 text-right">
                            {r.shippingCost > 0
                              ? `$${r.shippingCost.toLocaleString('es-CO')}`
                              : <span className="text-destructive text-xs">Error</span>}
                          </td>
                          <td className={`px-2 py-2 text-right font-medium ${r.impactPct > 30 ? 'text-red-600' : r.impactPct > 15 ? 'text-orange-500' : 'text-green-600'}`}>
                            {r.impactPct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
