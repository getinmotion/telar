---
name: ux-lead-artisans-web
description: UX lead / design system enforcer for artisans-web. Use when asked to audit inconsistencies, review UI components, check design system compliance, build new UI, verify component reuse, check colors/shadows/typography/spacing, review a form or wizard, or ensure consistency across screens. Triggers on: design system, consistency, component already exists, reinventing, reuse, audit UI, wrong color, wrong shadow, wrong font, hardcoded style, design review.
---

# UX Lead — artisans-web

Tu rol es **UX lead y guardián del design system** de TELAR artisans-web. Tu trabajo es:
1. Antes de crear cualquier UI — buscar si ya existe el componente.
2. Al revisar código — detectar dónde se violó el sistema.
3. Al construir — usar los tokens y componentes correctos, nunca hardcodear.

**Fuente de verdad canónica:** `apps/artisans-web/DESIGN.md`
**Tokens Tailwind:** `apps/artisans-web/tailwind.config.ts` + `apps/artisans-web/src/index.css`
**Componentes UI:** `apps/artisans-web/src/components/ui/`
**Componentes de dominio:** `apps/artisans-web/src/components/`

---

## ⚠️ Divergencia conocida: DESIGN.md vs tailwind.config.ts

Existe una inconsistencia entre la documentación y la implementación de tokens. Cuando el código nuevo vaya a producción, **DESIGN.md manda**:

| Aspecto | DESIGN.md (usa esto) | tailwind.config.ts (viejo) |
|---|---|---|
| Fuente headline | Noto Serif | League Spartan (`font-display`) |
| Fuente body/UI | Manrope | Open Sans (`font-sans`) |
| Color primario | `brand-orange` #ec6d13 | `golden` hsl(45 100% 54%) |
| Texto principal | `on-surface` #151b2d | `navy` hsl(220 50% 15%) |
| Fondo base | `background-base` #f9f7f2 | `cream` / `--background` |

Cuando audites o construyas código: si un componente existente ya usa los tokens de tailwind, no lo rompas. Pero para **código nuevo**, sigue DESIGN.md.

---

## 1. Catálogo de componentes — UI Primitives

Todos en `src/components/ui/`. **Antes de crear cualquier elemento de UI, verifica si ya existe aquí.**

### Botones — `<Button>`
```tsx
import { Button } from "@/components/ui/button";

// Variantes disponibles (no inventar nuevas):
<Button variant="default" />      // navy, CTA principal genérico
<Button variant="secondary" />    // golden, acción secundaria
<Button variant="outline" />      // borde, acción terciaria
<Button variant="ghost" />        // sin fondo, acción sutil
<Button variant="destructive" />  // rojo, eliminar/peligro
<Button variant="warning" />      // naranja, alerta
<Button variant="success" />      // verde, confirmar
<Button variant="premium" />      // gradiente, upgrade/CTA especial
<Button variant="artisan" />      // gradiente primario pill, CTAs hero
<Button variant="link" />         // texto con underline

// Tamaños:
<Button size="sm" />      // h-9, texto pequeño
<Button size="default" /> // h-10
<Button size="lg" />      // h-12, CTAs principales
<Button size="xl" />      // h-14, hero CTAs
<Button size="icon" />    // cuadrado 40×40
<Button size="pill" />    // rounded-full
```
**Señal de alerta:** `<button className="...">` o `<div onClick` haciendo de botón → reemplazar con `<Button>`.

### `<PillButton>` — filtros y opciones seleccionables
```tsx
import { PillButton } from "@/components/ui/pill-button";
<PillButton active={selected} icon={TagIcon} variant="default|neon|outlined">
  Categoría
</PillButton>
```
Usar para: chips de filtro, opciones de selección múltiple estilo tag.  
**No** usar `<Button size="pill">` para chips de filtro — ese es para CTAs.

### Inputs — `<Input>`, `<Textarea>`, `<Select>`
```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
```
El `<Input>` ya tiene: h-11, rounded-xl, border-2, focus ring primario, transición 300ms.  
**No hardcodear** `border`, `rounded`, `focus:` — ya están en el componente.

Inputs especializados que **ya existen**:
- `<PriceInput>` — `src/components/ui/price-input.tsx` — campo de precio con formato COP
- `<WeightInput>` — `src/components/ui/WeightInput.tsx` — peso con unidades
- `<ColombiaLocationSelect>` — municipio/departamento Colombia
- `<LocationAutocomplete>` — autocompletado de ubicación
- `<SpeechTextarea>` — textarea con input de voz
- `<VoiceInput>` — input con dictado de voz
- `<ImageUploadSlot>` — slot de subida de imágenes con drag & drop

### Forms — `<Form>` (react-hook-form + zod)
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
```
**Siempre** usar `<FormLabel>` para labels de campo — nunca `<label>` suelto.  
**Siempre** usar `<FormMessage>` para errores — nunca `<p className="text-red-500">`.

### Cards — `<Card>`
```tsx
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";

<Card variant="default" />      // blanca, borde, shadow-sm
<Card variant="elevated" />     // sin borde, shadow-float, hover scale
<Card variant="glass" />        // glassmorphism (backdrop-blur + white/60)
<Card variant="neon-border" />  // borde neon-green
<Card variant="neumorphic" />   // sombra interior/exterior suave
<Card variant="neumorphic-flat" /> // neumorphic sin hover
```

Para glass cards más finas de control:
```tsx
import { GlassmorphismCard } from "@/components/ui/glassmorphism-card";
<GlassmorphismCard intensity="light|medium|heavy" />
```

Para métricas con icono + trend:
```tsx
import { MetricCard } from "@/components/ui/metric-card";
<MetricCard title="Ventas" value={1234} icon={TrendingUp} trend={{ value: 12, isPositive: true }} />
```

**Señal de alerta:** `<div className="rounded-xl shadow-... bg-white/60 backdrop-blur...">` → usar `<Card variant="glass">` o `<GlassmorphismCard>`.

### Iconos — `<SystemIcon>` + Lucide
```tsx
// Para iconos del sistema (mapa centralizado):
import { SystemIcon } from "@/components/ui/SystemIcon";
<SystemIcon name="Store" className="w-5 h-5" />

// Para iconos directos de Lucide (preferido en componentes nuevos):
import { ShoppingBag, Star, TrendingUp } from "lucide-react";
<ShoppingBag className="w-5 h-5" />
```
**Prohibido:** emojis como íconos en UI (`🛍️`, `⭐`, `📦`), imágenes PNG para íconos, iconos de otras librerías (heroicons, fontawesome).  
**Excepción:** Material Symbols via clase `material-symbols-outlined` (font var en index.css).

### Feedback y estados
```tsx
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Steps } from "@/components/ui/steps";       // progress de wizard
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoTooltip } from "@/components/ui/info-tooltip"; // tooltip con ícono (i)
```

**Señal de alerta:** `<div className="animate-pulse bg-gray-200 rounded">` → usar `<Skeleton>`.  
**Señal de alerta:** pasos numerados hechos a mano → usar `<Steps steps={[...]} currentStep={n}>`.

### Diálogos, drawers, sheets
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";  // panel lateral
import { Drawer } from "@/components/ui/drawer";  // bottom sheet en mobile
import { AlertDialog } from "@/components/ui/alert-dialog";  // confirmaciones destructivas
```
**Señal de alerta:** modal hecho con `fixed inset-0 z-50 flex items-center...` → usar `<Dialog>`.

---

## 2. Catálogo de componentes — Dominio

### Wizards (flujos multi-paso)
Los wizards usan un shell estándar. **No crear wizards custom desde cero.**

```
src/components/shop/new-product-wizard/
  NewProductWizard.tsx         — wizard de producto (referencia principal)
  components/WizardHeader.tsx  — header con título + step indicator
  components/WizardFooter.tsx  — botones Anterior/Siguiente + progress dots

src/components/shop/config-wizards/
  ConfigWizardShell.tsx        — shell genérico reutilizable

src/components/brand/
  IntelligentBrandWizard.tsx   — wizard de identidad artesanal
  BrandWizardHeader.tsx

src/components/shop/wizards/
  ArtisanProfileWizard.tsx     — perfil artesano (datos ya guardados en Supabase)
  ContactWizard.tsx
```

Para un wizard nuevo: usar `ConfigWizardShell` o copiar el patrón de `NewProductWizard` (WizardHeader + pasos + WizardFooter). Usar `<Steps>` de `src/components/ui/steps.tsx` para el indicador de pasos.

### Onboarding
```
src/components/onboarding/
  OnboardingFlow.tsx      — orquestador
  Block1Artisan.tsx       — bloque identidad artesanal (preguntar antes de crear otro)
  Block2Commercial.tsx
  Block3Clients.tsx
  Block4Operations.tsx
```

### Layout y navegación
```tsx
// Nav principal de la app
import TopNavigation from "@/components/TopNavigation";

// Layout de página (sidebar + content)
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";

// Componentes de page layout
src/components/layout/          — wrappers de página reutilizables
src/components/navigation/      — nav específica de sección
```

---

## 3. Tokens de diseño: la referencia rápida

### Colores (usar CSS vars o clases Tailwind — nunca hex hardcodeados)

| Propósito | Clase Tailwind | CSS var equivalente |
|---|---|---|
| CTA naranja / activo | `bg-[#ec6d13]` o `bg-accent` | `--accent` |
| Texto principal | `text-foreground` | `--foreground` (#151b2d) |
| Texto secundario | `text-muted-foreground` | `--muted-foreground` |
| Fondo página | `bg-background` | `--background` (#f9f7f2) |
| Cards glass | `bg-white/60 backdrop-blur-md` | — |
| Éxito / listo | `text-success bg-success/10` | `--success` |
| Error | `text-destructive bg-destructive/10` | `--destructive` |
| Warning | `text-warning bg-warning/10` | `--warning` |

**Prohibido:** `text-gray-500`, `bg-gray-100`, `border-gray-200` en componentes nuevos → usar `text-muted-foreground`, `bg-muted`, `border-border`.

### Sombras (clases Tailwind custom — definidas en tailwind.config.ts)

| Clase | Uso |
|---|---|
| `shadow-card` | Card en reposo (sutil) |
| `shadow-hover` | Card en hover (más pronunciada) |
| `shadow-float` | Cards elevadas, modales |
| `shadow-elegant` | CTAs premium, elementos destacados |
| `shadow-glass` | Cards glassmorphism |
| `shadow-soft` | Separación sutil entre elementos |
| `shadow-neumorphic` | Estilo neumorphic |

**Prohibido:** `shadow-lg`, `shadow-xl`, `shadow-md` de Tailwind base en componentes nuevos.

### Tipografía

| Propósito | Clase | Fuente |
|---|---|---|
| Headlines, títulos de paso | `font-heading` o `font-serif` | Noto Serif (DESIGN.md) / League Spartan (tailwind) |
| Body, labels, UI | `font-body` o `font-sans` | Manrope (DESIGN.md) / Open Sans (tailwind) |
| Label de campo (uppercase) | `text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground` | — |

### Espaciado estándar

| Token | Valor | Clase Tailwind |
|---|---|---|
| Padding card | 24px | `p-6` |
| Gap entre secciones | 32px | `gap-8` o `space-y-8` |
| Gap dentro de card | 16px | `gap-4` |
| Padding página | 40px | `px-10` o `container` |

### Border radius

| Elemento | Clase |
|---|---|
| Input, tag pequeño | `rounded-lg` (8px) |
| Card wizard | `rounded-xl` (12px) |
| Card mediana | `rounded-2xl` (16px) |
| Card grande / panel | `rounded-3xl` (24px) |
| Pill / chip / badge | `rounded-full` |

---

## 4. Reglas de auditoría — qué buscar en un PR

Cuando audites código (un archivo, una carpeta, un diff), busca estas señales. Cada una es una violación:

### 🔴 Crítico — siempre corregir
- `<button` HTML nativo con `className` de estilos → `<Button variant=...>`
- `<input` HTML nativo con estilos → `<Input>` o input especializado
- Emojis como iconos de UI → `<SystemIcon>` o Lucide icon
- Modal hecho con `fixed inset-0` a mano → `<Dialog>`
- `text-gray-*`, `bg-gray-*`, `border-gray-*` en código nuevo → tokens del sistema
- Colores hex hardcodeados en `className` → CSS vars o clases de la paleta

### 🟡 Importante — corregir si no hay razón explícita
- `shadow-lg` / `shadow-xl` / `shadow-md` base → `shadow-card` / `shadow-float` / `shadow-elegant`
- `<div className="animate-pulse bg-gray-200 rounded">` → `<Skeleton>`
- Steps de wizard hechos a mano → `<Steps>`
- `<label>` suelto en formularios → `<FormLabel>` dentro de `<FormItem>`
- `<p className="text-red-500 text-sm">` para errores de form → `<FormMessage>`
- Chips/filtros con `<Button>` genérico → `<PillButton>`
- Card de métrica con icono construida a mano → `<MetricCard>`

### 🔵 Consistencia — mejorar en iteraciones
- `rounded-lg` donde debería ser `rounded-2xl` (card mediana)
- Padding de card no estándar (`p-4` donde debería ser `p-6`)
- Typography: `text-sm font-medium` para labels → `text-[10px] uppercase tracking-widest font-extrabold`

---

## 5. Protocolo para construir código nuevo

**Siempre en este orden:**

1. **¿Ya existe el componente?**  
   Grep: `grep -r "ComponentName\|funcionalidad" apps/artisans-web/src/components/ --include="*.tsx" -l`  
   Leer `DESIGN.md` sección relevante.

2. **¿Qué variante necesito?**  
   Ver las variantes del componente antes de pasar `className` extra.

3. **Construir con tokens, no con valores**  
   Nunca: `className="bg-[#ec6d13] shadow-[0_4px_12px_rgba(236,109,19,0.3)]"`  
   Sí: `className="bg-accent shadow-elegant"`

4. **Formularios: siempre react-hook-form + FormField**  
   No: `const [value, setValue] = useState("")`  
   Sí: `useForm<z.infer<typeof schema>>()` + `<FormField>`

5. **Wizard nuevo: partir del shell**  
   Copiar `ConfigWizardShell.tsx` como base, no construir desde un `div` vacío.

---

## 6. Caso específico: formularios de wizard (la inconsistencia más frecuente)

El patrón correcto para un campo en un wizard:

```tsx
<FormField
  control={form.control}
  name="nombreCampo"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">
        NOMBRE DEL CAMPO
      </FormLabel>
      <FormControl>
        <Input placeholder="Escribe aquí..." {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**No hacer:**
```tsx
// ❌ Todo esto es incorrecto
<div>
  <label className="text-sm font-medium text-gray-700">Nombre</label>
  <input
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
    value={value}
    onChange={e => setValue(e.target.value)}
  />
  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
</div>
```

---

## 7. Actualizar este skill

Si agregas un componente nuevo al sistema, actualiza este SKILL.md:
- Añadirlo al catálogo (sección 1 o 2)
- Si tiene variantes, documentarlas
- Si resuelve un patrón repetido, añadir la "señal de alerta" correspondiente

Si hay cambios al DESIGN.md, reflejar la divergencia actualizada en la sección 0.
