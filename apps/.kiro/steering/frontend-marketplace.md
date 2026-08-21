---
inclusion: fileMatch
fileMatchPattern: "marketplace-web/**"
---

# marketplace-web/ — Marketplace para Consumidores (React)

## Descripción

SPA pública donde los consumidores descubren, exploran y compran productos artesanales. Incluye navegación por mapa geográfico, búsqueda, catálogo, carrito, checkout, y contenido editorial del CMS.

## Stack Tecnológico

- **Framework:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS
- **Iconos:** Lucide React
- **Data fetching:** TanStack React Query
- **Formularios:** React Hook Form + Zod
- **Routing:** React Router DOM
- **Mapas:** MapLibre GL + react-map-gl + deck.gl
- **CMS:** Storyblok (@storyblok/react)
- **Auth:** Supabase (@supabase/supabase-js)
- **HTTP:** Axios
- **Charts:** Recharts

## Estructura del Proyecto

```
marketplace-web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── map/               # Componentes de mapa
│   │   └── ...
│   ├── pages/
│   ├── hooks/
│   ├── services/              # API clients
│   ├── lib/
│   └── types/
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── nginx.conf                 # Config para deploy Docker
├── docker-compose.yml
├── Dockerfile
├── vercel.json
└── package.json
```

## Comandos Principales

```bash
# Desarrollo
npm run dev                # Vite dev server

# Build
npm run build              # Build producción

# Preview
npm run preview

# Lint
npm run lint
```

## Comunicación con APIs

- **API principal:** `${VITE_API_URL}/telar/server/*` — productos, tiendas, órdenes, checkout
- **Auth:** Supabase (registro/login de consumidores)
- **CMS:** Storyblok API (contenido editorial, blog)

## Dependencia Compartida

- `@telar/shared-types` (enlazado via `file:../shared-types`)

## Variables de Entorno (.env)

| Variable                  | Descripción                      |
|---------------------------|----------------------------------|
| `VITE_API_URL`            | URL del backend NestJS           |
| `VITE_SUPABASE_URL`       | URL del proyecto Supabase        |
| `VITE_SUPABASE_ANON_KEY`  | Anon key de Supabase             |
| `VITE_STORYBLOK_TOKEN`    | Token de Storyblok CMS           |
| `VITE_MAPLIBRE_STYLE_URL` | URL del estilo de mapa           |

## Convenciones de Código

- Mismas convenciones que `artisans-web/` (shadcn/ui, Tailwind, React Query, Zod)
- Componentes de mapa aislados en `src/components/map/`
- Contenido CMS renderizado con componentes Storyblok
- SEO: metadata adecuada por página (título, descripción)
- Performance: lazy loading de rutas y componentes de mapa (deck.gl es pesado)

## Deploy

- **Producción:** Vercel (principal) o Docker + nginx
- **Dominio:** `marketplace.telar.co` / `www.telar.co`
