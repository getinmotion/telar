# Implementation Plan: NavbarV2 Scroll Refactoring

## Overview

Refactoring de un solo archivo (`marketplace-web/src/components/NavbarV2.tsx`) para eliminar toda lógica condicional basada en scroll, dejando una navbar estática con tamaños fijos. Se elimina estado, efectos y clases de transición innecesarias, manteniendo intacta la funcionalidad mobile y el mega menu.

## Tasks

- [x] 1. Remove scroll-related state, effect, and function
  - [x] 1.1 Remove `isScrolled` state, `searchVisible` state, `toggleSearch` function, and the scroll detection `useEffect`
    - Delete `const [isScrolled, setIsScrolled] = useState(false)`
    - Delete `const [searchVisible, setSearchVisible] = useState(false)`
    - Delete `const toggleSearch = () => setSearchVisible(!searchVisible)`
    - Delete the entire `useEffect` block that adds/removes the scroll event listener
    - Remove the `LogIn` icon from the lucide-react import (no longer needed)
    - _Requirements: 1.1, 1.2_

- [x] 2. Simplify header element
  - [x] 2.1 Remove shadow classes and scroll-conditional className from the `<header>` tag
    - Replace the template literal className with a static string: `"sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"`
    - Remove `shadow-sm`, the conditional `shadow-md`, and the `isScrolled` ternary
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Fix desktop top bar and search column
  - [x] 3.1 Remove transition and fix padding on the desktop grid container
    - Change className to `"hidden lg:grid grid-cols-[1fr_auto_1fr] gap-8 items-center py-4"` (remove `transition-all duration-300` and `isScrolled` ternary)
    - _Requirements: 4.1, 5.1_

  - [x] 3.2 Replace conditional search block with always-expanded search
    - Remove the `!isScrolled ? <expanded> : <collapsed>` ternary in Column 1
    - Keep only the expanded version: the `relative w-3/4 min-w-[200px]` search bar with icon, input, button, and SemanticSearchToggle
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Fix logo and icons column
  - [x] 4.1 Fix logo to static size without transition
    - Replace `className={\`transition-all duration-300 ${isScrolled ? "h-6 md:h-7" : "h-8 md:h-10"}\`}`with`className="h-8 md:h-10"`on both logo`<img>` elements (onHomeClick and Link variants)
    - _Requirements: 4.2, 5.1_

  - [x] 4.2 Fix icon buttons and login button to static sizes
    - Set User and LogOut buttons to fixed `className="h-10 w-10"` with icons at `className="h-5 w-5"`
    - Replace the `isScrolled` ternary for login with just `<Button variant="default" size="sm">Iniciar Sesión</Button>`
    - _Requirements: 4.5, 4.6, 6.1, 6.2_

- [x] 5. Fix desktop nav links section
  - [x] 5.1 Remove transitions and conditional styles from nav links container
    - Change `<nav>` className to `"hidden lg:block border-t border-border/10"` (remove `transition-all duration-300` and `isScrolled ? "bg-muted/30" : ""`)
    - Change inner `<div>` className to `"flex items-center justify-center gap-8 py-3"` (remove transition and `isScrolled` ternary)
    - Change all `<Link>` nav items to use fixed `text-sm` (remove `isScrolled ? "text-xs" : "text-sm"` ternary)
    - _Requirements: 4.3, 4.4, 5.1, 5.2_

- [x] 6. Checkpoint — Verify build compiles
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` in `marketplace-web/` to confirm TypeScript compiles without errors after refactoring
  - _Requirements: All_

- [ ]\* 7. Write unit tests for static rendering properties
  - [ ]\* 7.1 Write property test: nav links always render at text-sm
    - **Property 1: Nav links always render at text-sm**
    - **Validates: Requirements 4.3**

  - [ ]\* 7.2 Write property test: icon buttons always render at h-10 w-10
    - **Property 2: Icon buttons always render at h-10 w-10**
    - **Validates: Requirements 4.5**

  - [ ]\* 7.3 Write property test: internal icons always render at h-5 w-5
    - **Property 3: Internal icons always render at h-5 w-5**
    - **Validates: Requirements 4.6**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- This is a single-file refactoring: `marketplace-web/src/components/NavbarV2.tsx`
- All mobile functionality (drawer, mobile search, hamburger) remains untouched
- Mega menu functionality remains untouched
- No new dependencies, components, or API changes required
- The `LogIn` icon import can be removed since the icon-only login button variant is eliminated

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "4.2", "5.1"] },
    { "id": 3, "tasks": ["7.1", "7.2", "7.3"] }
  ]
}
```
