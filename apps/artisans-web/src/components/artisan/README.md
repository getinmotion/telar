# TELAR Design System

Sistema de diseño moderno y profesional para la plataforma TELAR.

## Paleta de Colores

### Colores Principales
- **Primary (Navy Blue)**: `hsl(220 50% 15%)` / `#142239` - Color principal profesional y confiable
- **Secondary (Golden Yellow)**: `hsl(45 100% 54%)` / `#ffc716` - Color secundario energético para acciones
- **Accent (Coral)**: `hsl(20 89% 66%)` / `#f48c5f` - Color de acento cálido y humano

### Colores de Soporte
- **Cream Background**: `hsl(40 50% 98%)` / `#fcf7ec` - Fondo suave y elegante
- **Navy Text**: `#142239` - Texto principal
- **Dark Gray**: `#282828` - Texto secundario

## Componentes

### ArtisanCard
Tarjeta con estética artesanal:
```tsx
<ArtisanCard variant="elevated" hoverable>
  Contenido
</ArtisanCard>
```

**Variantes:**
- `default`: Estilo de tarjeta básico
- `elevated`: Con sombras elevadas
- `glass`: Efecto glassmorphism
- `clay`: Tonos de arcilla

### ArtisanBadge
Insignias con estilo artesanal:
```tsx
<ArtisanBadge variant="primary" size="md">
  Nuevo
</ArtisanBadge>
```

**Variantes:**
- `primary`: Color principal
- `secondary`: Color secundario
- `earth`: Tonos tierra
- `golden`: Dorado
- `clay`: Arcilla

### ArtisanPattern
Patrones decorativos artesanales:
```tsx
<ArtisanPattern variant="weave" opacity={0.1} />
```

**Variantes:**
- `weave`: Patrón de tejido
- `clay`: Patrón de cerámica
- `textile`: Patrón textil
- `geometric`: Patrón geométrico

## Botones

### Variantes Profesionales
```tsx
<Button variant="default">Acción Principal</Button>
<Button variant="secondary">Acción Secundaria</Button>
<Button variant="outline">Explorar</Button>
<Button variant="ghost">Cancelar</Button>
```

## Gradientes

Usa los gradientes predefinidos en el design system:
- `bg-gradient-primary`: Navy azul degradado
- `bg-gradient-secondary`: Golden amarillo degradado
- `bg-gradient-accent`: Coral a Golden
- `bg-gradient-hero`: Navy con Golden overlay
- `bg-gradient-brand`: Combinación completa Navy/Golden/Coral
- `bg-gradient-warm`: Coral a Cream

## Sombras

Sombras profesionales para profundidad:
- `shadow-card`: Sombra suave para tarjetas (Navy tint)
- `shadow-elegant`: Sombra elegante (Navy)
- `shadow-hover`: Sombra para hover (Navy)
- `shadow-glass`: Sombra para glassmorphism
- `shadow-glow`: Resplandor Golden

## Uso de Semantic Tokens

**CRÍTICO**: Siempre usa semantic tokens en lugar de colores directos:

❌ **Incorrecto:**
```tsx
className="text-white bg-blue-900"
```

✅ **Correcto:**
```tsx
className="text-primary-foreground bg-primary"
// o usando colores específicos
className="text-white bg-navy-700"
```

## Tipografía

- **Font Heading**: League Spartan (títulos, siempre uppercase)
- **Font Body**: Open Sans (texto de lectura)
- **Font Display**: League Spartan (títulos destacados)

## Animaciones

Todas las animaciones usan:
- `transition-all duration-300`: Transiciones suaves
- `hover:scale-105`: Escala en hover
- `hover:shadow-hover`: Sombra en hover
