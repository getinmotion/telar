/**
 * Convenio (agreement) al que pertenece este despliegue del marketplace.
 *
 * Se hornea en tiempo de build desde `VITE_AGREEMENT_ID` y se envía como
 * `agreementId` en las llamadas públicas: la API solo devuelve productos y
 * talleres de artesanos inscritos en ese convenio.
 *
 * Cada despliegue apunta a un convenio distinto (telar.co, cocrea.telar.co, …).
 * Si la variable queda vacía el backend NO filtra y se muestran los productos
 * de todos los convenios — de ahí el aviso en consola.
 */
export const AGREEMENT_ID: string | undefined =
  import.meta.env.VITE_AGREEMENT_ID || undefined;

if (!AGREEMENT_ID) {
  console.warn(
    "[agreement] VITE_AGREEMENT_ID no está configurado: se mostrarán productos y talleres de TODOS los convenios.",
  );
}
