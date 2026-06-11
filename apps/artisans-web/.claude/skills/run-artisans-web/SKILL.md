---
name: run-artisans-web
description: Run, start, launch, screenshot, preview, or test the artisans-web Vite+React frontend app. Use when asked to run the artisan platform, check the UI, verify a change in the browser, or drive the artisans web app.
---

# run-artisans-web

**artisans-web** is a Vite 5 + React 18 + ShadCN + Supabase SPA for the artisan platform. It is driven via the `preview_*` tools using the existing `artisans-web` entry in `.claude/launch.json` at the repo root. Paths here are relative to `apps/artisans-web/`.

## Prerequisites

- Node.js 18+ and npm installed (already available in repo)
- `.env` file present at `apps/artisans-web/.env` — it ships in the repo with dev Supabase credentials; no additional setup needed
- `node_modules/` installed: `npm install` from `apps/artisans-web/`

## Launch (agent path)

Use `preview_start` with name `"artisans-web"` — that entry already exists in `.claude/launch.json`:

```
preview_start("artisans-web")
→ returns serverId and port (usually 8081, or autoPort if occupied)
```

**Wait ~35 seconds** on first start — Vite re-optimizes dependencies on lockfile changes. Watch `preview_logs` for `VITE vX ready`.

Interact with the running app:

```
# Check what's rendered
preview_snapshot(serverId)

# Check for JS errors
preview_console_logs(serverId, level="error")

# Fill the login form
preview_fill(serverId, "input[type='email']", "user@example.com")
preview_fill(serverId, "input[type='password']", "password")
preview_click(serverId, "button:has-text('Entrar')")

# Navigate to a route
preview_eval(serverId, "window.location.href = '/dashboard'")
```

## Default route

The app opens at `/` → redirected to the **Login page** (shows "HOLA, BIENVENIDO", email + password fields, "Entrar" button). Auth is Supabase-backed; authenticated routes require valid credentials.

## Run (human path)

```
cd apps/artisans-web
npm run dev          # starts on port 8080, opens in browser
npm run build        # production build to dist/
npm run preview      # preview the production build
```

## Tests

**Tests are currently broken** — `vitest.config.ts` imports `@vitejs/plugin-react` but only `@vitejs/plugin-react-swc` is installed. Fix before running:

```
# Install the missing package first
npm install --save-dev @vitejs/plugin-react --prefix apps/artisans-web

# Then run
npx vitest run --config apps/artisans-web/vitest.config.ts
```

Test files are in `src/hooks/__tests__/` and `src/utils/__tests__/`.

## Gotchas

- **`preview_screenshot` always times out** — the contentsquare analytics script (`t.contentsquare.net`) blocks the screenshot renderer. Use `preview_snapshot` for structure/text checks and `preview_eval("document.body.innerHTML")` for raw HTML instead.
- **React mounts slowly** — `document.getElementById('root').innerHTML` is empty for the first 5–10 seconds after the page loads. Use `preview_snapshot` which waits for content, or poll with `preview_eval` checking `innerHTML.length > 0`.
- **Vite HMR reconnect loop in console** — `[vite] connecting...` repeating is normal; it's the HMR websocket reconnecting across preview frames. It does not affect the app.
- **Port collision** — `launch.json` requests port 8081 but `autoPort: true` lets Vite pick another. Always use the `serverId` from `preview_start`, not a hardcoded port.
- **`@vitejs/plugin-react-swc` vs `@vitejs/plugin-react`** — `vite.config.ts` (for dev/build) uses `-swc`, `vitest.config.ts` (for tests) uses the non-swc variant. They must both be installed for tests to work.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `preview_screenshot` times out | Use `preview_snapshot` or `preview_eval` — contentsquare blocks screenshots |
| `root.innerHTML` is empty | Wait 5–10s after page load; React mounts asynchronously |
| `vitest run` → `Cannot find package '@vitejs/plugin-react'` | Install: `npm install --save-dev @vitejs/plugin-react --prefix apps/artisans-web` |
| Server takes >30s to become ready | Normal on first run — Vite re-optimizes deps. Watch for `VITE vX ready` in `preview_logs` |
| Port 8081 already in use | `autoPort: true` handles this — use the `port` from `preview_start` response |
