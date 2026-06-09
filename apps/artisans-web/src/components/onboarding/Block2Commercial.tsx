import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { OnboardingAnswers } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 2px 10px -2px rgba(0,0,0,0.05)',
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
    {children}
  </label>
);

const PRICE_RANGES = [
  { value: '<20k',       label: 'Menos de $20.000' },
  { value: '20-80k',    label: '$20.000 – $80.000' },
  { value: '80-200k',   label: '$80.000 – $200.000' },
  { value: '>200k',     label: 'Más de $200.000' },
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
    <div className="flex flex-col gap-5">

      {/* Rango de precios */}
      <div className="rounded-xl p-5" style={glassCard}>
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

      {/* Conoce costos */}
      <div className="rounded-xl p-5" style={glassCard}>
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
              <label
                htmlFor="knows_costs"
                className="font-['Manrope'] text-[13px] text-[#151b2d] cursor-pointer"
              >
                {field.value ? 'Sí, los conozco' : 'No, aún no'}
              </label>
            </div>
          )}
        />
      </div>

      {/* Método de precios */}
      <div className="rounded-xl p-5" style={glassCard}>
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

      {/* Rentabilidad */}
      <div className="rounded-xl p-5" style={glassCard}>
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
              <label
                htmlFor="feels_profitable"
                className="font-['Manrope'] text-[13px] text-[#151b2d] cursor-pointer"
              >
                {field.value ? 'Sí, me genera ingresos' : 'No todavía'}
              </label>
            </div>
          )}
        />
      </div>

    </div>
  );
}
