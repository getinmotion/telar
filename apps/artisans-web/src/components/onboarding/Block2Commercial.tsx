<<<<<<< HEAD
import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
=======
import React from 'react';
import { Control, Controller } from 'react-hook-form';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { OnboardingAnswers } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

<<<<<<< HEAD
const PRICE_RANGES = [
  { value: '<20k',      label: 'Menos de $20.000' },
  { value: '20-80k',   label: '$20.000 – $80.000' },
  { value: '80-200k',  label: '$80.000 – $200.000' },
  { value: '>200k',    label: 'Más de $200.000' },
=======
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
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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
<<<<<<< HEAD
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 2 — Tu realidad comercial</h2>
        <p className="text-sm text-muted-foreground">Sin juicios. Solo queremos entender dónde estás.</p>
      </div>

      {/* Q5 — price_range */}
      <div className="space-y-2">
=======
    <div className="flex flex-col gap-5">

      {/* Rango de precios */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
      {/* Q6 — knows_costs */}
      <div className="space-y-2">
=======
      {/* Conoce costos */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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
<<<<<<< HEAD
              <label htmlFor="knows_costs" className="text-sm cursor-pointer">
=======
              <label
                htmlFor="knows_costs"
                className="font-['Manrope'] text-[13px] text-[#151b2d] cursor-pointer"
              >
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                {field.value ? 'Sí, los conozco' : 'No, aún no'}
              </label>
            </div>
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q7 — pricing_method */}
      <div className="space-y-2">
=======
      {/* Método de precios */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
      {/* Q8 — feels_profitable */}
      <div className="space-y-2">
=======
      {/* Rentabilidad */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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
<<<<<<< HEAD
              <label htmlFor="feels_profitable" className="text-sm cursor-pointer">
=======
              <label
                htmlFor="feels_profitable"
                className="font-['Manrope'] text-[13px] text-[#151b2d] cursor-pointer"
              >
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
                {field.value ? 'Sí, me genera ingresos' : 'No todavía'}
              </label>
            </div>
          )}
        />
      </div>
<<<<<<< HEAD
=======

>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
    </div>
  );
}
