---
inclusion: fileMatch
fileMatchPattern: "artisans-web/**"
---

# artisans-web/ — Portal Web para Artesanos (React)

## Descripción

SPA para artesanos donde gestionan su tienda, productos, onboarding, tareas asignadas por agentes IA, y chat con agentes especializados. Es la interfaz principal del artesano con la plataforma.

## Stack Tecnológico

- **Framework:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Estado global:** Zustand
- **Data fetching:** TanStack React Query
- **Formularios:** React Hook Form + Zod (validación)
- **Routing:** React Router DOM
- **Auth:** Supabase Auth (@supabase/auth-helpers-react)
- **Charts:** Recharts
- **DnD:** react-beautiful-dnd
- **Testing:** Vitest + Testing Library + axe-core (a11y)
- **Storybook:** Para desarrollo aislado de componentes

## Estructura del Proyecto

```
artisans-web/
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Router + providers
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Feature components
│   ├── pages/                 # Route pages
│   ├── hooks/                 # Custom hooks
│   ├── stores/                # Zustand stores
│   ├── services/              # API clients (axios)
│   ├── lib/                   # Utilidades
│   └── types/                 # Tipos locales
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json                # Deploy config
└── Dockerfile                 # Build + nginx
```

## Comandos Principales

```bash
# Desarrollo
npm run dev                # Vite dev server (puerto 5173)

# Build
npm run build              # Build producción

# Preview
npm run preview            # Preview del build

# Tests
npm run test               # Vitest
npm run test:ui            # Vitest UI

# Lint
npm run lint               # ESLint

# Storybook
npm run storybook          # Storybook dev server
```

## Comunicación con APIs

- **API principal (NestJS):** `${VITE_API_URL}/telar/server/*` — auth, productos, órdenes, etc.
- **Agents API:** `${VITE_AGENTS_URL}/api/agents/*` — chat IA, onboarding, product creation
- **Auth:** Supabase client-side auth, JWT pasado como Bearer en headers

## Dependencia Compartida

- `@telar/shared-types` (enlazado via `file:../shared-types`) — tipos de productos, tiendas, taxonomía

## Variables de Entorno (.env)

| Variable              | Descripción                      |
|-----------------------|----------------------------------|
| `VITE_API_URL`        | URL del backend NestJS           |
| `VITE_AGENTS_URL`     | URL del servicio de agentes      |
| `VITE_SUPABASE_URL`   | URL del proyecto Supabase        |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase          |

## Convenciones de Código

- Componentes: PascalCase, un componente por archivo
- Hooks custom: `use` prefix, en `src/hooks/`
- Stores Zustand: un store por dominio en `src/stores/`
- API calls: centralizar en `src/services/` con React Query
- Estilos: Tailwind utility classes, sin CSS custom excepto en `globals.css`
- Formularios: siempre con React Hook Form + Zod schema
- Accesibilidad: seguir WCAG, usar axe-core en tests
- Imports: paths relativos (no aliases configurados por defecto)

## Deploy

- **Producción:** Vercel (configurado en `vercel.json`)
- **Alternativa:** Docker (nginx serving static build)
