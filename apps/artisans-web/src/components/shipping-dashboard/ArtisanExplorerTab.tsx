import React, { useState, useMemo } from 'react';
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
import { Loader2, Search, Download } from 'lucide-react';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import type { ShopWithProducts } from '@/hooks/useShippingAnalytics';
import { quoteStandalone } from '@/services/shipping.actions';

interface ArtisanExplorerTabProps {
  shopsData: ShopWithProducts[];
}

const DESTINOS_RAPIDOS = [
  { label: 'Bogota', depto: 'CUNDINAMARCA', muni: 'BOGOTA, D.C.' },
  { label: 'Medellin', depto: 'ANTIOQUIA', muni: 'MEDELLIN' },
  { label: 'Cali', depto: 'VALLE DEL CAUCA', muni: 'CALI' },
  { label: 'Barranquilla', depto: 'ATLANTICO', muni: 'BARRANQUILLA' },
  { label: 'Cartagena', depto: 'BOLIVAR', muni: 'CARTAGENA' },
  { label: 'Cucuta', depto: 'NORTE DE SANTANDER', muni: 'CUCUTA' },
  { label: 'Pasto', depto: 'NARINO', muni: 'PASTO' },
];

interface CostMatrix {
  [productId: string]: {
    [destination: string]: { cost: number; error?: string };
  };
}

export const ArtisanExplorerTab: React.FC<ArtisanExplorerTabProps> = ({ shopsData }) => {
  const { getDaneCode } = useColombiaLocations();

  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedDestinos, setSelectedDestinos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [costMatrix, setCostMatrix] = useState<CostMatrix>({});

  const selectedShop = useMemo(
    () => shopsData.find((s) => s.shopId === selectedShopId),
    [shopsData, selectedShopId],
  );

  const quotableProducts = useMemo(
    () => selectedShop?.products.filter((p) => p.weightKg > 0 && p.lengthCm > 0) ?? [],
    [selectedShop],
  );

  const toggleDestino = (label: string) => {
    setSelectedDestinos((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label],
    );
  };

  const handleQuote = async () => {
    if (!selectedShop || selectedDestinos.length === 0) return;

    const origenDane = getDaneCode(selectedShop.department, selectedShop.municipality);
    if (!origenDane) return;

    setLoading(true);
    setProgress(0);
    setCostMatrix({});

    const matrix: CostMatrix = {};
    const total = quotableProducts.length * selectedDestinos.length;
    let completed = 0;

    for (const destLabel of selectedDestinos) {
      const dest = DESTINOS_RAPIDOS.find((d) => d.label === destLabel);
      if (!dest) continue;

      const destDane = getDaneCode(dest.depto, dest.muni);
      if (!destDane) continue;

      // Batch products for this destination
      const batchSize = 5;
      for (let i = 0; i < quotableProducts.length; i += batchSize) {
        const batch = quotableProducts.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (product) => {
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
                idCityDestino: String(destDane),
              });

              if (!matrix[product.productId]) matrix[product.productId] = {};
              matrix[product.productId][destLabel] = {
                cost: res.shippingCost,
                error: res.error,
              };
            } catch {
              if (!matrix[product.productId]) matrix[product.productId] = {};
              matrix[product.productId][destLabel] = { cost: 0, error: 'Error' };
            }
            completed++;
            setProgress((completed / total) * 100);
          }),
        );
      }
    }

    setCostMatrix(matrix);
    setLoading(false);
  };

  const exportCsv = () => {
    if (!selectedShop || Object.keys(costMatrix).length === 0) return;

    const headers = ['Producto', 'Precio', ...selectedDestinos.map((d) => `Flete ${d}`), ...selectedDestinos.map((d) => `% ${d}`)];
    const rows = quotableProducts.map((p) => {
      const costs = selectedDestinos.map((d) => costMatrix[p.productId]?.[d]?.cost ?? 0);
      const pcts = costs.map((c) => p.priceCop > 0 ? ((c / p.priceCop) * 100).toFixed(1) + '%' : 'N/A');
      return [p.productName, p.priceCop, ...costs, ...pcts].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `envios_${selectedShop.shopName.replace(/\s/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasResults = Object.keys(costMatrix).length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Seleccionar Artesano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedShopId} onValueChange={(v) => { setSelectedShopId(v); setCostMatrix({}); }}>
              <SelectTrigger><SelectValue placeholder="Elige una tienda" /></SelectTrigger>
              <SelectContent>
                {shopsData.map((s) => (
                  <SelectItem key={s.shopId} value={s.shopId}>
                    {s.shopName} ({s.products.length} prod.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedShop && (
              <div className="text-sm space-y-1">
                <p><strong>Departamento:</strong> {selectedShop.department || '—'}</p>
                <p><strong>Municipio:</strong> {selectedShop.municipality || '—'}</p>
                <p><strong>Productos cotizables:</strong> {quotableProducts.length} de {selectedShop.products.length}</p>
              </div>
            )}

            {/* Destination chips */}
            <div className="space-y-2">
              <Label className="font-semibold">Destinos</Label>
              <div className="flex flex-wrap gap-2">
                {DESTINOS_RAPIDOS.map((d) => (
                  <Button
                    key={d.label}
                    variant={selectedDestinos.includes(d.label) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDestino(d.label)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleQuote}
              disabled={!selectedShop || selectedDestinos.length === 0 || quotableProducts.length === 0 || loading}
              className="w-full gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Cotizar {selectedDestinos.length} destino(s)
            </Button>

            {loading && (
              <div className="space-y-1">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products table + matrix */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {hasResults ? 'Matriz de Costos' : 'Productos de la Tienda'}
            </CardTitle>
            {hasResults && (
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
                <Download className="w-3 h-3" /> CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedShop ? (
              <p className="text-muted-foreground text-sm py-10 text-center">
                Selecciona una tienda para ver sus productos.
              </p>
            ) : (
              <div className="overflow-auto border rounded-md" style={{ maxHeight: '500px' }}>
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Producto</th>
                      <th className="px-2 py-2 text-right font-medium">Precio</th>
                      <th className="px-2 py-2 text-right font-medium">Peso</th>
                      <th className="px-2 py-2 text-left font-medium">Dims</th>
                      {hasResults &&
                        selectedDestinos.map((d) => (
                          <th key={d} className="px-2 py-2 text-right font-medium">{d}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(hasResults ? quotableProducts : selectedShop.products).map((p) => (
                      <tr key={p.productId} className="border-t hover:bg-muted/50">
                        <td className="px-2 py-2 text-xs max-w-[150px] truncate">{p.productName}</td>
                        <td className="px-2 py-2 text-right">${p.priceCop.toLocaleString('es-CO')}</td>
                        <td className="px-2 py-2 text-right">{p.weightKg > 0 ? `${p.weightKg} kg` : '—'}</td>
                        <td className="px-2 py-2 text-xs">
                          {p.lengthCm > 0 ? `${p.lengthCm}x${p.widthCm}x${p.heightCm}` : '—'}
                        </td>
                        {hasResults &&
                          selectedDestinos.map((d) => {
                            const cell = costMatrix[p.productId]?.[d];
                            if (!cell) return <td key={d} className="px-2 py-2 text-right text-muted-foreground">—</td>;
                            const pct = p.priceCop > 0 ? (cell.cost / p.priceCop) * 100 : 0;
                            return (
                              <td
                                key={d}
                                className={`px-2 py-2 text-right text-xs font-medium ${
                                  cell.cost === 0
                                    ? 'text-destructive'
                                    : pct > 30
                                    ? 'text-red-600'
                                    : pct > 15
                                    ? 'text-orange-500'
                                    : 'text-green-600'
                                }`}
                              >
                                {cell.cost > 0
                                  ? `$${cell.cost.toLocaleString('es-CO')}`
                                  : 'Error'}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
