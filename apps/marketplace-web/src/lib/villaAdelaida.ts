/**
 * Alianza Villa Adelaida — Programa de fortalecimiento comercial.
 *
 * Villa Adelaida tiene su propio despliegue del marketplace (el micrositio),
 * que filtra el catálogo por este convenio. Aquí, en telar.co, conviven
 * productos de todos los convenios, así que usamos el id para distinguir
 * cuáles pertenecen al programa y marcarlos con el sello.
 */

/** Convenio CO-CREA / Villa Adelaida (mismo id que hornea build-cocrea.yml). */
export const VILLA_ADELAIDA_AGREEMENT_ID =
  "b7a6d812-5dd7-4d7b-bec4-687d65234f4f";

/** Micrositio con el catálogo filtrado por el convenio. */
export const VILLA_ADELAIDA_MICROSITIO_URL = "https://cocrea.telar.co/productos";

/** Ruta de la sección de la alianza dentro de telar.co. */
export const VILLA_ADELAIDA_PATH = "/alianza-villa-adelaida";

/** ¿El producto pertenece al convenio de Villa Adelaida? */
export const isVillaAdelaidaProduct = (product: unknown): boolean =>
  (product as { agreementId?: string | null } | null)?.agreementId ===
  VILLA_ADELAIDA_AGREEMENT_ID;
