# TELAR — Sistema de Diseño · Artisans Web

> Este documento es la fuente de verdad de diseño para toda la app de artesanos de TELAR.
> Cualquier pantalla nueva debe partir de aquí, no de librerías genéricas.

---

## 1. Filosofía

TELAR no es un SaaS de ecommerce. Es un sistema de **trazabilidad cultural y editorial** para artesanos colombianos. Cada decisión de diseño debe comunicar:

- **Legitimidad**: la plataforma cuida la identidad del artesano, no la simplifica.
- **Editorial**: el artesano es autor, no vendedor. Las interfaces deben sentirse como publicación, no como formulario.
- **Calidez con precisión**: la paleta es orgánica (crema, terracota, verde) pero la tipografía y el espaciado son quirúrgicamente limpios.
- **IA como copiloto**: la inteligencia artificial sugiere, el artesano confirma. Nunca se impone.
- **Densidad gestionada**: mucha información cabe sin abrumar porque el sistema visual la jerarquiza bien.

---

## 2. Paleta de Color

### Colores semánticos

| Token | Hex | Uso |
|---|---|---|
| `brand-orange` | `#ec6d13` | CTA principal, acentos activos, estados seleccionados |
| `on-surface` | `#151b2d` | Texto principal, dark panels, botón secundario dark |
| `on-surface-variant` | `#54433e` | Texto secundario, labels, sublabels |
| `brand-cream` | `#fdfaf6` | Fondo de tarjetas internas, hover suave |
| `background-base` | `#f9f7f2` | Fondo raíz de toda la app |
| `accent-green` | `#166534` | Estados "listo", "aprobado", "publicado" |
| `status-red` | `#ef4444` | Errores, campos obligatorios faltantes |

### Glass system (transparencias)

| Token | Valor CSS | Uso |
|---|---|---|
| `glass-fill-primary` | `rgba(255, 255, 255, 0.82)` | Cards principales |
| `glass-fill-secondary` | `rgba(255, 255, 255, 0.68)` | Cards secundarias, sidebars |
| `glass-border` | `rgba(255, 255, 255, 0.65)` | Borde de todas las glass cards |
| `glass-canvas` | `rgba(247, 246, 242, 0.45)` | Wrapper de página completa (dashboard) |

### Overlays oscuros

| Uso | Valor |
|---|---|
| Dark AI panel | `#151b2d` (sólido) |
| Fondo de items en dark panel | `rgba(255, 255, 255, 0.05)` |
| Borde de items en dark panel | `rgba(255, 255, 255, 0.05–0.1)` |

### Gradientes de fondo (background del body)

```css
background-color: #f9f7f2;
background-image:
  radial-gradient(circle at top left, rgba(223, 244, 232, 0.95), transparent 38%),
  radial-gradient(circle at bottom right, rgba(238, 241, 245, 0.95), transparent 42%),
  radial-gradient(circle at top right, rgba(255, 244, 223, 0.75), transparent 34%);
background-attachment: fixed;
```

El gradiente verde-azul-naranja es parte de la identidad. Siempre usar `background-attachment: fixed` para que no scrollee con el contenido.

---

## 3. Tipografía

### Familias

| Familia | Uso principal |
|---|---|
| **Noto Serif** | Headlines, display, citas editoriales, nombres de secciones |
| **Manrope** | Body, labels, UI, formularios, navegación |

### Escala tipográfica

| Nombre | Fuente | Tamaño | Line-height | Letter-spacing | Weight |
|---|---|---|---|---|---|
| `display-lg` | Noto Serif | 48px | 1.1 | -0.05em | 700 |
| `headline-md` | Noto Serif | 30px | 1.2 | — | 700 |
| `headline-sm` | Noto Serif | 24px | 1.3 | — | 700 |
| `body-lg` | Manrope | 18px | 1.5 | — | 700 |
| `body-md` | Manrope | 14px | 1.6 | — | 500 |
| `label-caps` | Manrope | 10px | 1.2 | 0.2em | 800 + uppercase |
| `micro-tag` | Manrope | 8px | 1.0 | 0.1em | 900 + uppercase |

### Reglas de uso

- Los **títulos de paso** (wizard steps) usan `headline-md` en Noto Serif.
- Las **citas o narrativas** usan Noto Serif en itálica, tamaño `display-lg` reducido.
- Los **labels de campos** siempre en `label-caps` o `micro-tag`: uppercase, tracking, Manrope extrabold.
- Los **valores de datos grandes** (precio, stock, métricas) usan Noto Serif o Manrope en tamaño grande con `font-bold`.
- **Nunca mezclar** Noto Serif con Manrope en la misma línea salvo combinaciones intencionadas (headline serif + subline manrope).

---

## 4. Espaciado

| Token | Valor | Uso |
|---|---|---|
| `micro-gap` | 8px | Gap mínimo entre elementos inline |
| `inner-gap` | 16px | Gap entre elementos dentro de una card |
| `card-padding` | 24px | Padding estándar de una card |
| `section-gap` | 32px | Espacio entre secciones |
| `container-padding` | 40px | Padding horizontal de la página |

---

## 5. Border Radius

| Elemento | Radio |
|---|---|
| Inputs, tags pequeños | `0.5rem` (8px) |
| Cards de wizard | `12px` |
| Cards medianas | `1rem` (16px) |
| Cards grandes / panels | `1.5rem` (24px) |
| Dashboard main cards | `2rem` (32px) |
| Wrapper de página | `32px` |
| Pills (footer, badges, chips) | `9999px` (full) |

---

## 6. Sistema de Cards (Glass)

### Card primaria (la más usada)
```css
background: rgba(255, 255, 255, 0.82);
backdrop-filter: blur(8px–20px);
border: 1px solid rgba(255, 255, 255, 0.65);
box-shadow: 0 4px 20px rgba(21, 27, 45, 0.02);
border-radius: 12px–32px (según contexto);
```

### Card secundaria (nested o sidebar)
```css
background: rgba(255, 255, 255, 0.68);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.65);
box-shadow: 0 2px 15px rgba(21, 27, 45, 0.01);
```

### Panel oscuro (AI Observation)
```css
background: #151b2d;
border-radius: 16px–24px;
color: white;
```
Items internos: `background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05–0.1);`

### Canvas wrapper (página completa tipo dashboard)
```css
background: rgba(247, 246, 242, 0.45);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.65);
box-shadow: 0 24px 80px rgba(21, 27, 45, 0.08);
border-radius: 32px;
max-width: 1400px;
```

---

## 7. Botones

### CTA Primario (naranja)
```css
background: #ec6d13;
color: white;
padding: 12px 32px;
border-radius: 9999px (pill) o 12px (rectangular);
font: Manrope, 14px, bold;
box-shadow: 0 4px 12px rgba(236,109,19,0.3);
hover: scale(1.05) o opacity(0.9);
```

### CTA Secundario (dark)
```css
background: #151b2d;
color: white;
hover: background #ec6d13 (transición suave);
```
Usar en footers del wizard y en acciones principales de paneles oscuros.

### Botón outline (borde)
```css
background: transparent;
border: 1px solid rgba(21,27,45,0.1) o border-gray-200;
color: #151b2d;
hover: background white o rgba(255,255,255,0.5);
```

### Botón destructivo / warning
```css
/* No usar rojo en botones. Usar orange + icono priority_high */
```

### Estado deshabilitado
```css
opacity: 0.4;
cursor: not-allowed;
filter: grayscale(1);
pointer-events: none;
```

### Texto-link acción (inline)
```css
color: #ec6d13;
font: Manrope, 10–11px, extrabold, uppercase, tracking-widest;
hover: underline;
```
Ejemplo: "REVISAR", "COMPLETAR", "EDITAR", "CREAR".

---

## 8. Inputs y Formularios

### Input sutil (sobre fondo glass)
```css
background: transparent;
border: none;
border-bottom: 1px solid rgba(21, 27, 45, 0.15);
padding: 8px 0;
font: Manrope, 13–14px, 500;
color: #151b2d;
focus: border-bottom-color: #ec6d13 (transición 0.3s);
```
Usar para campos dentro de cards glass con mucho espacio.

### Input redondeado (standard)
```css
background: rgba(255,255,255,0.5–0.6);
border: 1px solid rgba(21,27,45,0.05–0.08);
border-radius: 12px;
padding: 12px 16px;
font: Manrope, 14px, 500;
focus: border-color #ec6d13, box-shadow 0 0 0 4px rgba(236,109,19,0.05);
```

### Select
Mismo estilo que input. Usar `appearance: none` siempre. En inputs sutiles, usar fondo de flecha SVG inline.

### Textarea
Mismo estilo que input redondeado. Siempre `resize: none`. Altura mínima definida por rows.

### Label de campo
Siempre `label-caps` (10px, uppercase, tracking-widest, Manrope 800, color `on-surface-variant/40–60`).
Posición: encima del campo, `margin-bottom: 4–8px`.

### Placeholder
`color: rgba(on-surface, 0.3)`, font-weight light.

---

## 9. Chips y Badges

### Chip seleccionable (opción múltiple)
```
inactive: white bg, border rgba(21,27,45,0.1), color #54433e
active:   #ec6d13 bg, white text, sin borde
hover:    transición suave a naranja
border-radius: 8px o 9999px según contexto
font: Manrope, 12px, 500–600
```

### Badge de estado

| Estado | Fondo | Texto |
|---|---|---|
| Publicado / Listo | `rgba(22,101,52,0.1)` | `#166534` |
| En borrador | `rgba(21,27,45,0.05)` | `#54433e` |
| Bajo stock / Pendiente | `rgba(236,109,19,0.1)` | `#ec6d13` |
| Error / Requerido | `rgba(239,68,68,0.1)` | `#ef4444` |
| Opcional / Info | `rgba(59,130,246,0.1)` | azul |

Formato: `border-radius: 9999px`, `padding: 2px 10px`, `font: Manrope, 9–10px, 800, uppercase, tracking-widest`.

### Tag de progreso (wizard footer)
```css
width: 6–24px;
height: 4px;
border-radius: 9999px;
current: 24px ancho, color #ec6d13;
done: 6px, color #ec6d13;
pending: 6px, color rgba(21,27,45,0.1);
```

---

## 10. Iconografía

**Familia**: Material Symbols Outlined (Google).

**Variación por defecto**:
```css
font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
```

**Variación filled** (estados completados, checks):
```css
font-variation-settings: 'FILL' 1, 'wght' 300;
```

**Tamaños**:
- Sidebar: `text-xl` (20px)
- Inline en labels: `text-[14–16px]`
- Hero/decorativo: `text-[40–72px]`, font-thin o weight 100

**Colores**:
- En dark panels: `text-[#ec6d13]` para íconos de acción
- En cards glass: `text-on-surface-variant` o `text-brand-orange`
- Decorativos: `/30` opacity para fondos

---

## 11. Layouts

### Layout de página completa (dashboard, módulos principales)

```
┌─────────────────────────────────────────────────────┐
│  Canvas wrapper (max-w-1400px, rounded-3xl, glass)  │
│ ┌──────┬────────────────────────────────────────┐   │
│ │Sidebar│  Content Area                          │   │
│ │ 80px │  ┌─ Header sticky ─────────────────┐   │   │
│ │      │  │ Título + acciones               │   │   │
│ │ nav  │  └─────────────────────────────────┘   │   │
│ │ icon │  ┌─ Main ─────────────────────────┐    │   │
│ │ only │  │  grid cols-12                  │    │   │
│ │      │  │  col-8 main | col-4 aside      │    │   │
│ │      │  └────────────────────────────────┘    │   │
│ └──────┴────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Layout de wizard (producto, onboarding)

```
┌──────────────────────────────────────────────┐
│  min-h-screen, background fijo              │
│  max-w-6xl | max-w-1200px, mx-auto, px-10  │
│                                              │
│  Header: step indicator + título            │
│                                             │
│  ┌─ col-3 ──┐  ┌─── col-9 ──────────────┐  │
│  │ AI Panel │  │ Form sections          │  │
│  │ (dark)   │  │ (glass cards apiladas) │  │
│  │ sticky   │  │                        │  │
│  └──────────┘  └────────────────────────┘  │
│                                             │
│  [Floating footer pill] fixed bottom-8     │
└─────────────────────────────────────────────┘
```

### Grid interno de cards

Usar `grid grid-cols-12 gap-6` o `gap-8` en wizard.
Usar `grid grid-cols-1 md:grid-cols-2 gap-4` para review cards.
Usar `grid grid-cols-1 md:grid-cols-4 gap-4` para métricas de dashboard.

---

## 12. Sidebar de Navegación

```
Ancho: 80px (w-20)
Posición: sticky left, altura full
Fondo: transparente (hereda el canvas wrapper)
Borde derecho: 1px solid rgba(255,255,255,0.4)

Item inactivo:
  w-10 h-10, rounded-full
  text-on-surface-variant
  hover: bg-white/60

Item activo:
  background: #151b2d
  color: white
  border-radius: 9999px

Logo TELAR:
  font-serif, font-black, 10px
  uppercase, tracking-widest

Avatar usuario:
  w-10 h-10, rounded-full
  bg-white, border-gray-100
  text-on-surface-variant, font-bold, text-xs
```

---

## 13. Floating Footer Wizard

El footer del wizard es una pill flotante fija en `bottom-6–8`. Tiene 3 variantes:

### Variante A — Step 1 (minimal)
```
height: 48px
contenido: [Guardar borrador] | [1/6] | [mensaje estado] | [Botón continuar]
continuar deshabilitado: opacity-40, grayscale, pointer-events-none
```

### Variante B — Steps 2–5 (estándar)
```
width: 90%, max-w-700px
contenido: [← Volver] | [progress dots + PASO X DE 6] | [Continuar →]
botón volver: text ghost
botón continuar: dark bg, hover orange
```

### Variante C — Step 6 final
```
width: calc(100% - 80px), max-w-1000px
contenido: [← Volver] | [PASO 6 DE 6] | [Guardar borrador] [Enviar a curaduría]
enviar: orange bg
```

Todos los footers: `backdrop-filter: blur`, `background rgba(255,255,255,0.85–0.95)`, `border rgba(255,255,255,0.6)`, `shadow-xl`, `border-radius: 9999px`.

---

## 14. Panel de Observación IA (Dark Panel)

Patrón recurrente en wizard steps 1–4. Sidebar derecha en Step 1, sidebar izquierda en Steps 2–4.

```
background: #151b2d
border-radius: 16–24px
padding: 20–28px

Header:
  icon psychology/auto_awesome (orange) + título "Observación IA"
  divider: border-b border-white/10
  status pill: "Esperando señales..." + pulsing dot

Cada card de sugerencia:
  background: rgba(255,255,255,0.05)
  border: 1px solid rgba(255,255,255,0.05–0.1)
  border-radius: 12px
  label: 9px, uppercase, tracking, white/30–40
  valor: 13px, Noto Serif, white/80
  acciones: [Confirmar] [Cambiar] — 9px, uppercase, extrabold

Footer del panel:
  border-t border-white/5
  indicador de sincronización: pulsing dot naranja + "Sincronización activa"
```

**Regla**: La IA siempre muestra sugerencias con nivel de confianza ("Media", "Alta") y siempre ofrece Confirmar/Cambiar. Nunca sobrescribe sin permiso.

---

## 15. Estados de UI

### Estado vacío (empty state)
```
ícono grande: text-gray-200, text-3xl, en contenedor rounded-2xl bg-gray-50/50
título: text-xl, font-bold
descripción: text-on-surface-variant/60, text-sm, max-w-xs
CTA: botón orange
```

### Estado de carga
```
Loader2 (lucide) o spinner custom, animate-spin
color: text-[#ec6d13]
mensaje: text-on-surface-variant/60, text-sm
Centrado vertical y horizontal en el área de contenido
```

### Estado de error
```
Usar toast (Sonner) para errores de API
Usar badge rojo inline para validaciones de campo
No usar modales de error
```

### Estado de éxito
```
Usar toast (Sonner) para confirmaciones
Badge verde inline para estados completados
Checkmark filled: material-symbols-outlined con FILL 1, color accent-green
```

### Campo obligatorio faltante
```
label: color #ef4444
indicador: texto "Obligatoria" en rojo, posición absoluta dentro del input zone
Botón continuar: deshabilitado + disabledReason en italic naranja/gris
```

---

## 16. Header de Páginas

### Header de wizard (centrado)
```
step indicator: pills de progreso + "PASO X DE 6" en label-caps naranja
título: Noto Serif, 30–48px, font-bold, centrado
subtítulo: Manrope, 14px, italic, on-surface-variant/60, centrado
max-w: 2xl centrado
margin-bottom: 40px
```

### Header sticky de dashboard
```
position: sticky top-0
background: rgba(247,246,242,0.68) backdrop-blur-[20px]
z-index: 30
contenido: saludo (Noto Serif 3xl) + subtítulo | acciones (preview + publicar)
padding: px-12 pt-10 pb-6
```

---

## 17. Cards de Métricas (Dashboard)

```
glass-card-primary
padding: 20px
height: 128px (h-32)
border-radius: 24px
flex flex-col justify-between

Layout interno:
  top: label (label-caps, on-surface-variant/50) + ícono gris/30
       sublabel (9px, on-surface-variant/40, uppercase)
  bottom: valor grande (text-4xl, font-bold, Manrope)
```

Para estado especial (tienda publicada/en preparación), el valor inferior puede ser texto con color semántico (green-600, brand-orange).

---

## 18. Tabla de Productos (Dashboard)

```
thead:
  border-b border-gray-100/50
  texto: 10px, font-black, on-surface-variant/30, uppercase, tracking-widest

tbody:
  border-b border-gray-50
  hover: bg-black/5
  font: 14px, font-bold, Manrope

Columnas: [Imagen 40px] [Nombre] [Estado badge] [Precio derecha] [Stock derecha] [Acción naranja derecha]

Imagen: w-10 h-10, bg-gray-100, rounded-lg

Acción inline: "Editar" / "Completar" / "Reponer" en text-brand-orange, 12px, hover:underline, cursor-pointer
```

---

## 19. Cards de Revisión (Step 6 / Review)

```
glass-card
padding: card-padding (24px)
border-radius: lg (12px)
flex flex-col justify-between

Header de card:
  h3 Noto Serif 24px | StatusBadge (pill verde/naranja)

Body: grid 2 cols de datos
  label: label-caps, on-surface-variant, mb-1
  valor: body-md, 14px, 500

Footer: text-right, EditButton naranja
```

---

## 20. Sección "Tu siguiente paso / oportunidad" (Dashboard Hero CTA)

Bloque prominente en el main del dashboard. Contexto-sensitivo según estado de tienda.

```
padding: p-10
border-radius: rounded-3xl
backdrop-blur-sm
border: suave (primary/10 o blue-200/20)
fondo: rgba(tint, 0.6) según contexto (naranja para en prep, azul para publicada con alertas)

Layout: flex flex-col md:flex-row gap-10 items-center

Lado izquierdo:
  h3 Noto Serif 24px "Tu siguiente paso/oportunidad"
  subtitle bold colored (primary o azul)
  descripción 14px on-surface-variant
  CTA orange button

Lado derecho:
  Ilustración composición 56x56 cuadrado redondeado con capas absolutas:
  - capa base: bg-primary/10 rounded-3xl rotado
  - capa media: glass card rotada con ícono primary/30
  - badge flotante: rounded-full blanco con ícono de acción
  - detalle adicional: circle pequeño
  + blur decorativo absoluto -top-12 -right-12
```

---

## 21. Cards de Alertas / Faltantes (Dashboard Sidebar)

```
glass-card-primary
padding: p-8
border-radius: rounded-3xl

Imagen hero interna (h-32 al tope de la card):
  gradiente naranja/blanco
  ilustración compuesta con capas absolutas y blur decorativo

Lista de items:
  Cada item: flex justify-between items-center
  [label bold 14px + badge de conteo] | [botón acción 10px naranja uppercase]
  sublabel: 10px, on-surface-variant/50, mt-0.5

Separadores: border-b border-on-surface/[0.03]

Item "COMPLETA": badge verde, mensaje positivo
```

---

## 22. Card de Perfil y Crecimiento

### Profile card
```
glass-card-secondary
Avatar: w-14 h-14, rounded-2xl, bg-primary/5, borde primary/10, letra grande serif
Nombre: Noto Serif 20px bold
Badge tipo: label-caps, color primary

Datos clave: grid 2-col, label + valor
Estado tienda: badge semántico inline

CTA: botón outline full-width, 10px uppercase, rounded-xl
```

### Growth/Misiones card
```
fondo: bg-[#fcfdf2]/60 — cremoso
border: brand-orange/5
blur decorativo: círculo verde -bottom-6 -left-6

Header: [título + nivel] | [puntuación X/5]
Sub: [diagnóstico] | [conteo misiones badge]
CTA: botón blanco full-width
```

---

## 23. Interacciones y Transiciones

| Elemento | Comportamiento |
|---|---|
| Botón CTA primary | `hover:scale(1.05)` o `hover:opacity(0.9)` |
| Botón dark → orange | `transition: background 0.2s` |
| Chips/cards seleccionables | `transition: all 0.2s` |
| Ícono hover en card expandible | `group-hover:text-brand-orange transition-colors` |
| Imágenes de evidencia | `grayscale hover:grayscale-0 duration-500` |
| Footer pill continuar | `hover:translate-x-1` en flecha |
| Footer pill volver | `hover:-translate-x-1` en flecha |
| Sidebar items | `transition-all` en hover |
| Progress bar | `transition-all duration-1000` |
| Pulsing dot (IA) | `animate-pulse` |

**Regla**: Todas las transiciones deben ser <= 300ms excepto progress bars (1000ms). No usar animaciones de entrada complejas en flows de formulario.

---

## 24. Responsive

La app está optimizada para **desktop primero** (artesanos trabajan desde computador). Sin embargo:

- Wizard: columnas colapsan a 1 en mobile (AI panel encima del form).
- Dashboard: sidebar colapsa (oculta en mobile, hamburger si se implementa).
- Floating footer: `w-[90%]` con max-w en desktop, full-width en mobile.
- Metric cards: `grid-cols-1 md:grid-cols-4`.
- Review cards: `grid-cols-1 md:grid-cols-2`.

Breakpoint principal: `lg` (1024px) para el split de columnas.

---

## 25. Scrollbar personalizado

```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(21, 27, 45, 0.1);
  border-radius: 10px;
}
```

Aplicar en áreas de scroll interno (content area del dashboard, step content en wizard).

---

## 26. Reglas que no se rompen

1. **No usar librerías de componentes genéricos** (ShadCN, MUI, Chakra) para elementos visibles al usuario. Solo para utilidades internas (toasts, comandos de teclado).
2. **No usar borders oscuros** en cards glass. Solo borders blancos o muy sutiles.
3. **No usar box-shadows fuertes**. Las sombras son siempre suaves: `rgba(21,27,45,0.02–0.08)`.
4. **No usar fondos sólidos blancos** en el nivel raíz. Todo es semitransparente sobre el gradiente.
5. **Toda acción destructiva** requiere confirmación visual antes de ejecutarse.
6. **El color rojo** solo para validaciones de campo y badges de "Requerido". Nunca en botones.
7. **Los textos en dark panels** siempre son `white/80` para secundario y `white` para principal. Nunca blanco puro en el body del panel.
8. **Los labels de formulario** son siempre UPPERCASE + tracking-widest + Manrope 800. Sin excepción.
9. **La IA nunca bloquea**. Sus sugerencias tienen siempre una vía de escape ("Cambiar").
10. **El pasaporte digital** no se renderiza como dato editable. Es una vista de solo lectura editorial.

---

## 27. Archivos de referencia

| Archivo | Descripción |
|---|---|
| `design-reference/dashboard-tienda-publicada.html` | Dashboard con tienda activa y alertas |
| `design-reference/dashboard-tienda-en-preparacion.html` | Dashboard en estado de configuración |
| `src/components/shop/new-product-wizard/` | Wizard de creación de producto (6 pasos) — fuente viva del sistema |

---

*Última actualización: Mayo 2026 — basado en diseños aprobados del wizard de producto y dashboard TELAR.*
