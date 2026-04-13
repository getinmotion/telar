import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Truck, Loader2 } from 'lucide-react';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import { useShippingAnalytics } from '@/hooks/useShippingAnalytics';

const PRESETS = [
  { label: 'Pequeno (20x20x20, 1kg)', largo: 20, ancho: 20, alto: 20, peso: 1 },
  { label: 'Mediano (30x30x30, 3kg)', largo: 30, ancho: 30, alto: 30, peso: 3 },
  { label: 'Grande (40x40x40, 5kg)', largo: 40, ancho: 40, alto: 40, peso: 5 },
];

export const BoxSimulatorTab: React.FC = () => {
  const { departments, getMunicipalities, getDaneCode } = useColombiaLocations();
  const { quoteBox } = useShippingAnalytics();

  const [peso, setPeso] = useState(3);
  const [largo, setLargo] = useState(30);
  const [ancho, setAncho] = useState(20);
  const [alto, setAlto] = useState(20);
  const [valorDeclarado, setValorDeclarado] = useState(150000);

  const [origenDepto, setOrigenDepto] = useState('');
  const [origenMuni, setOrigenMuni] = useState('');
  const [destinoDepto, setDestinoDepto] = useState('');
  const [destinoMuni, setDestinoMuni] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    shippingCost: number;
    estimatedDays: number;
    error?: string;
  } | null>(null);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setLargo(preset.largo);
    setAncho(preset.ancho);
    setAlto(preset.alto);
    setPeso(preset.peso);
  };

  const handleQuote = async () => {
    const origenDane = getDaneCode(origenDepto, origenMuni);
    const destinoDane = getDaneCode(destinoDepto, destinoMuni);

    if (!origenDane || !destinoDane) {
      setResult({ shippingCost: 0, estimatedDays: 0, error: 'No se pudo resolver el codigo DANE para las ciudades seleccionadas' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await quoteBox({
        pieces: [{ peso, largo, ancho, alto }],
        valorDeclarado,
        idCityOrigen: origenDane,
        idCityDestino: destinoDane,
      });
      setResult(res);
    } catch (err: any) {
      setResult({ shippingCost: 0, estimatedDays: 0, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const origenMunicipios = origenDepto ? getMunicipalities(origenDepto) : [];
  const destinoMunicipios = destinoDepto ? getMunicipalities(destinoDepto) : [];
  const canQuote = origenDepto && origenMuni && destinoDepto && destinoMuni;

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} variant="outline" size="sm" onClick={() => applyPreset(p)}>
            <Package className="w-3 h-3 mr-1" />
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dimensiones del paquete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" min={0.1} step={0.1} value={peso} onChange={(e) => setPeso(Number(e.target.value))} />
              </div>
              <div>
                <Label>Valor declarado (COP)</Label>
                <Input type="number" min={10000} step={10000} value={valorDeclarado} onChange={(e) => setValorDeclarado(Number(e.target.value))} />
              </div>
              <div>
                <Label>Largo (cm)</Label>
                <Input type="number" min={1} value={largo} onChange={(e) => setLargo(Number(e.target.value))} />
              </div>
              <div>
                <Label>Ancho (cm)</Label>
                <Input type="number" min={1} value={ancho} onChange={(e) => setAncho(Number(e.target.value))} />
              </div>
              <div>
                <Label>Alto (cm)</Label>
                <Input type="number" min={1} value={alto} onChange={(e) => setAlto(Number(e.target.value))} />
              </div>
            </div>

            {/* Origen */}
            <div className="space-y-2">
              <Label className="font-semibold">Ciudad Origen</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={origenDepto} onValueChange={(v) => { setOrigenDepto(v); setOrigenMuni(''); }}>
                  <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={origenMuni} onValueChange={setOrigenMuni} disabled={!origenDepto}>
                  <SelectTrigger><SelectValue placeholder="Municipio" /></SelectTrigger>
                  <SelectContent>
                    {origenMunicipios.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-2">
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

            <Button onClick={handleQuote} disabled={!canQuote || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
              Cotizar Envio
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <p className="text-muted-foreground text-sm">Configura las dimensiones y ciudades, luego presiona "Cotizar Envio".</p>
            )}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {result && !loading && (
              <div className="space-y-4">
                {result.error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {result.error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Costo Envio</p>
                      <p className="text-3xl font-bold">
                        ${result.shippingCost.toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-muted-foreground">COP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Tiempo Estimado</p>
                      <p className="text-3xl font-bold">{result.estimatedDays}</p>
                      <p className="text-xs text-muted-foreground">dias habiles</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Peso volumetrico: {((largo * ancho * alto) / 6000).toFixed(2)} kg</p>
                  <p>Impacto flete/valor: {valorDeclarado > 0 ? ((result.shippingCost / valorDeclarado) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
