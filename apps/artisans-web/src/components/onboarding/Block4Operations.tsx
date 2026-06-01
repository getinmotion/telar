import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OnboardingAnswers } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

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
  { value: 'solo',        label: 'Trabajo solo/a' },
  { value: 'family',      label: 'Con mi familia' },
  { value: 'small_team',  label: 'Equipo pequeño' },
  { value: 'collective',  label: 'Colectivo' },
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 4 — Operaciones</h2>
        <p className="text-sm text-muted-foreground">¿Cómo está organizado tu trabajo hoy?</p>
      </div>

      {/* Q13 — monthly_capacity */}
      <div className="space-y-2">
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

      {/* Q14 — main_limitation */}
      <div className="space-y-2">
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

      {/* Q15 — work_structure */}
      <div className="space-y-2">
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

      {/* Q16 — primary_goal */}
      <div className="space-y-2">
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
    </div>
  );
}
