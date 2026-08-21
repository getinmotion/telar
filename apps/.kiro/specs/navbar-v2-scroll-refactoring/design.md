# Design Document — NavbarV2 Scroll Refactoring

## Overview

Refactoring del componente `NavbarV2.tsx` para eliminar toda lógica y estilos condicionales basados en scroll, resultando en una barra de navegación estática con tamaños fijos. Es un cambio de un solo archivo sin nuevos componentes, dependencias ni cambios de API.

## Architecture

No hay cambios arquitectónicos. El componente sigue siendo un componente funcional React con estado local para:
- `megaMenuOpen` — control del mega menú por hover
- `mobileMenuOpen` — control del drawer móvil
- `mobileSearchVisible` — toggle de búsqueda móvil
- `localSearchQuery` — valor del campo de búsqueda
- `guestModalOpen` — modal de guest auth

Se **eliminan** completamente:
- `isScrolled` state + `useEffect` con scroll listener
- `searchVisible` state + `toggleSearch` function

## Components

### NavbarV2 (modificado)

**Archivo:** `marketplace-web/src/components/NavbarV2.tsx`

El componente mantiene su estructura de tres secciones:
1. Mobile top bar (`< lg`)
2. Desktop top bar (`>= lg`) — grid de 3 columnas
3. Desktop nav links (`>= lg`)

#### Cambios en el Desktop Top Bar

```tsx
// ANTES: grid con padding condicional y transición
<div className={`hidden lg:grid grid-cols-[1fr_auto_1fr] gap-8 items-center transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>

// DESPUÉS: grid con padding fijo, sin transición
<div className="hidden lg:grid grid-cols-[1fr_auto_1fr] gap-8 items-center py-4">
```

#### Cambios en Columna 1 (Search)

Se elimina el bloque condicional `!isScrolled ? <expanded> : <collapsed>` y se deja solo la versión expandida:

```tsx
// Search siempre expandido
<div className="flex items-center gap-2">
  <div className="relative w-3/4 min-w-[200px]">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Buscar productos, artesanos..."
      className="pl-10 pr-24 h-10 bg-muted/30 border-border/40"
      value={localSearchQuery}
      onChange={(e) => setLocalSearchQuery(e.target.value)}
      onKeyDown={handleKeyDown}
    />
    <Button
      size="sm"
      className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
      onClick={handleSearch}
      disabled={localSearchQuery.trim().length === 0}
    >
      Buscar
    </Button>
  </div>
  {searchQuery && onSemanticSearchToggle && (
    <SemanticSearchToggle
      enabled={semanticSearchEnabled}
      onToggle={onSemanticSearchToggle}
    />
  )}
</div>
```

#### Cambios en Columna 2 (Logo)

```tsx
// ANTES: tamaño condicional con transición
<img className={`transition-all duration-300 ${isScrolled ? "h-6 md:h-7" : "h-8 md:h-10"}`} />

// DESPUÉS: tamaño fijo
<img className="h-8 md:h-10" />
```

#### Cambios en Columna 3 (Icons)

Todos los icon buttons usan tamaño fijo `h-10 w-10` con iconos `h-5 w-5`. El botón de login para usuarios no autenticados siempre muestra texto:

```tsx
// ANTES: condicional icon-only vs texto
{isScrolled ? (
  <Button variant="ghost" size="icon" className="h-8 w-8">
    <LogIn className="h-4 w-4" />
  </Button>
) : (
  <Button variant="default" size="sm">Iniciar Sesión</Button>
)}

// DESPUÉS: siempre texto
<Button variant="default" size="sm">Iniciar Sesión</Button>
```

Para User y LogOut buttons cuando autenticado:

```tsx
// ANTES: tamaño condicional
<Button className={isScrolled ? "h-8 w-8" : "h-10 w-10"}>
  <User className={isScrolled ? "h-4 w-4" : "h-5 w-5"} />
</Button>

// DESPUÉS: tamaño fijo
<Button variant="ghost" size="icon" className="h-10 w-10">
  <User className="h-5 w-5" />
</Button>
```

#### Cambios en Nav Links

```tsx
// ANTES: padding y background condicional con transición
<nav className={`hidden lg:block border-t border-border/10 transition-all duration-300 ${isScrolled ? "bg-muted/30" : ""}`}>
  <div className={`flex items-center justify-center gap-8 transition-all duration-300 ${isScrolled ? "py-1.5" : "py-3"}`}>
    <Link className={`... ${isScrolled ? "text-xs" : "text-sm"}`}>

// DESPUÉS: valores fijos, sin transición
<nav className="hidden lg:block border-t border-border/10">
  <div className="flex items-center justify-center gap-8 py-3">
    <Link className="... text-sm">
```

#### Cambios en Header

```tsx
// ANTES: shadow condicional
<header className={`sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm ${isScrolled ? "shadow-md" : ""}`}>

// DESPUÉS: sin sombras
<header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
```

## Interfaces

No hay cambios en la interfaz pública del componente (`NavbarV2Props`). Todos los props se mantienen idénticos.

```typescript
interface NavbarV2Props {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  semanticSearchEnabled?: boolean;
  onSemanticSearchToggle?: (enabled: boolean) => void;
  onHomeClick?: () => void;
}
```

## Data Models

No aplica. No hay cambios en modelos de datos.

## Error Handling

No aplica. El refactoring no introduce nuevos flujos de error. El componente mantiene su comportamiento existente para estados como carrito vacío, usuario no autenticado, etc.

## State Management

### Estado eliminado

| Estado | Tipo | Propósito original | Razón de eliminación |
|--------|------|-------------------|---------------------|
| `isScrolled` | `boolean` | Detectar scroll > 50px | Ya no hay comportamiento condicional al scroll |
| `searchVisible` | `boolean` | Toggle del search compacto | Search siempre visible |

### useEffect eliminado

```typescript
// ELIMINADO: Scroll detection
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
    if (window.scrollY <= 50) setSearchVisible(false);
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### Función eliminada

```typescript
// ELIMINADA
const toggleSearch = () => setSearchVisible(!searchVisible);
```

## Sin cambios

Los siguientes aspectos permanecen **intactos**:
- Mobile top bar completo (hamburger, logo, search toggle, cart)
- Mobile search bar desplegable
- Mobile drawer (overlay, nav links, footer actions)
- Mega menu (hover open, timer close, CategoriesMegaMenu component)
- Lógica de búsqueda (handleSearch, handleKeyDown, navigate)
- Body scroll lock para mobile menu
- CartDrawer, GuestAuthModal
- SemanticSearchToggle (se muestra condicionalmente si hay searchQuery)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Nav links always render at text-sm

*For any* nav link rendered in the desktop navigation area, its className SHALL contain `text-sm` regardless of any component state.

**Validates: Requirements 4.3**

### Property 2: Icon buttons always render at h-10 w-10

*For any* icon button (wishlist, cart, user, logout) rendered in the desktop icons column, its className SHALL contain `h-10 w-10` regardless of any component state.

**Validates: Requirements 4.5**

### Property 3: Internal icons always render at h-5 w-5

*For any* icon SVG rendered inside desktop icon buttons, its className SHALL contain `h-5 w-5` regardless of any component state.

**Validates: Requirements 4.6**
