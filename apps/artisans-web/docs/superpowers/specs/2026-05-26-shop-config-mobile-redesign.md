# Spec: ShopConfigDashboard — Rediseño mobile

**Fecha:** 2026-05-26  
**Archivo principal:** `src/pages/ShopConfigDashboard.tsx`

---

## Contexto

La página `/mi-tienda/configurar` tiene un bento grid de 5 columnas con 6 módulos complejos que funciona bien en desktop pero es inutilizable en mobile: sub-grids internos se comprimen, los CTAs (`EditBtn`) son pequeños y difíciles de tocar, y no hay forma de navegar directamente a una sección específica.

---

## Decisiones de diseño (aprobadas)

| Pregunta | Decisión |
|---|---|
| Navegación interna | **B — Nav de iconos**: 6 iconos fijos con label corto |
| Vista de contenido | **C — Vista de sección completa**: el área bajo el nav muestra la sección seleccionada |
| Secciones complejas | **B — Filas por sub-item**: cada sub-item con CTA directo a su destino |

---

## Alcance

**Solo mobile** (`md:hidden` / `hidden md:block`).  
El bento grid desktop no se toca.

---

## Layout mobile resultante

```
┌─────────────────────────────────────┐
│ [←]       [ISO TELAR]         [🔔]  │  ← header (ya implementado)
├─────────────────────────────────────┤
│ [Logo]  Nombre tienda    ███░░  55% │  ← hero card (ya implementado)
├─────────────────────────────────────┤
│  👤      🎨      🖼      📞  📋  ✨  │  ← icon nav (NUEVO)
│ Perfil  Marca  Hero  Contacto …     │
├─────────────────────────────────────┤
│                                     │
│  [Contenido de sección activa]      │  ← sec view (NUEVO)
│                                     │
└─────────────────────────────────────┘
```

---

## Componente: `MobileShopNav`

Estado local `activeSection: string` (default: primera sección pendiente, o `'perfil'`).

### Las 6 secciones

| id | Label | Icono (Material Symbols) | Destino(s) |
|---|---|---|---|
| `perfil` | Perfil | `account_circle` | `/dashboard/artisan-profile-wizard` |
| `marca` | Marca | `palette` | `/mi-tienda/configurar/brand` |
| `hero` | Hero | `panorama` | `/mi-tienda/configurar/hero` |
| `contacto` | Contacto | `contacts` | sub-items (ver abajo) |
| `legal` | Legal | `policy` | sub-items (ver abajo) |
| `diseno` | Diseño | `style` | `/mi-tienda/configurar/design` |

### Nav bar

- `flex justify-around`, fondo blanco, `border-bottom`
- Cada icono: `w-28 h-28 rounded-8` — naranja bg si activo, gris si no
- Label: `7px / 800 / uppercase`, naranja si activo, gris si no
- Tap → cambia `activeSection`

---

## Vistas de sección

### Secciones simples (Perfil, Marca, Hero, Diseño)

```
┌─────── band de color (gradient) ──────────────────┐
│  Nombre sección                    [pill estado]   │
└───────────────────────────────────────────────────┘
  [preview: logo/imagen/avatar/colores]
  Texto con datos clave (2-3 líneas)
  [CTA full-width]
```

**CTAs por sección:**

| Sección | Estado completo | Estado incompleto |
|---|---|---|
| Perfil | `outline` "Editar perfil →" | `orange` "Completar perfil →" |
| Marca | `outline` "Editar marca →" | `orange` "Configurar marca →" |
| Hero | `outline` "Editar imágenes →" | `orange` "Agregar imágenes →" |
| Diseño | `outline` "Ver diseño →" | `outline` "Personalizar diseño →" |

### Sección Contacto (compleja)

Título: "Contacto y cobros" + pill de estado (`N pendientes` o `✓ Completo`).

Sub-items como filas tappables:

| Sub-item | Icono | Valor si completo | CTA si pendiente | CTA si completo |
|---|---|---|---|---|
| WhatsApp / Email | `chat` | número o email | "Agregar →" (naranja) | "Editar" (gris) |
| RUT / NIT | `receipt_long` | valor del RUT | "Registrar →" (naranja) | "Editar" (gris) |
| Cuenta bancaria | `account_balance` | "Cuenta configurada" | "Configurar →" (naranja) | "Editar" (gris) |
| Dirección | `location_on` | ciudad, país | "Agregar →" (naranja) | "Editar" (gris) |

Destinos:
- WhatsApp / Email / Dirección → `/mi-tienda/configurar/contact`
- RUT → `/mi-tienda/configurar/contact?tab=rut`
- Cuenta → `/mi-tienda/configurar/contact?tab=banco`

### Sección Legal (compleja)

Título: "Políticas y FAQ" + pill de estado.

Sub-items:

| Sub-item | Icono | CTA si pendiente | CTA si completo | Destino |
|---|---|---|---|---|
| Política de devoluciones | `policy` | "Crear política →" | "Editar" | `/mi-tienda/configurar/return-policy` |
| Preguntas frecuentes | `quiz` | "Agregar FAQ →" | "Editar" | `/mi-tienda/configurar/faq` |

---

## Estructura de implementación

```tsx
// En ShopConfigDashboard.tsx

// 1. Nuevo estado
const [activeSection, setActiveSection] = useState<SectionId>(defaultSection);

// 2. Componente nav (inline o extraído)
<div className="md:hidden">
  <MobileShopNav active={activeSection} onChange={setActiveSection} sections={...} />
  <MobileSectionView section={activeSection} data={shopData} onNavigate={navigate} />
</div>

// 3. Desktop grid existente sin cambios
<div className="hidden md:block">
  {/* bento grid actual */}
</div>
```

`defaultSection`: primera sección con `status !== 'complete'`, o `'perfil'` si todo está completo.

---

## Estilo de sub-item row

```tsx
// Fila tappable
<button onClick={() => navigate(dest)} className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-black/4">
  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? 'bg-green-50' : 'bg-orange-50'}`}>
    <span className="material-symbols-outlined" style={{ fontSize: 16, color: done ? '#166534' : '#ec6d13' }}>{icon}</span>
  </div>
  <div className="flex-1 text-left">
    <p className="text-[11px] font-[700] text-[#151b2d]">{name}</p>
    <p className={`text-[9px] ${done ? 'text-[#166534] font-[600]' : 'text-[rgba(84,67,62,0.4)] italic'}`}>{value}</p>
  </div>
  <span className={`text-[10px] font-[800] ${done ? 'text-[rgba(84,67,62,0.35)]' : 'text-[#ec6d13]'}`}>
    {done ? 'Editar' : 'Agregar →'}
  </span>
</button>
```

---

## Band de color por sección

| Sección | Gradient |
|---|---|
| Perfil | `rgba(236,109,19,0.08)` → `rgba(21,27,45,0.03)` |
| Marca | `rgba(236,109,19,0.08)` → `rgba(21,27,45,0.03)` |
| Hero | `rgba(21,27,45,0.06)` → `rgba(59,130,246,0.04)` |
| Contacto | `rgba(37,211,102,0.08)` → `rgba(59,130,246,0.05)` |
| Legal | `rgba(59,130,246,0.08)` → `rgba(21,27,45,0.03)` |
| Diseño | `rgba(59,130,246,0.1)` → `rgba(21,27,45,0.03)` |

---

## Qué NO cambia

- Header mobile (←, ISO Telar, 🔔) — ya implementado
- Hero card mobile (logo tienda + nombre + barra progreso) — ya implementado
- 4 metric cards mobile (grid-cols-4) — ya implementado
- Todo el layout desktop — sin tocar
- `OraculoShopConfig` context registration — sin tocar
