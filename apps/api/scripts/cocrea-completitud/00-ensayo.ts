/**
 * Ensayo de extremo a extremo con UN artesano de prueba.
 *
 * Existe para no estrenar la cadena de llamadas contra producción. Recorre los
 * mismos endpoints y payloads que 04-inyectar.ts —registro, verificación de
 * correo, tienda, políticas, logo, producto, publicación— y reporta en qué paso
 * se rompe, si se rompe.
 *
 *   COCREA_TARGET=stage npx ts-node 00-ensayo.ts --apply
 *
 * Deliberadamente NO apunta a prod: si TARGET es prod, aborta.
 */
import { API_BASE, DEFAULT_PASSWORD, DRY_RUN, TARGET, banner } from './config';
import { ApiError, get, setToken } from './helpers/api';
import { cargarCatalogos, resolverTerritorio } from './helpers/catalogos';
import { inferirOficio, resolverOficio } from './helpers/oficio';
import {
  POLITICA_DEVOLUCION,
  aboutContent,
  brandClaim,
  descripcionTienda,
  faq,
  historiaTienda,
  logoSvg,
  perfilArtesanal,
  productoPlaceholder,
} from './helpers/contenido';

const pasos: Array<{ paso: string; ok: boolean; detalle: string }> = [];

async function intentar<T>(paso: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const r = await fn();
    pasos.push({ paso, ok: true, detalle: typeof r === 'object' && r ? JSON.stringify(r).slice(0, 90) : String(r) });
    console.log(`  ✓ ${paso}`);
    return r;
  } catch (e) {
    const detalle = e instanceof ApiError ? `${e.status} · ${e.body}` : (e as Error).message;
    pasos.push({ paso, ok: false, detalle });
    console.log(`  ✗ ${paso}\n      ${detalle}`);
    return null;
  }
}

async function pedir<T>(method: string, ruta: string, body?: unknown, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${ruta}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await res.text();
  if (!res.ok) throw new ApiError(`${method} ${ruta} -> ${res.status}`, res.status, texto.slice(0, 400));
  return (texto ? JSON.parse(texto) : null) as T;
}

async function main() {
  banner('Ensayo end-to-end · un artesano de prueba');

  if (TARGET === 'prod') {
    throw new Error('El ensayo no corre contra producción. Usa COCREA_TARGET=stage o local.');
  }
  if (DRY_RUN) {
    console.log('Este script sólo tiene sentido escribiendo de verdad. Añade --apply.\n');
    return;
  }

  const cat = await cargarCatalogos();

  // Convenio del entorno de pruebas: el primero que exista allí.
  const agreements = await get<Array<{ id: string; name: string }>>('/agreements');
  const agreement = agreements[0];
  console.log(`Convenio de pruebas: ${agreement.name} (${agreement.id})\n`);

  const sello = Date.now();
  const email = `cocrea-ensayo-${sello}@example.com`;
  const oficio = resolverOficio(cat, inferirOficio('Viche Ensayo'));
  const territorio = resolverTerritorio(cat, 'Buenaventura', 'Valle del Cauca')!;
  const datos = {
    nombre: 'Artesano De Ensayo',
    marca: `Ensayo Cocrea ${sello}`,
    municipio: territorio.city,
    departamento: territorio.department,
    origen: 'ensayo',
    oficio,
  };

  console.log(`Cuenta de prueba: ${email}\n`);

  // 1 · registro
  const reg = await intentar('POST /auth/register', () =>
    pedir<{ userId: string }>('POST', '/auth/register', {
      idTypeId: cat.idTypeCcId,
      idNumber: String(9900000000 + (sello % 100000)),
      firstName: 'Artesano',
      lastName: 'De Ensayo',
      agreementId: agreement.id,
      email,
      password: DEFAULT_PASSWORD,
      passwordConfirmation: DEFAULT_PASSWORD,
      whatsapp: '+573900000001',
      countryId: cat.countryId,
      department: territorio.department,
      city: territorio.city,
      daneCity: territorio.daneCity,
      hasRUT: false,
      acceptTerms: true,
      newsletterOptIn: false,
    }),
  );
  if (!reg) return resumen();

  // 2 · login (no debería exigir el correo verificado)
  const login = await intentar('POST /auth/login', () =>
    pedir<Record<string, any>>('POST', '/auth/login', { email, password: DEFAULT_PASSWORD }),
  );
  const token: string | null =
    login?.accessToken ?? login?.access_token ?? login?.token ?? login?.data?.accessToken ?? null;
  console.log(`      token: ${token ? 'obtenido' : 'NO OBTENIDO — revisar la forma de la respuesta'}`);
  setToken(token);

  // 3 · verificación de correo sin intervención del artesano
  const tok = await intentar('POST /email-verifications/generate/:userId', () =>
    pedir<{ token: string }>('POST', `/email-verifications/generate/${reg.userId}`, {}, token),
  );
  if (tok?.token) {
    await intentar('POST /email-verifications/verify/:token', () =>
      pedir('POST', `/email-verifications/verify/${tok.token}`, {}),
    );
  }

  // 4 · tienda
  const shop = await intentar('POST /artisan-shops', () =>
    pedir<{ id: string }>(
      'POST',
      '/artisan-shops',
      { userId: reg.userId, shopName: datos.marca, shopSlug: `ensayo-cocrea-${sello}` },
      token,
    ),
  );
  if (!shop) return resumen();

  // 5 · perfil artesanal y configuración
  await intentar('PATCH /artisan-shops/:id (perfil + config)', () =>
    pedir(
      'PATCH',
      `/artisan-shops/${shop.id}`,
      {
        description: descripcionTienda(datos),
        story: historiaTienda(datos),
        brandClaim: brandClaim(datos),
        craftType: oficio.craft,
        department: datos.departamento,
        municipality: datos.municipio,
        aboutContent: aboutContent(datos),
        artisanProfile: perfilArtesanal(datos, new Date(sello).toISOString()),
        artisanProfileCompleted: true,
      },
      token,
    ),
  );

  // 6 · políticas y FAQ
  const pol = await intentar('POST /store-policies-config', () =>
    pedir<{ id: string }>('POST', '/store-policies-config', { returnPolicy: POLITICA_DEVOLUCION, faq: faq(datos) }, token),
  );
  if (pol?.id) {
    await intentar('PATCH /artisan-shops/:id (idPoliciesConfig)', () =>
      pedir('PATCH', `/artisan-shops/${shop.id}`, { idPoliciesConfig: pol.id }, token),
    );
  }

  // 7 · logo SVG por multipart
  const logo = await intentar('POST /file-upload/image (svg)', async () => {
    const form = new FormData();
    form.append('file', new Blob([logoSvg(datos.marca)], { type: 'image/svg+xml' }), 'ensayo.svg');
    form.append('folder', 'shops');
    const res = await fetch(`${API_BASE}/file-upload/image`, { method: 'POST', body: form });
    if (!res.ok) throw new ApiError('file-upload', res.status, (await res.text()).slice(0, 300));
    return res.json() as Promise<{ url: string }>;
  });
  if (logo?.url) {
    await intentar('PATCH /artisan-shops/:id (logoUrl)', () =>
      pedir('PATCH', `/artisan-shops/${shop.id}`, { logoUrl: logo.url }, token),
    );
  }

  // 8 · producto con stock 0
  const prod = productoPlaceholder(datos);
  const creado = await intentar('POST /products-new', () =>
    pedir<{ id: string }>(
      'POST',
      '/products-new',
      {
        storeId: shop.id,
        name: prod.name,
        shortDescription: prod.shortDescription,
        history: prod.history,
        careNotes: prod.careNotes,
        usageSuggestions: prod.usageSuggestions,
        categoryId: oficio.categoryId,
        artisanalIdentity: {
          primaryCraftId: oficio.craftId,
          pieceType: 'funcional',
          style: 'tradicional',
          processType: 'manual',
        },
        production: { availabilityType: 'bajo_pedido' },
        variants: [
          { stockQuantity: 0, minStock: 0, basePriceMinor: '8000000', currency: 'COP', isActive: true },
        ],
        status: 'pending_moderation',
      },
      token,
    ),
  );

  if (creado?.id) {
    await intentar('PATCH /products-new/:id/status (approved)', () =>
      pedir('PATCH', `/products-new/${creado.id}/status`, { status: 'approved' }, token),
    );
  }

  // 9 · publicar
  await intentar('PATCH /artisan-shops/:id (publicar)', () =>
    pedir('PATCH', `/artisan-shops/${shop.id}`, { publishStatus: 'published', active: true }, token),
  );

  // 10 · comprobación: ¿quedó como esperábamos?
  const final = await intentar('GET /artisan-shops/:id (verificación)', () =>
    pedir<Record<string, any>>('GET', `/artisan-shops/${shop.id}`),
  );
  if (final) {
    const f = (final as any).data ?? final;
    console.log(
      `      publishStatus=${f.publishStatus} · perfilCompleto=${f.artisanProfileCompleted} · logo=${!!f.logoUrl} · políticas=${!!f.idPoliciesConfig}`,
    );
  }
  if (creado?.id) {
    const p = await intentar('GET /products-new/:id (verificación)', () =>
      pedir<Record<string, any>>('GET', `/products-new/${creado.id}`),
    );
    const pd = (p as any)?.data ?? p;
    if (pd) console.log(`      status=${pd.status} · stock=${pd.variants?.[0]?.stockQuantity}`);
  }

  console.log(`\n  Datos de prueba creados en ${TARGET}: usuario ${email}, tienda ${shop.id}`);
  resumen();
}

function resumen() {
  const ok = pasos.filter((p) => p.ok).length;
  console.log('\n' + '─'.repeat(64));
  console.log(`Ensayo: ${ok}/${pasos.length} pasos correctos`);
  const fallos = pasos.filter((p) => !p.ok);
  if (fallos.length) {
    console.log('\nFallos:');
    fallos.forEach((f) => console.log(`  · ${f.paso}\n    ${f.detalle}`));
  }
  console.log('─'.repeat(64));
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  resumen();
  process.exit(1);
});
