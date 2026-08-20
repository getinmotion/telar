import { ShopProd, ProductProd, storeIdDe } from './api';

/** Qué le falta a una tienda para cumplir la meta del convenio. */
export interface EstadoTienda {
  publicada: boolean;
  perfilCompleto: boolean;
  conProducto: boolean;
  conProductoAprobado: boolean;
  cumpleMeta: boolean;
  faltantes: string[];
}

const vacio = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  return false;
};

export const conContenido = (v: unknown): boolean => !vacio(v);

/** aboutContent existe siempre con la forma por defecto; "tener contenido" es otra cosa. */
export const aboutTieneContenido = (s: ShopProd): boolean => {
  const a = s.aboutContent;
  if (!a) return false;
  return conContenido(a.story) || conContenido(a.title) || conContenido(a.mission) || conContenido(a.vision) || (Array.isArray(a.values) && a.values.length > 0);
};

export const contactoTieneContenido = (s: ShopProd): boolean =>
  !!s.contactConfig && Object.values(s.contactConfig).some((v) => conContenido(v));

export function evaluar(shop: ShopProd, productos: ProductProd[]): EstadoTienda {
  const mios = productos.filter((p) => storeIdDe(p) === shop.id);
  const publicada = shop.publishStatus === 'published';
  const perfilCompleto = !!shop.artisanProfileCompleted;
  const conProducto = mios.length > 0;
  const conProductoAprobado = mios.some((p) => p.status === 'approved' || p.status === 'approved_with_edits');

  const faltantes: string[] = [];
  if (!perfilCompleto) faltantes.push('identidad artesanal');
  if (!conProducto) faltantes.push('producto');
  if (!publicada) faltantes.push('publicar');
  if (!conContenido(shop.logoUrl)) faltantes.push('logo');
  if (!aboutTieneContenido(shop)) faltantes.push('aboutContent');
  if (!conContenido(shop.idPoliciesConfig)) faltantes.push('políticas/FAQ');
  if (!contactoTieneContenido(shop)) faltantes.push('contacto');
  if (!conContenido(shop.brandClaim)) faltantes.push('brandClaim');
  if (!conContenido(shop.department) || !conContenido(shop.municipality)) faltantes.push('ubicación');

  return {
    publicada,
    perfilCompleto,
    conProducto,
    conProductoAprobado,
    // La meta del convenio: publicada + identidad artesanal + al menos un producto.
    cumpleMeta: publicada && perfilCompleto && conProducto,
    faltantes,
  };
}
