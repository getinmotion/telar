/**
 * lazyWithReload — envoltura de React.lazy que recupera el caso
 * "stale chunk" post-deploy.
 *
 * Problema: Vite builds con code-splitting renombran chunks por hash en cada
 * deploy. Si el usuario tiene el HTML viejo cacheado (que apunta a
 * `Foo-abc123.js`), después de un deploy ese archivo ya no existe en el CDN
 * y el `import()` dinámico falla con:
 *   "Failed to fetch dynamically imported module: .../Foo-abc123.js"
 *
 * Estrategia:
 *  1. Intenta el import normal.
 *  2. Si falla con un error que claramente es chunk-stale, fuerza un
 *     `window.location.reload()` — el nuevo HTML traerá la referencia
 *     correcta al chunk vigente.
 *  3. Anti-loop: solo recarga una vez por sesión (sessionStorage flag);
 *     si el segundo intento también falla, dejamos burbujear el error
 *     para que el ErrorBoundary muestre algo útil.
 */
import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG = 'telar:lazyReloaded';

function isChunkLoadError(err: unknown): boolean {
  const msg = (err as Error)?.message ?? '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading chunk') ||
    msg.includes('Unable to preload CSS')
  );
}

export function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkLoadError(err)) {
        // Error no relacionado con chunk stale → propágalo
        throw err;
      }
      // Evita loop infinito si la recarga sigue fallando
      if (typeof sessionStorage !== 'undefined') {
        if (sessionStorage.getItem(RELOAD_FLAG) === '1') {
          console.error(
            '[lazyWithReload] El chunk sigue sin cargar después de recargar. ' +
              'Revisa el CDN / cache headers.',
            err,
          );
          throw err;
        }
        sessionStorage.setItem(RELOAD_FLAG, '1');
      }
      console.warn(
        '[lazyWithReload] Chunk stale detectado — recargando para tomar el HTML fresco.',
        err,
      );
      window.location.reload();
      // Devolvemos una promesa que nunca resuelve para que el cliente espere
      // la recarga en lugar de mostrar un error transitorio.
      return new Promise<{ default: T }>(() => {});
    }
  });
}

/**
 * Llamar al boot de la app — limpia el flag cuando una navegación cargó bien
 * para que un futuro chunk stale pueda volver a intentar el self-heal.
 */
export function clearLazyReloadFlag() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(RELOAD_FLAG);
  }
}
