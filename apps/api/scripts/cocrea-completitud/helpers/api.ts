import { AGREEMENT_ID, API_BASE, DRY_RUN } from '../config';

/** Campos que devuelve GET /artisan-shops (subconjunto que usa este script). */
export interface ShopProd {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description?: string | null;
  story?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandClaim?: string | null;
  craftType?: string | null;
  region?: string | null;
  department?: string | null;
  municipality?: string | null;
  aboutContent?: Record<string, any> | null;
  contactConfig?: Record<string, any> | null;
  socialLinks?: Record<string, any> | null;
  heroConfig?: Record<string, any> | null;
  idPoliciesConfig?: string | null;
  publishStatus?: string | null;
  active?: boolean;
  marketplaceApproved?: boolean;
  marketplaceApprovalStatus?: string | null;
  bankDataStatus?: string | null;
  idContraparty?: string | null;
  artisanProfile?: Record<string, any> | null;
  artisanProfileCompleted?: boolean;
  user?: { email?: string; emailConfirmedAt?: string | null } | null;
}

export interface ProductProd {
  id: string;
  storeId?: string;
  store_id?: string;
  name?: string;
  status?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
  }
}

let token: string | null = null;

export function setToken(t: string | null): void {
  token = t;
}

async function request<T>(method: string, ruta: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${ruta}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const texto = await res.text();
  if (!res.ok) {
    throw new ApiError(`${method} ${ruta} -> ${res.status}`, res.status, texto.slice(0, 600));
  }
  return (texto ? JSON.parse(texto) : null) as T;
}

export const get = <T>(ruta: string): Promise<T> => request<T>('GET', ruta);

/** POST/PATCH pasan por aquí: en dry-run se registran y no se envían. */
export async function write<T>(method: 'POST' | 'PATCH', ruta: string, body: unknown): Promise<T | null> {
  if (DRY_RUN) {
    escrituras.push({ method, ruta, body });
    return null;
  }
  return request<T>(method, ruta, body);
}

export const escrituras: Array<{ method: string; ruta: string; body: unknown }> = [];

/** Pagina un listado hasta agotarlo. La API tope el limit en 100. */
async function paginar<T>(ruta: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const sep = ruta.includes('?') ? '&' : '?';
    const res = await get<{ data?: T[]; total?: number }>(`${ruta}${sep}page=${page}&limit=100`);
    const lote = res.data ?? [];
    items.push(...lote);
    if (!lote.length || items.length >= (res.total ?? 0)) break;
  }
  return items;
}

export const getTiendasConvenio = (): Promise<ShopProd[]> =>
  paginar<ShopProd>(`/artisan-shops?agreementId=${AGREEMENT_ID}`);

/**
 * OJO: `GET /products-new?agreementId=` sin `status` sólo devuelve los aprobados.
 * Para saber si una tienda tiene *algún* producto hay que pedir los borradores aparte.
 */
export async function getProductosConvenio(): Promise<ProductProd[]> {
  const aprobados = await paginar<ProductProd>(`/products-new?agreementId=${AGREEMENT_ID}`);
  const borradores = await paginar<ProductProd>(`/products-new?agreementId=${AGREEMENT_ID}&status=draft`);
  const vistos = new Set<string>();
  return [...aprobados, ...borradores].filter((p) => {
    if (vistos.has(p.id)) return false;
    vistos.add(p.id);
    return true;
  });
}

export const storeIdDe = (p: ProductProd): string | undefined => p.storeId ?? p.store_id;

/** ¿El slug está libre? GET /artisan-shops/slug/:slug devuelve 404 si no existe. */
export async function slugLibre(s: string): Promise<boolean> {
  try {
    await get(`/artisan-shops/slug/${encodeURIComponent(s)}`);
    return false;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return true;
    throw e;
  }
}
