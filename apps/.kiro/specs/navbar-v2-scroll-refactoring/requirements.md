# Requirements Document

## Introduction

Refactoring del componente NavbarV2 en marketplace-web para eliminar todas las transiciones y animaciones condicionales al scroll, fijando tamaños consistentes y simplificando el estado interno. El objetivo es una barra de navegación estática (sticky) sin comportamiento dinámico basado en la posición de scroll del usuario.

## Glossary

- **NavbarV2**: Componente principal de navegación del marketplace para consumidores, ubicado en `marketplace-web/src/components/NavbarV2.tsx`
- **Desktop_Layout**: Vista de la barra de navegación para pantallas >= lg (1024px), con layout de 2 filas (búsqueda + logo + iconos, y nav links)
- **Mobile_Layout**: Vista de la barra de navegación para pantallas < lg, con hamburger, logo, y drawer lateral
- **Search_Bar**: Campo de búsqueda de productos visible en el Desktop_Layout
- **Nav_Links**: Lista de enlaces de navegación principal mostrados debajo de la barra superior en Desktop_Layout
- **Mega_Menu**: Menú desplegable de categorías que se activa al hover sobre el enlace "Categorías"
- **Header**: Elemento HTML `<header>` sticky que contiene toda la NavbarV2

## Requirements

### Requirement 1: Eliminar detección de scroll

**User Story:** Como desarrollador, quiero eliminar el estado y lógica de detección de scroll, para simplificar el componente y eliminar comportamiento dinámico innecesario.

#### Acceptance Criteria

1. THE NavbarV2 SHALL render sin utilizar estado `isScrolled` ni listener de evento `scroll` en `window`
2. THE NavbarV2 SHALL render sin utilizar estado `searchVisible` ni función `toggleSearch`

### Requirement 2: Header estático sin sombras

**User Story:** Como consumidor, quiero una barra de navegación visualmente consistente sin cambios de sombra, para una experiencia visual estable.

#### Acceptance Criteria

1. THE Header SHALL aplicar la clase `border-b border-border/20` como único separador visual inferior
2. THE Header SHALL no incluir clases `shadow-sm`, `shadow-md`, ni sombras condicionales
3. THE Header SHALL mantener el comportamiento sticky con `sticky top-0 z-50`

### Requirement 3: Barra de búsqueda desktop siempre visible y expandida

**User Story:** Como consumidor, quiero que la barra de búsqueda esté siempre visible y expandida en desktop, para poder buscar productos en cualquier momento sin interacción adicional.

#### Acceptance Criteria

1. THE Search_Bar SHALL mostrarse siempre expandida en Desktop_Layout sin toggle ni colapso
2. THE Search_Bar SHALL mantener su ancho relativo (`w-3/4 min-w-[200px]`) de forma constante
3. THE Search_Bar SHALL incluir el icono de búsqueda, campo de input y botón "Buscar" de forma permanente

### Requirement 4: Tamaños fijos en Desktop_Layout

**User Story:** Como consumidor, quiero que los elementos de navegación mantengan tamaños fijos sin transiciones, para una experiencia visual estable independiente del scroll.

#### Acceptance Criteria

1. THE Desktop_Layout SHALL aplicar padding vertical `py-4` de forma constante en la barra superior
2. THE NavbarV2 SHALL renderizar el logo con clases `h-8 md:h-10` de forma constante
3. THE Nav_Links SHALL renderizarse con tamaño de fuente `text-sm` de forma constante
4. THE Nav_Links SHALL aplicar padding vertical `py-3` de forma constante en su contenedor
5. THE NavbarV2 SHALL renderizar botones de iconos con tamaño `h-10 w-10` de forma constante
6. THE NavbarV2 SHALL renderizar iconos internos con tamaño `h-5 w-5` de forma constante

### Requirement 5: Eliminar clases de transición de elementos afectados

**User Story:** Como desarrollador, quiero eliminar las clases de transición de los elementos que ya no cambian dinámicamente, para reducir CSS innecesario y mejorar la claridad del código.

#### Acceptance Criteria

1. THE Desktop_Layout SHALL no incluir clases `transition-all duration-300` en elementos cuyo tamaño o visibilidad ya no cambia dinámicamente
2. THE NavbarV2 SHALL no incluir clases condicionales basadas en estado de scroll en ningún elemento

### Requirement 6: Botón Iniciar Sesión siempre con texto

**User Story:** Como consumidor no autenticado, quiero ver siempre el botón "Iniciar Sesión" con texto visible, para identificar fácilmente cómo acceder a mi cuenta.

#### Acceptance Criteria

1. WHILE el usuario no está autenticado, THE NavbarV2 SHALL mostrar un botón con texto "Iniciar Sesión" (variante `default`, tamaño `sm`) en Desktop_Layout
2. THE NavbarV2 SHALL no mostrar variante icono-only del botón de login en ningún estado de scroll

### Requirement 7: Funcionalidad mobile intacta

**User Story:** Como consumidor en dispositivo móvil, quiero que la navegación mobile funcione exactamente igual que antes del refactoring.

#### Acceptance Criteria

1. THE Mobile_Layout SHALL mantener el drawer lateral con hamburger menu sin cambios funcionales
2. THE Mobile_Layout SHALL mantener la barra de búsqueda móvil desplegable sin cambios funcionales
3. THE Mobile_Layout SHALL mantener los botones de búsqueda y carrito en la barra superior sin cambios

### Requirement 8: Mega menu intacto

**User Story:** Como consumidor, quiero que el mega menu de categorías funcione igual que antes del refactoring.

#### Acceptance Criteria

1. THE Mega_Menu SHALL activarse al hover sobre el enlace "Categorías" sin cambios funcionales
2. THE Mega_Menu SHALL cerrarse con delay al salir del área del menú sin cambios funcionales
