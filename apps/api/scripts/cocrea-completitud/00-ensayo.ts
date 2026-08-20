/**
 * Ensayo de extremo a extremo con UN artesano de prueba.
 *
 * Existe para no estrenar la cadena de llamadas contra producción. Recorre los
 * mismos endpoints y payloads que 04-inyectar.ts —registro, verificación de
 * correo, tienda, políticas, logo, producto, publicación— y reporta en qué paso
 * se rompe, si se rompe.
 *
 *   npm run cocrea:ensayo -- --target stage --apply   (desde apps/api)
 *
 * Deliberadamente NO apunta a prod: si TARGET es prod, aborta.
 */
import { API_BASE, DEFAULT_PASSWORD, DRY_RUN, TARGET, banner } from './config';
import { ApiError, ShopProd, get, setToken } from './helpers/api';
import { parcheDeCompletitud } from './helpers/parche';
import { cargarCatalogos, resolverTerritorio } from './helpers/catalogos';
import { inferirOficio, resolverOficio } from './helpers/oficio';
import {
  POLITICA_DEVOLUCION,
  aboutContent,
  bannerSvg,
  brandClaim,
  contactConfig,
  descripcionTienda,
  productoSvg,
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
      // El teléfono es único en auth.users: si se repite, la API responde 409.
      whatsapp: `+573${String(sello).slice(-9)}`,
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
  // No se llama `banner`: ese nombre ya es la función de cabecera de config.
  const bannerSubido = await intentar('POST /file-upload/image (banner)', async () => {
    const form = new FormData();
    form.append('file', new Blob([bannerSvg(datos.marca, oficio.craft, datos.municipio)], { type: 'image/svg+xml' }), 'ensayo-banner.svg');
    form.append('folder', 'hero');
    const res = await fetch(`${API_BASE}/file-upload/image`, { method: 'POST', body: form });
    if (!res.ok) throw new ApiError('file-upload banner', res.status, (await res.text()).slice(0, 300));
    return res.json() as Promise<{ url: string }>;
  });

  if (logo?.url || bannerSubido?.url) {
    await intentar('PATCH /artisan-shops/:id (logo y banner)', () =>
      pedir(
        'PATCH',
        `/artisan-shops/${shop.id}`,
        {
          ...(logo?.url ? { logoUrl: logo.url } : {}),
          ...(bannerSubido?.url
            ? {
                bannerUrl: bannerSubido.url,
                heroConfig: {
                  slides: [{ imageUrl: bannerSubido.url, title: datos.marca, subtitle: brandClaim(datos) }],
                  autoplay: true,
                  duration: 5000,
                },
              }
            : {}),
        },
        token,
      ),
    );
  }

  // 8 · producto con stock 0, con la ficha completa que va a producción
  const prod = productoPlaceholder(datos);

  const imgProd = await intentar('POST /file-upload/image (foto de producto)', async () => {
    const form = new FormData();
    form.append('file', new Blob([productoSvg(datos.marca, oficio.pieza)], { type: 'image/svg+xml' }), 'ensayo-producto.svg');
    form.append('folder', 'products');
    const res = await fetch(`${API_BASE}/file-upload/image`, { method: 'POST', body: form });
    if (!res.ok) throw new ApiError('file-upload producto', res.status, (await res.text()).slice(0, 300));
    return res.json() as Promise<{ url: string }>;
  });

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
        subcategoryId: oficio.subcategoryId,
        artisanalIdentity: {
          primaryCraftId: oficio.craftId,
          primaryTechniqueId: oficio.primaryTechniqueId,
          pieceType: 'funcional',
          style: 'tradicional',
          styles: ['tradicional'],
          processType: 'manual',
          isCollaboration: false,
          estimatedElaborationTime: prod.estimatedElaborationTime,
        },
        physicalSpecs: prod.physicalSpecs,
        logistics: prod.logistics,
        production: prod.production,
        media: imgProd?.url ? [{ mediaUrl: imgProd.url, mediaType: 'image', isPrimary: true, displayOrder: 0 }] : [],
        materials: oficio.materialIds.map((materialId, i) => ({ materialId, isPrimary: i === 0 })),
        variants: [
          {
            stockQuantity: 0,
            minStock: 0,
            basePriceMinor: String(prod.precioCop * 100),
            currency: 'COP',
            isActive: true,
            imageUrl: imgProd?.url,
            realWeightKg: prod.physicalSpecs.realWeightKg,
          },
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
    if (pd) {
      console.log(`      status=${pd.status} · stock=${pd.variants?.[0]?.stockQuantity}`);

      // La ficha tiene que llegar completa: un producto con sólo texto se ve
      // a medias en el marketplace, que muestra medidas, peso, materiales e imagen.
      // Sólo se exige lo que este oficio puede tener: "Bebidas ancestrales" no
      // tiene subcategorías, y el catálogo no tiene un material para el viche.
      const comprobaciones: Array<[string, boolean]> = [
        ['imagen', (pd.media ?? []).length > 0],
        ['medidas', !!pd.physicalSpecs?.heightCm],
        ['peso', !!pd.physicalSpecs?.realWeightKg],
        ['logística', !!pd.logistics?.packWeightKg],
        ['tiempo de producción', !!pd.production?.productionTimeDays],
        ['descripción del proceso', !!pd.production?.processDescription],
        ['SKU', !!pd.variants?.[0]?.sku],
        // La técnica sólo se exige si este entorno la tiene en su catálogo:
        // staging va por detrás de producción (90 técnicas contra 104) y no
        // tiene la de Viche, así que ahí faltaría por el entorno, no por el script.
        ...(oficio.primaryTechniqueId
          ? ([['técnica', !!pd.artisanalIdentity?.primaryTechniqueId]] as Array<[string, boolean]>)
          : []),
        ...(oficio.materialIds.length ? ([['materiales', (pd.materials ?? []).length > 0]] as Array<[string, boolean]>) : []),
        ...(oficio.subcategoryId ? ([['subcategoría', !!pd.subcategoryId]] as Array<[string, boolean]>) : []),
      ];
      const faltan = comprobaciones.filter(([, ok]) => !ok).map(([k]) => k);
      pasos.push({
        paso: 'la ficha del producto llega completa',
        ok: faltan.length === 0,
        detalle: faltan.length ? `faltan: ${faltan.join(', ')}` : 'todos los campos presentes',
      });
      console.log(
        faltan.length ? `  ✗ ficha incompleta, faltan: ${faltan.join(', ')}` : '  ✓ ficha del producto completa',
      );
    }
  }

  // Imágenes de la tienda
  if (final) {
    const f = (final as any).data ?? final;
    const conBanner = !!f.bannerUrl && (f.heroConfig?.slides ?? []).length > 0;
    pasos.push({ paso: 'la tienda tiene logo y banner', ok: !!f.logoUrl && conBanner, detalle: `logo=${!!f.logoUrl} banner=${conBanner}` });
    console.log(`  ${!!f.logoUrl && conBanner ? '✓' : '✗'} tienda con logo=${!!f.logoUrl} banner=${conBanner}`);
  }

  // ─────────── segunda fase: la ruta de COMPLETAR ───────────
  // Crear desde cero y completar una tienda existente son códigos distintos.
  // Esta fase ejercita el segundo: una tienda a medias, con un campo ya escrito
  // por el "artesano", para comprobar que el parche rellena huecos y no pisa nada.
  console.log('\n── Fase 2: completar una tienda existente ──\n');

  const historiaPropia = 'HISTORIA ESCRITA POR EL ARTESANO — no se debe sobrescribir.';

  // Hace falta un segundo usuario: `create()` rechaza con 409 si el usuario ya
  // tiene tienda, así que no se puede reutilizar el de la fase 1.
  const email2 = `cocrea-ensayo-b-${sello}@example.com`;
  const reg2 = await intentar('POST /auth/register (segundo artesano)', () =>
    pedir<{ userId: string }>('POST', '/auth/register', {
      idTypeId: cat.idTypeCcId,
      idNumber: String(9900000000 + ((sello + 7) % 100000)),
      firstName: 'Artesano',
      lastName: 'A Medias',
      agreementId: agreement.id,
      email: email2,
      password: DEFAULT_PASSWORD,
      passwordConfirmation: DEFAULT_PASSWORD,
      whatsapp: `+573${String(sello + 1).slice(-9)}`,
      countryId: cat.countryId,
      department: territorio.department,
      city: territorio.city,
      daneCity: territorio.daneCity,
      hasRUT: false,
      acceptTerms: true,
      newsletterOptIn: false,
    }),
  );

  const media = reg2
    ? await intentar('POST /artisan-shops (tienda a medias)', () =>
        pedir<{ id: string }>(
          'POST',
          '/artisan-shops',
          {
            userId: reg2.userId,
            shopName: `Ensayo Completar ${sello}`,
            shopSlug: `ensayo-completar-${sello}`,
            story: historiaPropia,
          },
          token,
        ),
      )
    : null;

  if (media) {
    const antes = await intentar('GET /artisan-shops/:id (estado inicial)', () =>
      pedir<Record<string, any>>('GET', `/artisan-shops/${media.id}`),
    );
    const shopAntes = ((antes as any)?.data ?? antes) as ShopProd;

    const contenido = {
      description: descripcionTienda(datos),
      story: historiaTienda(datos),
      brandClaim: brandClaim(datos),
      craftType: oficio.craft,
      department: datos.departamento,
      municipality: datos.municipio,
      aboutContent: aboutContent(datos),
      contactConfig: contactConfig(datos, ''),
      artisanProfile: perfilArtesanal(datos, new Date(sello).toISOString()),
    };

    const parche = parcheDeCompletitud(shopAntes, contenido);
    console.log(`      campos a rellenar: ${Object.keys(parche).join(', ') || '(ninguno)'}`);

    if ('story' in parche) {
      pasos.push({ paso: 'el parche respeta la historia del artesano', ok: false, detalle: 'iba a sobrescribir `story`' });
      console.log('  ✗ el parche iba a sobrescribir la historia que ya existía');
    } else {
      pasos.push({ paso: 'el parche respeta la historia del artesano', ok: true, detalle: 'story no se toca' });
      console.log('  ✓ el parche respeta la historia que ya existía');
    }

    await intentar('PATCH /artisan-shops/:id (completar huecos)', () =>
      pedir('PATCH', `/artisan-shops/${media.id}`, parche, token),
    );

    const despues = await intentar('GET /artisan-shops/:id (verificación)', () =>
      pedir<Record<string, any>>('GET', `/artisan-shops/${media.id}`),
    );
    const d = (despues as any)?.data ?? despues;
    if (d) {
      const intacta = d.story === historiaPropia;
      console.log(`      historia original intacta: ${intacta ? 'sí' : 'NO'} · perfilCompleto=${d.artisanProfileCompleted} · claim=${!!d.brandClaim}`);
      pasos.push({
        paso: 'la historia original sigue intacta tras el PATCH',
        ok: intacta,
        detalle: intacta ? 'ok' : `quedó: ${String(d.story).slice(0, 80)}`,
      });
    }

    // Reejecutar el parche sobre la tienda ya completa no debe proponer nada:
    // eso es la idempotencia a nivel de campo.
    const segundaVuelta = parcheDeCompletitud((d ?? {}) as ShopProd, contenido);
    const vacio = Object.keys(segundaVuelta).length === 0;
    pasos.push({
      paso: 'segunda pasada no propone cambios (idempotente)',
      ok: vacio,
      detalle: vacio ? 'ok' : `propondría: ${Object.keys(segundaVuelta).join(', ')}`,
    });
    console.log(`  ${vacio ? '✓' : '✗'} segunda pasada ${vacio ? 'no propone nada' : 'propondría: ' + Object.keys(segundaVuelta).join(', ')}`);
  }

  console.log(`\n  Datos de prueba creados en ${TARGET}: usuario ${email}, tiendas ${shop.id}${media ? ' y ' + media.id : ''}`);
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
