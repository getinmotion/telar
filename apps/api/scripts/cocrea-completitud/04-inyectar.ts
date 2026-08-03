/**
 * Fase 4 — Aplica el contenido sobre la plataforma.
 *
 * Por defecto NO escribe: hay que pasar `--apply` explícitamente. En dry-run
 * recorre todo, resuelve cada paso y reporta cuántos registros tocaría.
 *
 *   COCREA_TARGET=prod npx ts-node 04-inyectar.ts            # dry-run
 *   COCREA_TARGET=prod npx ts-node 04-inyectar.ts --apply    # escribe de verdad
 *   ... --apply --limite 10                                  # por lotes
 *   ... --solo-completar   |   --solo-crear
 *
 * Es reentrante: el ledger (state/ledger.json) registra cada paso cumplido, así
 * que volver a correrlo retoma donde quedó en vez de duplicar.
 *
 * Lo que NUNCA toca: las tiendas que ya cumplen la meta, cualquier campo que ya
 * tenga contenido, y los datos bancarios.
 */
import * as fs from 'fs';
import { AGREEMENT_ID, DEFAULT_PASSWORD, DRY_RUN, TARGET, banner, ensureDirs, stateFile } from './config';
import { ApiError, ShopProd, escrituras, get, getTiendasConvenio, setToken, write } from './helpers/api';
import { Ledger, Paso } from './helpers/ledger';
import { conContenido, aboutTieneContenido, contactoTieneContenido } from './helpers/estado';

const arg = (nombre: string): string | undefined => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (nombre: string) => process.argv.includes(`--${nombre}`);

const LIMITE = Number(arg('limite') ?? Infinity);
const SOLO_CREAR = flag('solo-crear');
const SOLO_COMPLETAR = flag('solo-completar');

/** Precio del producto placeholder, en pesos. Con stock 0 no se puede comprar. */
const PRECIO_COP = 80000;

interface Contenido {
  crear: any[];
  completar: any[];
}

const ledger = new Ledger();
const resumen: Record<string, number> = {};
const cuenta = (k: string) => (resumen[k] = (resumen[k] || 0) + 1);

async function main() {
  banner('Fase 4 · Inyección');
  ensureDirs();

  if (!DRY_RUN && TARGET === 'prod') {
    console.log('⚠️  Vas a ESCRIBIR EN PRODUCCIÓN.\n');
  }

  const ruta = stateFile('contenido.json');
  if (!fs.existsSync(ruta)) throw new Error('Falta state/contenido.json. Corre antes: npx ts-node 03-contenido.ts');
  const contenido = JSON.parse(fs.readFileSync(ruta, 'utf8')) as Contenido;

  const shops = await getTiendasConvenio();
  const porId = new Map(shops.map((s) => [s.id, s]));

  if (!SOLO_CREAR) {
    const lote = contenido.completar.slice(0, LIMITE);
    console.log(`── Completando ${lote.length} tiendas existentes ──\n`);
    for (const item of lote) {
      const shop = porId.get(item.shopId);
      if (!shop) {
        console.log(`  ⚠️  ${item.shopNameActual}: ya no está en el convenio, se omite`);
        continue;
      }
      await completarTienda(shop, item);
    }
  }

  if (!SOLO_COMPLETAR) {
    const lote = contenido.crear.slice(0, LIMITE);
    console.log(`\n── Creando ${lote.length} cuentas nuevas ──\n`);
    for (const item of lote) {
      await crearArtesano(item);
    }
  }

  ledger.guardar();

  console.log('\n' + '─'.repeat(64));
  console.log(DRY_RUN ? 'DRY-RUN · nada se escribió' : 'APLICADO');
  console.log('─'.repeat(64));
  Object.entries(resumen)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

  if (DRY_RUN) {
    console.log(`\n  ${escrituras.length} peticiones de escritura se habrían enviado.`);
    const porRuta = escrituras.reduce<Record<string, number>>((a, e) => {
      const clave = `${e.method} ${e.ruta.replace(/[0-9a-f-]{36}/gi, ':id')}`;
      a[clave] = (a[clave] || 0) + 1;
      return a;
    }, {});
    Object.entries(porRuta)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`     ${String(v).padStart(4)}  ${k}`));
    console.log('\n  Para aplicarlo: añade --apply');
  }
  console.log(`\n  Ledger: ${stateFile('ledger.json')}`);
}

// ─────────────────────── completar tiendas existentes ───────────────────────

async function completarTienda(shop: ShopProd, item: any) {
  const email = shop.user?.email ?? shop.id;
  const t = item.tienda;

  // Sólo se rellena lo que está vacío: lo que el artesano ya escribió no se toca.
  const parche: Record<string, unknown> = {};
  if (!conContenido(shop.description)) parche.description = t.description;
  if (!conContenido(shop.story)) parche.story = t.story;
  if (!conContenido(shop.brandClaim)) parche.brandClaim = t.brandClaim;
  if (!conContenido(shop.craftType)) parche.craftType = t.craftType;
  if (!conContenido(shop.department) && t.department) parche.department = t.department;
  if (!conContenido(shop.municipality) && t.municipality) parche.municipality = t.municipality;
  if (!aboutTieneContenido(shop)) parche.aboutContent = t.aboutContent;
  if (!contactoTieneContenido(shop)) parche.contactConfig = t.contactConfig;
  if (!shop.artisanProfileCompleted) {
    // Se conserva lo que el artesano ya hubiera escrito en su perfil.
    parche.artisanProfile = { ...t.artisanProfile, ...(shop.artisanProfile ?? {}) };
    parche.artisanProfileCompleted = true;
  }

  if (Object.keys(parche).length) {
    await write('PATCH', `/artisan-shops/${shop.id}`, parche);
    ledger.marcar(email, 'configTienda', { shopId: shop.id });
    if (parche.artisanProfileCompleted) {
      ledger.marcar(email, 'perfilArtesanal');
      cuenta('perfil artesanal completado');
    }
    cuenta('tienda actualizada');
    console.log(`  ✎ ${shop.shopName}: ${Object.keys(parche).join(', ')}`);
  } else {
    cuenta('tienda sin cambios');
  }

  if (!conContenido(shop.idPoliciesConfig)) await ponerPoliticas(email, shop.id, t.politicas);
  if (!conContenido(shop.logoUrl)) await subirLogo(email, shop.id, t.shopName, t.logoSvg);
  if (item.producto) await crearProducto(email, shop.id, item.producto, item.oficio);
  if (shop.publishStatus !== 'published') await publicar(email, shop.id);
}

// ─────────────────────── crear artesanos nuevos ───────────────────────

async function crearArtesano(item: any) {
  const r = item.registro;
  const email = String(r.email).toLowerCase();

  let userId = ledger.get(email).userId;

  if (!ledger.hecho(email, 'usuario')) {
    const cuerpo = {
      idTypeId: r.idTypeId,
      idNumber: r.idNumber,
      firstName: r.firstName,
      lastName: r.lastName,
      agreementId: AGREEMENT_ID,
      email,
      password: DEFAULT_PASSWORD,
      passwordConfirmation: DEFAULT_PASSWORD,
      whatsapp: r.whatsapp,
      countryId: r.countryId,
      department: r.department,
      city: r.city,
      daneCity: r.daneCity,
      hasRUT: false,
      acceptTerms: true,
      newsletterOptIn: false,
    };
    try {
      const res = await write<{ userId: string }>('POST', '/auth/register', cuerpo);
      userId = res?.userId;
      ledger.marcar(email, 'usuario', { userId, password: DEFAULT_PASSWORD });
      cuenta('usuario creado');
      console.log(`  + ${item.tienda.shopName} <${email}>`);
    } catch (e) {
      // 409 = el correo ya existe. No es un fallo: es la idempotencia funcionando.
      if (e instanceof ApiError && e.status === 409) {
        cuenta('usuario ya existía');
        console.log(`  = ${email} ya existe`);
      } else {
        ledger.error(email, `register: ${(e as Error).message}`);
        cuenta('ERROR al crear usuario');
        console.log(`  ✗ ${email}: ${(e as Error).message}`);
        return;
      }
    }
  }

  // Con el token del propio usuario se firman el resto de escrituras.
  const token = await entrar(email);
  if (!token && !DRY_RUN) {
    ledger.error(email, 'no se pudo iniciar sesión con la cuenta recién creada');
    cuenta('ERROR de login');
    return;
  }

  if (userId && !ledger.hecho(email, 'emailVerificado')) await verificarEmail(email, userId);

  let shopId = ledger.get(email).shopId;
  if (!shopId && !ledger.hecho(email, 'tienda')) {
    const cuerpo = { userId, shopName: item.tienda.shopName, shopSlug: item.tienda.shopSlug };
    try {
      const res = await write<{ id: string }>('POST', '/artisan-shops', cuerpo);
      shopId = res?.id;
      ledger.marcar(email, 'tienda', { shopId, shopSlug: item.tienda.shopSlug });
      cuenta('tienda creada');
    } catch (e) {
      // 409 = slug tomado, o el usuario ya tenía tienda.
      if (e instanceof ApiError && e.status === 409) {
        cuenta('tienda ya existía');
      } else {
        ledger.error(email, `artisan-shops: ${(e as Error).message}`);
        cuenta('ERROR al crear tienda');
        return;
      }
    }
  }

  if (!shopId && !DRY_RUN) return;

  const t = item.tienda;
  await write('PATCH', `/artisan-shops/${shopId ?? ':pendiente'}`, {
    description: t.description,
    story: t.story,
    brandClaim: t.brandClaim,
    craftType: t.craftType,
    department: t.department,
    municipality: t.municipality,
    aboutContent: t.aboutContent,
    contactConfig: t.contactConfig,
    artisanProfile: t.artisanProfile,
    artisanProfileCompleted: true,
  });
  ledger.marcar(email, 'configTienda');
  ledger.marcar(email, 'perfilArtesanal');
  cuenta('tienda configurada');

  await ponerPoliticas(email, shopId ?? ':pendiente', t.politicas);
  await subirLogo(email, shopId ?? ':pendiente', t.shopName, t.logoSvg);
  await crearProducto(email, shopId ?? ':pendiente', item.producto, item.oficio);
  await publicar(email, shopId ?? ':pendiente');

  setToken(null);
}

/** Inicia sesión como el artesano. El login no exige el correo verificado. */
async function entrar(email: string): Promise<string | null> {
  if (DRY_RUN) return 'dry-run';
  try {
    const res = await write<{ accessToken?: string; access_token?: string; token?: string }>('POST', '/auth/login', {
      email,
      password: DEFAULT_PASSWORD,
    });
    const token = res?.accessToken ?? res?.access_token ?? res?.token ?? null;
    setToken(token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Deja el correo verificado sin que el artesano tenga que hacer nada: genera un
 * token y lo consume en el acto. El correo de alta sale igual — eso lo dispara
 * el propio registro y no se puede evitar por API.
 */
async function verificarEmail(email: string, userId: string) {
  try {
    const res = await write<{ token: string }>('POST', `/email-verifications/generate/${userId}`, {});
    if (res?.token) await write('POST', `/email-verifications/verify/${res.token}`, {});
    ledger.marcar(email, 'emailVerificado');
    cuenta('correo verificado');
  } catch (e) {
    ledger.error(email, `verificación de correo: ${(e as Error).message}`);
    cuenta('correo sin verificar');
  }
}

async function ponerPoliticas(email: string, shopId: string, politicas: { returnPolicy: string; faq: any[] }) {
  if (ledger.hecho(email, 'politicas')) return;
  try {
    const res = await write<{ id: string }>('POST', '/store-policies-config', politicas);
    // La tienda apunta a la configuración por FK; sin este PATCH no se ve.
    await write('PATCH', `/artisan-shops/${shopId}`, { idPoliciesConfig: res?.id ?? ':pendiente' });
    ledger.marcar(email, 'politicas', { policiesId: res?.id });
    cuenta('políticas y FAQ');
  } catch (e) {
    ledger.error(email, `políticas: ${(e as Error).message}`);
    cuenta('ERROR en políticas');
  }
}

async function subirLogo(email: string, shopId: string, marca: string, svg: string) {
  if (ledger.hecho(email, 'logo')) return;
  try {
    let url = `svg-generado://${marca}`;
    if (!DRY_RUN) {
      const form = new FormData();
      form.append('file', new Blob([svg], { type: 'image/svg+xml' }), `${shopId}.svg`);
      form.append('folder', 'shops');
      const res = await subirArchivo(form);
      url = res.url;
    }
    await write('PATCH', `/artisan-shops/${shopId}`, { logoUrl: url });
    ledger.marcar(email, 'logo', { logoUrl: url });
    cuenta('logo');
  } catch (e) {
    ledger.error(email, `logo: ${(e as Error).message}`);
    cuenta('ERROR en logo');
  }
}

/** El endpoint de subida es multipart, así que no pasa por el cliente JSON. */
async function subirArchivo(form: FormData): Promise<{ url: string }> {
  const { API_BASE } = await import('./config');
  const res = await fetch(`${API_BASE}/file-upload/image`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`file-upload -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function crearProducto(email: string, shopId: string, producto: any, oficio: any) {
  if (!producto || ledger.hecho(email, 'producto')) return;
  try {
    const cuerpo = {
      storeId: shopId,
      name: producto.name,
      shortDescription: producto.shortDescription,
      history: producto.history,
      careNotes: producto.careNotes,
      usageSuggestions: producto.usageSuggestions,
      categoryId: oficio.categoryId,
      artisanalIdentity: {
        primaryCraftId: oficio.craftId,
        pieceType: 'funcional',
        style: 'tradicional',
        processType: 'manual',
      },
      // `production` sin availabilityType da 400.
      production: { availabilityType: 'bajo_pedido' },
      variants: [
        {
          // Stock 0: la pieza es representativa, no está a la venta.
          stockQuantity: 0,
          minStock: 0,
          basePriceMinor: String(PRECIO_COP * 100),
          currency: 'COP',
          isActive: true,
        },
      ],
      status: 'pending_moderation',
    };
    const res = await write<{ id: string }>('POST', '/products-new', cuerpo);
    ledger.marcar(email, 'producto', { productId: res?.id });
    cuenta('producto creado');

    await write('PATCH', `/products-new/${res?.id ?? ':pendiente'}/status`, { status: 'approved' });
    ledger.marcar(email, 'productoAprobado');
    cuenta('producto aprobado');
  } catch (e) {
    ledger.error(email, `producto: ${(e as Error).message}`);
    cuenta('ERROR en producto');
  }
}

async function publicar(email: string, shopId: string) {
  if (ledger.hecho(email, 'publicada')) return;
  try {
    await write('PATCH', `/artisan-shops/${shopId}`, { publishStatus: 'published', active: true });
    ledger.marcar(email, 'publicada');
    cuenta('tienda publicada');
  } catch (e) {
    ledger.error(email, `publicar: ${(e as Error).message}`);
    cuenta('ERROR al publicar');
  }
}

main().catch((e) => {
  ledger.guardar();
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
