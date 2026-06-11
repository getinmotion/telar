<<<<<<< HEAD
import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
=======
import React from 'react';
import { Control, Controller } from 'react-hook-form';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OnboardingAnswers } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

<<<<<<< HEAD
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

>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
const MONTHLY_CAPACITY = [
  { value: '<10',     label: 'Menos de 10' },
  { value: '10-30',  label: '10 – 30' },
  { value: '30-100', label: '30 – 100' },
  { value: '>100',   label: 'Más de 100' },
  { value: 'unknown', label: 'No lo sé' },
];

const LIMITATIONS = [
  { value: 'time',      label: 'Tiempo' },
  { value: 'money',     label: 'Capital' },
  { value: 'materials', label: 'Materiales' },
  { value: 'sales',     label: 'Ventas' },
  { value: 'knowledge', label: 'Conocimiento' },
  { value: 'unclear',   label: 'No lo tengo claro' },
];

const WORK_STRUCTURES = [
<<<<<<< HEAD
  { value: 'solo',        label: 'Trabajo solo/a' },
  { value: 'family',      label: 'Con mi familia' },
  { value: 'small_team',  label: 'Equipo pequeño' },
  { value: 'collective',  label: 'Colectivo' },
=======
  { value: 'solo',       label: 'Trabajo solo/a' },
  { value: 'family',     label: 'Con mi familia' },
  { value: 'small_team', label: 'Equipo pequeño' },
  { value: 'collective', label: 'Colectivo' },
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
];

const PRIMARY_GOALS = [
  { value: 'better_showcase', label: 'Mostrar mejor mi trabajo' },
  { value: 'pricing',         label: 'Poner precios justos' },
  { value: 'more_sales',      label: 'Vender más' },
  { value: 'organization',    label: 'Organizarme mejor' },
  { value: 'lost',            label: 'No sé por dónde empezar' },
];

export function Block4Operations({ control }: Props) {
  return (
<<<<<<< HEAD
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 4 — Operaciones</h2>
        <p className="text-sm text-muted-foreground">¿Cómo está organizado tu trabajo hoy?</p>
      </div>

      {/* Q13 — monthly_capacity */}
      <div className="space-y-2">
=======
    <div className="flex flex-col gap-5">

      {/* Capacidad mensual */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Label>¿Cuántas piezas puedes producir al mes aproximadamente?</Label>
        <Controller
          name="monthly_capacity"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {MONTHLY_CAPACITY.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q14 — main_limitation */}
      <div className="space-y-2">
=======
      {/* Limitación principal */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Label>¿Cuál es tu principal limitación para crecer?</Label>
        <Controller
          name="main_limitation"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {LIMITATIONS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q15 — work_structure */}
      <div className="space-y-2">
=======
      {/* Estructura de trabajo */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Label>¿Cómo está estructurado tu trabajo?</Label>
        <Controller
          name="work_structure"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {WORK_STRUCTURES.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q16 — primary_goal */}
      <div className="space-y-2">
=======
      {/* Objetivo principal */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Label>¿Cuál es tu objetivo principal en Telar?</Label>
        <Controller
          name="primary_goal"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {PRIMARY_GOALS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>
<<<<<<< HEAD
=======

>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
    </div>
  );
}
