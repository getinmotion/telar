import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  CreateProductV2Data,
  AvailabilityType,
  ProductionInfo,
  PhysicalSpecs,
} from './types';

interface StepPrecioProps {
  data: CreateProductV2Data;
  onChange: (updates: Partial<CreateProductV2Data>) => void;
}

const AVAILABILITY_TYPES: { value: AvailabilityType; label: string; desc: string; icon: string }[] = [
  {
    value: 'en_stock',
    label: 'En Stock',
    desc: 'Piezas listas para enviar',
    icon: 'inventory_2',
  },
  {
    value: 'bajo_pedido',
    label: 'Bajo Pedido',
    desc: 'Se elabora cuando se solicita',
    icon: 'schedule',
  },
  {
    value: 'edicion_limitada',
    label: 'Edición Limitada',
    desc: 'Cantidad finita, no se reproduce',
    icon: 'diamond',
  },
];

export function StepPrecio({ data, onChange }: StepPrecioProps) {
  const production = data.production ?? ({ availabilityType: 'en_stock' } as ProductionInfo);
  const specs = data.physicalSpecs ?? ({} as Partial<PhysicalSpecs>);

  const updateProduction = (updates: Partial<ProductionInfo>) => {
    onChange({
      production: { ...production, ...updates } as ProductionInfo,
    });
  };

  const updateSpecs = (updates: Partial<PhysicalSpecs>) => {
    onChange({
      physicalSpecs: { ...specs, ...updates } as PhysicalSpecs,
    });
  };

  const formatPrice = (value: number | undefined) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const parsePrice = (str: string): number => {
    return parseInt(str.replace(/\D/g, ''), 10) || 0;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="text-primary font-bold uppercase text-[10px] tracking-[0.3em] mb-3 block">
          Paso 3 de 4
        </span>
        <h2 className="text-4xl lg:text-5xl font-serif italic text-charcoal mb-4">
          Precio y Disponibilidad
        </h2>
        <p className="text-charcoal/50 text-sm italic max-w-md mx-auto">
          Define el valor de tu pieza y cómo estará disponible para quienes la buscan.
        </p>
      </div>

      <div className="space-y-12">
        {/* Precio */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Precio *
          </Label>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-serif text-charcoal/30">$</span>
            <Input
              value={formatPrice(data.price)}
              onChange={(e) => onChange({ price: parsePrice(e.target.value) })}
              placeholder="0"
              className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-4xl font-serif placeholder:text-charcoal/15 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent w-48"
            />
            <span className="text-sm text-charcoal/30 font-bold tracking-wider">COP</span>
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Disponibilidad
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {AVAILABILITY_TYPES.map((a) => (
              <button
                key={a.value}
                onClick={() => updateProduction({ availabilityType: a.value })}
                className={`border p-6 text-left transition-all group ${
                  production.availabilityType === a.value
                    ? 'border-charcoal bg-charcoal/5'
                    : 'border-charcoal/10 hover:border-charcoal/30'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl mb-3 block transition-colors ${
                    production.availabilityType === a.value
                      ? 'text-primary'
                      : 'text-charcoal/20 group-hover:text-charcoal/40'
                  }`}
                >
                  {a.icon}
                </span>
                <span className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1">
                  {a.label}
                </span>
                <span className="block text-[10px] text-charcoal/40 italic">{a.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campos condicionales según disponibilidad */}
        {production.availabilityType === 'en_stock' && (
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Cantidad disponible
            </Label>
            <Input
              type="number"
              min={0}
              value={data.variants?.[0]?.stockQuantity ?? ''}
              onChange={(e) => {
                const qty = parseInt(e.target.value, 10) || 0;
                onChange({
                  variants: [
                    {
                      basePriceMinor: (data.price ?? 0) * 100,
                      stockQuantity: qty,
                    },
                  ],
                });
              }}
              placeholder="Ej: 5"
              className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-lg font-serif placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent w-32"
            />
          </div>
        )}

        {production.availabilityType === 'bajo_pedido' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
                Tiempo de producción (días)
              </Label>
              <Input
                type="number"
                min={1}
                value={production.productionTimeDays ?? ''}
                onChange={(e) =>
                  updateProduction({ productionTimeDays: parseInt(e.target.value, 10) || undefined })
                }
                placeholder="Ej: 15"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-lg font-serif placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
                Capacidad mensual
              </Label>
              <Input
                type="number"
                min={1}
                value={production.monthlyCapacity ?? ''}
                onChange={(e) =>
                  updateProduction({ monthlyCapacity: parseInt(e.target.value, 10) || undefined })
                }
                placeholder="Ej: 10"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-lg font-serif placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
          </div>
        )}

        {production.availabilityType === 'edicion_limitada' && (
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Piezas en esta edición
            </Label>
            <Input
              type="number"
              min={1}
              value={data.variants?.[0]?.stockQuantity ?? ''}
              onChange={(e) => {
                const qty = parseInt(e.target.value, 10) || 0;
                onChange({
                  variants: [
                    {
                      basePriceMinor: (data.price ?? 0) * 100,
                      stockQuantity: qty,
                    },
                  ],
                });
              }}
              placeholder="Ej: 20"
              className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-lg font-serif placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent w-32"
            />
          </div>
        )}

        {/* Especificaciones físicas */}
        <div className="space-y-4 pt-8 border-t border-charcoal/10">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Especificaciones físicas
          </Label>
          <p className="text-[10px] text-charcoal/30 italic -mt-2">
            Opcional, pero ayuda a calcular costos de envío
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">
                Alto (cm)
              </span>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={specs.heightCm ?? ''}
                onChange={(e) => updateSpecs({ heightCm: parseFloat(e.target.value) || undefined })}
                placeholder="—"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-2 text-sm font-serif placeholder:text-charcoal/15 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">
                Ancho (cm)
              </span>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={specs.widthCm ?? ''}
                onChange={(e) => updateSpecs({ widthCm: parseFloat(e.target.value) || undefined })}
                placeholder="—"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-2 text-sm font-serif placeholder:text-charcoal/15 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">
                Largo (cm)
              </span>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={specs.lengthOrDiameterCm ?? ''}
                onChange={(e) =>
                  updateSpecs({ lengthOrDiameterCm: parseFloat(e.target.value) || undefined })
                }
                placeholder="—"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-2 text-sm font-serif placeholder:text-charcoal/15 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">
                Peso (kg)
              </span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={specs.realWeightKg ?? ''}
                onChange={(e) =>
                  updateSpecs({ realWeightKg: parseFloat(e.target.value) || undefined })
                }
                placeholder="—"
                className="border-0 border-b border-charcoal/15 rounded-none px-0 py-2 text-sm font-serif placeholder:text-charcoal/15 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
