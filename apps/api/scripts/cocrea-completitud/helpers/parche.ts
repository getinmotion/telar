import { ShopProd } from './api';
import { aboutTieneContenido, conContenido, contactoTieneContenido } from './estado';

/**
 * Decide qué campos rellenar en una tienda que ya existe.
 *
 * La regla del convenio es no pisar nada de lo que el artesano haya escrito: sólo
 * se completan los huecos. Vive aparte de 04-inyectar.ts para que el ensayo pueda
 * ejercitar exactamente la misma lógica que la corrida real, en vez de una copia
 * parecida.
 */
export function parcheDeCompletitud(shop: ShopProd, t: Record<string, any>): Record<string, unknown> {
  const parche: Record<string, unknown> = {};

  /**
   * Rellena sólo si el hueco existe **y** hay algo con que rellenarlo.
   * Sin la segunda condición el parche emitía claves con valor vacío: al
   * serializar desaparecen, la API no guarda nada y el script informaba de un
   * cambio que nunca ocurrió, además de reproponerlo en cada corrida.
   */
  const rellenar = (campo: string, hayHueco: boolean, valor: unknown) => {
    if (hayHueco && conContenido(valor)) parche[campo] = valor;
  };

  rellenar('description', !conContenido(shop.description), t.description);
  rellenar('story', !conContenido(shop.story), t.story);
  rellenar('brandClaim', !conContenido(shop.brandClaim), t.brandClaim);
  rellenar('craftType', !conContenido(shop.craftType), t.craftType);
  rellenar('department', !conContenido(shop.department), t.department);
  rellenar('municipality', !conContenido(shop.municipality), t.municipality);
  rellenar('aboutContent', !aboutTieneContenido(shop), t.aboutContent);
  rellenar('contactConfig', !contactoTieneContenido(shop), t.contactConfig);

  if (!shop.artisanProfileCompleted) {
    // Lo que el artesano ya hubiera puesto en su perfil gana sobre lo generado.
    parche.artisanProfile = { ...t.artisanProfile, ...(shop.artisanProfile ?? {}) };
    parche.artisanProfileCompleted = true;
  }

  return parche;
}
