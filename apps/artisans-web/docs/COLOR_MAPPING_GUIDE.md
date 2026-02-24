# Guía de Mapeo de Colores - Sistema de Diseño TELAR

## Tokens Semánticos Disponibles

### Colores Principales
- `text-primary` / `bg-primary` - Color principal (terracota/naranja)
- `text-primary-foreground` / `bg-primary-foreground` - Texto sobre primary
- `text-secondary` / `bg-secondary` - Color secundario (azul oscuro)
- `text-accent` / `bg-accent` - Color de acento (dorado)

### Estados
- `text-success` / `bg-success` - Verde para éxito, completado
- `text-warning` / `bg-warning` - Amarillo/ámbar para advertencias, pendiente
- `text-destructive` / `bg-destructive` - Rojo para errores, eliminar
- `text-muted` / `bg-muted` - Gris para elementos secundarios
- `text-muted-foreground` - Texto secundario/deshabilitado

### Fondos y Bordes
- `bg-background` / `text-foreground` - Fondo principal y texto
- `bg-card` / `text-card-foreground` - Tarjetas
- `bg-popover` / `text-popover-foreground` - Popovers
- `border` / `border-border` - Bordes

## Mapeo de Colores Hardcodeados → Tokens

### Verde (Success)
```
green-50  → bg-success/10
green-100 → bg-success/20
green-200 → border-success/30
green-300 → text-success/70
green-400 → text-success/80
green-500 → bg-success o text-success
green-600 → text-success
green-700 → text-success
green-800 → text-success-foreground
green-900 → text-success-foreground
```

### Azul (Primary)
```
blue-50   → bg-primary/10
blue-100  → bg-primary/20
blue-200  → border-primary/30
blue-300  → text-primary/70
blue-400  → text-primary/80
blue-500  → bg-primary o text-primary
blue-600  → text-primary
blue-700  → text-primary
blue-800  → text-primary-foreground
blue-900  → text-primary-foreground
```

### Rojo (Destructive)
```
red-50    → bg-destructive/10
red-100   → bg-destructive/20
red-200   → border-destructive/30
red-300   → text-destructive/70
red-400   → text-destructive/80
red-500   → bg-destructive o text-destructive
red-600   → text-destructive
red-700   → text-destructive
red-800   → text-destructive-foreground
red-900   → text-destructive-foreground
```

### Amarillo/Ámbar (Warning)
```
yellow-50  → bg-warning/10
yellow-100 → bg-warning/20
yellow-200 → border-warning/30
yellow-300 → text-warning/70
yellow-400 → text-warning/80
yellow-500 → bg-warning o text-warning
yellow-600 → text-warning-foreground
amber-500  → bg-warning o text-warning
```

### Púrpura/Violeta (Accent)
```
purple-50  → bg-accent/10
purple-100 → bg-accent/20
purple-200 → border-accent/30
purple-300 → text-accent/70
purple-400 → text-accent/80
purple-500 → bg-accent o text-accent
purple-600 → text-accent
violet-300 → border-accent/50
indigo-500 → bg-accent o text-accent
```

### Gris (Muted)
```
gray-50    → bg-muted
gray-100   → bg-muted
gray-200   → border-border
gray-300   → border-border
gray-400   → text-muted-foreground
gray-500   → text-muted-foreground
gray-600   → text-muted-foreground
gray-700   → text-foreground
gray-800   → text-foreground
gray-900   → text-foreground
```

### Naranja (Primary o Warning según contexto)
```
orange-50  → bg-warning/10 o bg-primary/10
orange-100 → bg-warning/20 o bg-primary/20
orange-500 → text-warning o text-primary
orange-600 → text-warning o text-primary
```

## Casos Especiales

### Gradientes
Usar gradientes definidos en index.css:
- `bg-gradient-primary` - Terracota a naranja
- `bg-gradient-accent` - Dorado
- `bg-gradient-subtle` - Sutil
- `bg-gradient-card` - Para tarjetas

### Badges de Estado
- Completado: `bg-success/20 text-success border-success/30`
- En Progreso: `bg-primary/20 text-primary border-primary/30`
- Pendiente: `bg-warning/20 text-warning-foreground border-warning/30`
- Error: `bg-destructive/20 text-destructive border-destructive/30`
- Inactivo: `bg-muted text-muted-foreground border-border`

### Iconos
- Éxito: `text-success`
- Información: `text-primary`
- Advertencia: `text-warning`
- Error: `text-destructive`
- Neutral: `text-muted-foreground`

### Hover States
- Primary: `hover:bg-primary/90`
- Success: `hover:bg-success/90`
- Destructive: `hover:bg-destructive/90`
- Muted: `hover:bg-muted`

## Principios
1. NUNCA usar colores hardcodeados (green-500, blue-600, etc.)
2. SIEMPRE usar tokens semánticos
3. Usar opacidad con `/` para variaciones (bg-primary/20)
4. Mantener consistencia: mismo estado = mismo token
5. Considerar modo oscuro (los tokens se adaptan automáticamente)
