import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OnboardingAnswers, ProductCategory } from '@/types/telarData.types';

interface Props {
  control: Control<OnboardingAnswers>;
}

const YEARS = [
  { value: '0-2', label: '0 – 2 años' },
  { value: '2-4', label: '2 – 4 años' },
  { value: '4+',  label: 'Más de 4 años' },
];

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'textiles',      label: 'Textiles' },
  { value: 'jewelry',       label: 'Joyería' },
  { value: 'home_decor',    label: 'Deco hogar' },
  { value: 'furniture',     label: 'Muebles' },
  { value: 'tableware',     label: 'Vajilla' },
  { value: 'art',           label: 'Arte' },
  { value: 'toys',          label: 'Juguetes' },
  { value: 'bags',          label: 'Bolsos' },
  { value: 'personal_care', label: 'Cuidado personal' },
];

const DIFFERENTIATORS = [
  { value: 'technique', label: 'Técnica única' },
  { value: 'design',    label: 'Diseño propio' },
  { value: 'materials', label: 'Materiales especiales' },
  { value: 'culture',   label: 'Raíz cultural' },
  { value: 'price',     label: 'Precio justo' },
  { value: 'unclear',   label: 'Aún no lo sé' },
];

const ORIGINS = [
  { value: 'family',      label: 'Mi familia' },
  { value: 'masters',     label: 'Maestros/as' },
  { value: 'academic',    label: 'Formación académica' },
  { value: 'autodidact',  label: 'Autodidacta' },
  { value: 'mixed',       label: 'Combinación' },
];

export function Block1Artisan({ control }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 1 — Tu conocimiento artesanal</h2>
        <p className="text-sm text-muted-foreground">Cuéntanos quién eres como artesano/a.</p>
      </div>

      {/* Q1 — name */}
      <div className="space-y-2">
        <Label>¿Cómo te llamas?</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input placeholder="Tu nombre completo" {...field} value={field.value ?? ''} />
          )}
        />
      </div>

      {/* Q1 — years_experience */}
      <div className="space-y-2">
        <Label>¿Cuántos años llevas practicando tu oficio?</Label>
        <Controller
          name="years_experience"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {YEARS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q1 — story */}
      <div className="space-y-2">
        <Label>Cuéntanos tu historia con el oficio</Label>
        <Controller
          name="story"
          control={control}
          render={({ field }) => (
            <Textarea
              placeholder="¿Cómo empezaste? ¿Qué te llevó a este camino?"
              rows={4}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      {/* Q1 — meaning */}
      <div className="space-y-2">
        <Label>¿Qué significa este oficio para ti?</Label>
        <Controller
          name="meaning"
          control={control}
          render={({ field }) => (
            <Textarea
              placeholder="Lo que este trabajo representa en tu vida..."
              rows={3}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      {/* Q2 — product_category */}
      <div className="space-y-2">
        <Label>¿Qué tipo de productos creas? (puedes elegir varios)</Label>
        <Controller
          name="product_category"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="multiple"
              value={field.value ?? []}
              onValueChange={(v) => field.onChange(v)}
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q3 — differentiator */}
      <div className="space-y-2">
        <Label>¿Qué hace que tu trabajo sea diferente?</Label>
        <Controller
          name="differentiator"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {DIFFERENTIATORS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-4">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      {/* Q4 — learning_origin */}
      <div className="space-y-2">
        <Label>¿Cómo aprendiste tu oficio?</Label>
        <Controller
          name="learning_origin"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v || undefined)}
              className="flex flex-wrap gap-2"
            >
              {ORIGINS.map((o) => (
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
