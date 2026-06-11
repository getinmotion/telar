<<<<<<< HEAD
import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
=======
import React from 'react';
import { Control, Controller } from 'react-hook-form';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OnboardingAnswers, ProductCategory } from '@/types/telarData.types';

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

const inputCls =
  "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/25 transition-all hover:border-[#e2d5cf]/80";
const inputBg: React.CSSProperties = { background: 'rgba(247,244,239,0.5)' };

const textareaCls =
  "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/25 transition-all hover:border-[#e2d5cf]/80 resize-none leading-relaxed";

const Label: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
    {children}
    {optional && <span className="ml-2 text-[#54433e]/30 normal-case tracking-normal font-[500] text-[11px]">— Opcional</span>}
  </label>
);

>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
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
=======
export const DIFFERENTIATORS = [
  { value: 'tecnica_unica',         label: 'Técnica única' },
  { value: 'diseno_propio',         label: 'Diseño propio' },
  { value: 'materiales_especiales', label: 'Materiales especiales' },
  { value: 'raiz_cultural',         label: 'Raíz cultural' },
  { value: 'precio_justo',          label: 'Precio justo' },
  { value: 'aun_no_lo_se',          label: 'Aún no lo sé' },
];

// Texto que se almacena en BD (coincide con DIFFERENTIATOR_LABELS del sync service)
export const DIFFERENTIATOR_STORED_LABELS: Record<string, string> = {
  tecnica_unica:         'Técnica o tradición (cómo lo hago)',
  diseno_propio:         'Diseño o creatividad propia (qué hago)',
  materiales_especiales: 'Materiales únicos o sostenibles',
  raiz_cultural:         'Historia, cultura o territorio',
  precio_justo:          'Precio accesible',
  aun_no_lo_se:          'No lo tengo claro',
};

const ORIGINS = [
  { value: 'family',     label: 'Mi familia' },
  { value: 'masters',    label: 'Maestros/as' },
  { value: 'academic',   label: 'Formación académica' },
  { value: 'autodidact', label: 'Autodidacta' },
  { value: 'mixed',      label: 'Combinación' },
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
];

export function Block1Artisan({ control }: Props) {
  return (
<<<<<<< HEAD
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Bloque 1 — Tu conocimiento artesanal</h2>
        <p className="text-sm text-muted-foreground">Cuéntanos quién eres como artesano/a.</p>
      </div>

      {/* Q1 — name */}
      <div className="space-y-2">
=======
    <div className="flex flex-col gap-5">

      {/* Nombre */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Label>¿Cómo te llamas?</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
<<<<<<< HEAD
            <Input placeholder="Tu nombre completo" {...field} value={field.value ?? ''} />
=======
            <input
              type="text"
              placeholder="Tu nombre completo"
              className={inputCls}
              style={inputBg}
              {...field}
              value={field.value ?? ''}
            />
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q1 — years_experience */}
      <div className="space-y-2">
=======
      {/* Años de experiencia */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
      {/* Q1 — story */}
      <div className="space-y-2">
        <Label>Cuéntanos tu historia con el oficio</Label>
=======
      {/* Historia */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label optional>Cuéntanos tu historia con el oficio</Label>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Controller
          name="story"
          control={control}
          render={({ field }) => (
<<<<<<< HEAD
            <Textarea
              placeholder="¿Cómo empezaste? ¿Qué te llevó a este camino?"
              rows={4}
=======
            <textarea
              rows={4}
              placeholder="¿Cómo empezaste? ¿Qué te llevó a este camino?"
              className={textareaCls}
              style={inputBg}
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q1 — meaning */}
      <div className="space-y-2">
        <Label>¿Qué significa este oficio para ti?</Label>
=======
      {/* Significado */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label optional>¿Qué significa este oficio para ti?</Label>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        <Controller
          name="meaning"
          control={control}
          render={({ field }) => (
<<<<<<< HEAD
            <Textarea
              placeholder="Lo que este trabajo representa en tu vida..."
              rows={3}
=======
            <textarea
              rows={3}
              placeholder="Lo que este trabajo representa en tu vida..."
              className={textareaCls}
              style={inputBg}
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

<<<<<<< HEAD
      {/* Q2 — product_category */}
      <div className="space-y-2">
        <Label>¿Qué tipo de productos creas? (puedes elegir varios)</Label>
=======
      {/* Categoría de productos */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label>¿Qué tipo de productos creas?</Label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-3">
          Puedes elegir varios.
        </p>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
      {/* Q3 — differentiator */}
      <div className="space-y-2">
=======
      {/* Diferenciador */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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

<<<<<<< HEAD
      {/* Q4 — learning_origin */}
      <div className="space-y-2">
=======
      {/* Origen de aprendizaje */}
      <div className="rounded-xl p-5" style={glassCard}>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
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
<<<<<<< HEAD
=======

>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
    </div>
  );
}
