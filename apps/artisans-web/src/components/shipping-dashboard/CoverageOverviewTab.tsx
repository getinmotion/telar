import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, CheckCircle, XCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ShopWithProducts } from '@/hooks/useShippingAnalytics';

interface CoverageOverviewTabProps {
  shopsData: ShopWithProducts[];
}

export const CoverageOverviewTab: React.FC<CoverageOverviewTabProps> = ({ shopsData }) => {
  const stats = useMemo(() => {
    const totalShops = shopsData.length;
    const withCoverage = shopsData.filter((s) => s.servientregaCoverage).length;
    const totalProducts = shopsData.reduce((sum, s) => sum + s.products.length, 0);
    const productsWithSpecs = shopsData.reduce(
      (sum, s) =>
        sum + s.products.filter((p) => p.weightKg > 0 && p.lengthCm > 0).length,
      0,
    );

    // Distribucion por departamento
    const deptMap = new Map<string, { shops: number; products: number }>();
    for (const shop of shopsData) {
      const dept = shop.department || 'Sin departamento';
      const entry = deptMap.get(dept) || { shops: 0, products: 0 };
      entry.shops += 1;
      entry.products += shop.products.length;
      deptMap.set(dept, entry);
    }

    const byDepartment = Array.from(deptMap.entries())
      .map(([name, data]) => ({ name, tiendas: data.shops, productos: data.products }))
      .sort((a, b) => b.tiendas - a.tiendas);

    return { totalShops, withCoverage, totalProducts, productsWithSpecs, byDepartment };
  }, [shopsData]);

  if (shopsData.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Carga los datos primero usando el boton "Actualizar" arriba.
      </div>
    );
  }

  const coveragePct = stats.totalShops > 0
    ? Math.round((stats.withCoverage / stats.totalShops) * 100)
    : 0;
  const specsPct = stats.totalProducts > 0
    ? Math.round((stats.productsWithSpecs / stats.totalProducts) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tiendas</p>
              <p className="text-2xl font-bold">{stats.totalShops}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Con Cobertura</p>
              <p className="text-2xl font-bold">{stats.withCoverage}</p>
              <p className="text-xs text-muted-foreground">{coveragePct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Con Dimensiones</p>
              <p className="text-2xl font-bold">{stats.productsWithSpecs}</p>
              <p className="text-xs text-muted-foreground">{specsPct}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tiendas por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(250, stats.byDepartment.length * 28)}>
                <BarChart data={stats.byDepartment} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="tiendas" name="Tiendas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalle por Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border rounded-md" style={{ maxHeight: '400px' }}>
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tienda</th>
                    <th className="px-3 py-2 text-left font-medium">Departamento</th>
                    <th className="px-3 py-2 text-left font-medium">Municipio</th>
                    <th className="px-3 py-2 text-right font-medium">Productos</th>
                    <th className="px-3 py-2 text-center font-medium">Cobertura</th>
                  </tr>
                </thead>
                <tbody>
                  {shopsData.map((shop) => (
                    <tr key={shop.shopId} className="border-t hover:bg-muted/50">
                      <td className="px-3 py-2 font-medium">{shop.shopName}</td>
                      <td className="px-3 py-2">{shop.department || '—'}</td>
                      <td className="px-3 py-2">{shop.municipality || '—'}</td>
                      <td className="px-3 py-2 text-right">{shop.products.length}</td>
                      <td className="px-3 py-2 text-center">
                        {shop.servientregaCoverage ? (
                          <CheckCircle className="w-4 h-4 text-green-500 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
