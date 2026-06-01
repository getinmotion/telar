import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { OnboardingAnswers } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

const PRICE_RANGES = [
  { value: '<20k',      label: 'Menos de $20.000' },
  { value: '20-80k',   label: '$20.000 – $80.000' },
  { value: '80-200k',  label: '$80.000 – $200.000' },
  { value: '>200k',    label: 'Más de $200.000' },
  { value: 'undefined', label: 'Varía mucho' },
];

const PRICING_METHODS = [
  { value: 'copy_others', label: 'Miro a otros' },
  { value: 'gut_feeling', label: 'Lo siento' },
  { value: 'unclear',     label: 'No tengo método' },
  { value: 'other',       label: 'Otro' },
];

export function Block2Commercial({ control }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 2 — Tu realidad comercial</h2>
        <p className="text-sm text-muted-foreground">Sin juicios. Solo queremos entender dónde estás.</p>
      </div>

      {/* Q5 — price_range */}
      <div className="space-y-2">
        <Label>¿En qué rango de precios venden la mayoría de tus productos? (COP)</Label>
        <Controller
          name="price_range"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {PRICE_RANGES.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q6 — knows_costs */}
      <div className="space-y-2">
        <Label>¿Sabes cuánto te cuesta producir cada pieza?</Label>
        <Controller
          name="knows_costs"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                id="knows_costs"
              />
              <label htmlFor="knows_costs" className="text-sm cursor-pointer">
                {field.value ? 'Sí, los conozco' : 'No, aún no'}
              </label>
            </div>
          )}
        />
      </div>

      {/* Q7 — pricing_method */}
      <div className="space-y-2">
        <Label>¿Cómo defines tus precios actualmente?</Label>
        <Controller
          name="pricing_method"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {PRICING_METHODS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q8 — feels_profitable */}
      <div className="space-y-2">
        <Label>¿Sientes que tu actividad artesanal es rentable?</Label>
        <Controller
          name="feels_profitable"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                id="feels_profitable"
              />
              <label htmlFor="feels_profitable" className="text-sm cursor-pointer">
                {field.value ? 'Sí, me genera ingresos' : 'No todavía'}
              </label>
            </div>
          )}
        />
      </div>
    </div>
  );
}
