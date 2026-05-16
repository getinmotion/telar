import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OnboardingAnswers, SalesChannel } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

const TARGET_CUSTOMERS = [
  { value: 'tourists',       label: 'Turistas' },
  { value: 'handmade_lovers', label: 'Amantes de lo artesanal' },
  { value: 'gift_buyers',    label: 'Compradores de regalos' },
  { value: 'designers',      label: 'Diseñadores / marcas' },
  { value: 'unclear',        label: 'Aún no lo sé' },
];

const DIGITAL_PRESENCE = [
  { value: 'none',       label: 'Sin presencia digital' },
  { value: 'inactive',   label: 'Tengo pero no publico' },
  { value: 'occasional', label: 'Publico a veces' },
  { value: 'active',     label: 'Activo regularmente' },
];

const CHANNELS: { value: SalesChannel; label: string }[] = [
  { value: 'none',        label: 'Ninguno aún' },
  { value: 'social',      label: 'Redes sociales' },
  { value: 'whatsapp',    label: 'WhatsApp' },
  { value: 'fairs',       label: 'Ferias' },
  { value: 'own_store',   label: 'Tienda propia' },
  { value: 'marketplace', label: 'Marketplace' },
];

const SALES_FREQUENCY = [
  { value: 'none',       label: 'Aún no vendo' },
  { value: 'occasional', label: 'Esporádicamente' },
  { value: 'irregular',  label: 'Irregular' },
  { value: 'constant',   label: 'De forma constante' },
];

export function Block3Clients({ control }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 3 — Clientes y mercado</h2>
        <p className="text-sm text-muted-foreground">¿A quién le vendes y cómo llegas a ellos?</p>
      </div>

      {/* Q9 — target_customer */}
      <div className="space-y-2">
        <Label>¿Quién es tu cliente ideal?</Label>
        <Controller
          name="target_customer"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {TARGET_CUSTOMERS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q10 — digital_presence */}
      <div className="space-y-2">
        <Label>¿Cómo describirías tu presencia digital actualmente?</Label>
        <Controller
          name="digital_presence"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {DIGITAL_PRESENCE.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q11 — current_channels */}
      <div className="space-y-2">
        <Label>¿Dónde vendes hoy? (puedes elegir varios)</Label>
        <Controller
          name="current_channels"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="multiple"
              value={field.value ?? []}
              onValueChange={(v) => field.onChange(v)}
              className="flex flex-wrap gap-2"
            >
              {CHANNELS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q12 — sales_frequency */}
      <div className="space-y-2">
        <Label>¿Con qué frecuencia realizas ventas?</Label>
        <Controller
          name="sales_frequency"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {SALES_FREQUENCY.map((o) => (
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
