# Design System Editor - Documentación

## 📋 Descripción General

El Design System Editor es un sistema completo de gestión dinámica de colores para TELAR que permite editar todos los colores de la plataforma desde una interfaz visual en tiempo real. Los cambios se aplican inmediatamente en toda la aplicación y se persisten en la base de datos.

## 🎯 Características Principales

### 1. **Gestión Dinámica de Colores**
- Edición visual de 4 paletas principales (Navy, Golden, Coral, Cream)
- Cada paleta incluye escalas completas (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
- Sliders HSL para ajuste preciso de Hue, Saturation, Lightness
- Conversión automática HSL ↔ Hex
- Preview en vivo del color mientras se edita

### 2. **Semantic Tokens**
- Gestión centralizada de todos los tokens semánticos (primary, secondary, accent, success, warning, etc.)
- Validación automática WCAG 2.1 AA de contraste entre color y fondo
- Indicadores visuales de cumplimiento de estándares de accesibilidad

### 3. **Live Preview Panel**
- Vista previa en tiempo real de todos los componentes UI
- Incluye: Botones, Inputs, Badges, Alerts, Cards, Tipografía
- Los cambios se aplican instantáneamente sin necesidad de guardar

### 4. **Persistencia y Sincronización**
- Configuración almacenada en base de datos (tabla `design_system_config`)
- Caché en localStorage para carga rápida
- Sincronización en tiempo real vía Supabase Realtime entre múltiples tabs/ventanas
- Actualización automática cuando otro admin edita colores

### 5. **Historial y Rollback**
- Tabla `design_system_history` para tracking de cambios
- Función "Restaurar" para volver a configuración por defecto
- Sistema preparado para futuro rollback a versiones anteriores

## 🗂️ Arquitectura del Sistema

```
src/
├── types/
│   └── designSystem.ts          # Tipos TypeScript del sistema
├── utils/
│   └── colorUtils.ts             # Funciones de conversión y validación HSL/Hex
├── hooks/
│   └── useDesignSystem.ts        # Hook principal de gestión de colores
├── contexts/
│   └── DesignSystemContext.tsx   # Context provider para estado global
└── components/admin/design-system/
    ├── ColorPaletteEditor.tsx    # Editor de paletas completas
    ├── ColorSwatch.tsx           # Componente individual de color editable
    ├── SemanticTokenEditor.tsx   # Editor de tokens semánticos
    └── LivePreviewPanel.tsx      # Panel de preview en vivo

pages/admin/
└── DesignSystemEditorPage.tsx    # Página principal del editor
```

### Base de Datos

**Tabla `design_system_config`:**
```sql
- id: UUID (PK)
- user_id: UUID (null = configuración global)
- theme_name: TEXT (default: 'default')
- is_active: BOOLEAN
- color_variables: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Estructura del JSONB `color_variables`:**
```json
{
  "semantic": {
    "primary": "220 50% 15%",
    "primary-foreground": "0 0% 100%",
    ...
  },
  "palettes": {
    "navy": {
      "50": "220 50% 98%",
      ...
      "900": "220 50% 5%"
    },
    ...
  },
  "gradients": { ... },
  "shadows": { ... }
}
```

## 🚀 Uso del Sistema

### Acceso al Editor

**Ruta:** `/admin/design-system`

**Requisitos:** Usuario admin autenticado (protegido por `AdminProtectedRoute`)

### Flujo de Trabajo

1. **Editar Colores:**
   - Seleccionar tab "Paletas de Color"
   - Click en cualquier color para abrir popover de edición
   - Ajustar sliders H, S, L para modificar el color
   - Los cambios se aplican inmediatamente en el Live Preview

2. **Validar Tokens Semánticos:**
   - Seleccionar tab "Tokens Semánticos"
   - Revisar validaciones WCAG 2.1 AA de contraste
   - Identificar tokens que no cumplen estándares (badge rojo)

3. **Guardar Cambios:**
   - Click en botón "Guardar Cambios" (header superior derecha)
   - Los cambios se persisten en base de datos
   - Sincronización automática en todas las tabs abiertas

4. **Restaurar Defaults:**
   - Click en botón "Restaurar" si deseas volver a configuración original
   - Requiere confirmación del usuario

## 🎨 Paletas de Color Implementadas

### Navy Blue (Primary)
Azul marino profundo para elementos principales y branding

### Golden Yellow (Secondary)
Amarillo dorado vibrante para highlights y CTAs

### Coral/Peach (Accent)
Coral cálido para acentos y elementos de énfasis

### Cream (Background)
Crema suave para fondos y superficies

## 🔧 Utilidades de Color

### Conversión de Colores
```typescript
import { parseHSL, formatHSL, hslToHex, hexToHSL } from '@/utils/colorUtils';

// Parse HSL string to object
const color = parseHSL("220 50% 15%"); // { h: 220, s: 50, l: 15 }

// Format object to HSL string
const hslString = formatHSL({ h: 220, s: 50, l: 15 }); // "220 50% 15%"

// Convert HSL to Hex
const hex = hslToHex(220, 50, 15); // "#142239"
```

### Validación WCAG
```typescript
import { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from '@/utils/colorUtils';

// Check contrast ratio
const ratio = getContrastRatio("220 50% 15%", "0 0% 100%"); // 12.5

// Validate WCAG standards
const passesAA = meetsWCAG_AA("220 50% 15%", "0 0% 100%"); // true (>= 4.5:1)
const passesAAA = meetsWCAG_AAA("220 50% 15%", "0 0% 100%"); // true (>= 7:1)
```

## 🔐 Seguridad y Permisos

### RLS Policies

**Lectura:**
- Cualquier usuario puede leer la configuración global activa
- Solo admins pueden leer todas las configuraciones

**Escritura:**
- Solo admins pueden crear/actualizar/eliminar configuraciones
- Validado a nivel de base de datos con función `is_admin()`

### AdminProtectedRoute
El acceso al editor está protegido por componente de React que verifica:
1. Usuario autenticado
2. Email del usuario existe en tabla `admin_users`
3. Usuario está activo (`is_active = true`)

## 🌐 Sincronización en Tiempo Real

El sistema utiliza Supabase Realtime para sincronización automática:

```typescript
// Suscripción automática en useDesignSystem hook
const channel = supabase
  .channel('design_system_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'design_system_config',
    filter: 'user_id=is.null'
  }, (payload) => {
    // Actualización automática en todas las tabs
  })
  .subscribe();
```

## 📝 Notas Técnicas

### Aplicación de CSS Variables
Los colores se aplican como CSS custom properties en `document.documentElement`:

```typescript
// Semantic tokens
root.style.setProperty('--primary', '220 50% 15%');

// Palette colors
root.style.setProperty('--navy-700', '220 50% 15%');

// Gradients
root.style.setProperty('--gradient-primary', 'linear-gradient(...)');
```

### Formato de Colores
**Todos los colores en el sistema usan formato HSL sin `hsl()` wrapper:**
- ✅ Correcto: `"220 50% 15%"`
- ❌ Incorrecto: `"hsl(220, 50%, 15%)"`

Este formato permite usar los colores directamente en Tailwind con `hsl(var(--primary))`.

## 🔮 Futuras Mejoras

1. **Historial Visual:** Timeline de cambios con preview de cada versión
2. **Temas Predefinidos:** Galería de temas pre-configurados (Light, Dark, High Contrast)
3. **Export/Import:** Exportar configuración como JSON, importar desde archivo
4. **Color Picker Visual:** Integración con color picker avanzado (react-colorful)
5. **Gradient Editor:** Editor visual de gradientes con múltiples stops
6. **AI Suggestions:** Sugerencias de paletas basadas en teoría del color
7. **A/B Testing:** Comparación side-by-side de diferentes configuraciones

## 🐛 Troubleshooting

### Los colores no se aplican
1. Verificar que DesignSystemProvider envuelve toda la aplicación en App.tsx
2. Revisar console para errores de carga
3. Confirmar que tabla `design_system_config` tiene registro activo

### Cambios no se persisten
1. Verificar permisos de admin del usuario
2. Revisar RLS policies en Supabase
3. Confirmar que función `is_admin()` retorna true

### Sincronización no funciona
1. Verificar conexión a Supabase
2. Confirmar que Realtime está habilitado en proyecto Supabase
3. Revisar que no hay errores en suscripción del channel

## 📚 Referencias

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [HSL Color Model](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Versión:** 1.0.0  
**Última actualización:** 2025-01-19  
**Autor:** TELAR Development Team
