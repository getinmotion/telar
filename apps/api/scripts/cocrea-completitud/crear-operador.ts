/**
 * Crea la cuenta operador que firma las escrituras sobre tiendas ajenas.
 *
 * Completar una tienda que ya existe exige un JWT (`PATCH /artisan-shops/:id`,
 * `POST /store-policies-config`) y no tenemos la contraseña de los artesanos ya
 * registrados. Esta cuenta existe para que esas escrituras queden a nombre de
 * algo identificable en vez del token de un artesano recién creado.
 *
 * Deliberadamente NO se registra en CO-CREA: es una cuenta operativa, no un
 * artesano, y sumaría un perfil al padrón del convenio que estamos midiendo.
 * Tampoco se le crea tienda, así que no altera el conteo de tiendas.
 *
 *   COCREA_TARGET=prod npx ts-node crear-operador.ts --apply
 */
import { API_BASE, DRY_RUN, OPERADOR_EMAIL, OPERADOR_PASSWORD, TARGET, banner } from './config';
import { ApiError, get } from './helpers/api';
import { cargarCatalogos, resolverTerritorio } from './helpers/catalogos';

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
  banner('Cuenta operador');

  if (!OPERADOR_EMAIL || !OPERADOR_PASSWORD) {
    throw new Error(
      'Faltan COCREA_OPERADOR_EMAIL y COCREA_OPERADOR_PASSWORD.\n' +
        'Ponlos en apps/api/scripts/cocrea-completitud/.env (no se versiona).',
    );
  }

  console.log(`Cuenta: ${OPERADOR_EMAIL}`);
  console.log(`Entorno: ${TARGET}\n`);

  // ¿Ya existe? Si entra, no hay nada que hacer.
  try {
    const login = await pedir<Record<string, any>>('POST', '/auth/login', {
      email: OPERADOR_EMAIL,
      password: OPERADOR_PASSWORD,
    });
    const token = login?.accessToken ?? login?.access_token ?? login?.token ?? null;
    if (token) {
      console.log('✓ La cuenta ya existe y las credenciales funcionan. No hay nada que crear.');
      return;
    }
  } catch {
    // No existe o la contraseña no coincide: seguimos al registro.
  }

  if (DRY_RUN) {
    console.log('DRY-RUN: la cuenta no existe (o no entra). Añade --apply para crearla.');
    return;
  }

  const cat = await cargarCatalogos();
  const agreements = await get<Array<{ id: string; name: string }>>('/agreements');
  // Cualquiera menos CO-CREA; si sólo existiera ése, se usa el que haya.
  const convenio = agreements.find((a) => !/co-?crea/i.test(a.name)) ?? agreements[0];
  const territorio = resolverTerritorio(cat, 'Bogotá')!;

  console.log(`Convenio: ${convenio.name} (a propósito, no CO-CREA)`);

  const reg = await pedir<{ userId: string }>('POST', '/auth/register', {
    idTypeId: cat.idTypeCcId,
    idNumber: '9900000000',
    firstName: 'Operador',
    lastName: 'Telar',
    agreementId: convenio.id,
    email: OPERADOR_EMAIL,
    password: OPERADOR_PASSWORD,
    passwordConfirmation: OPERADOR_PASSWORD,
    whatsapp: '+573900000000',
    countryId: cat.countryId,
    department: territorio.department,
    city: territorio.city,
    daneCity: territorio.daneCity,
    hasRUT: false,
    acceptTerms: true,
    newsletterOptIn: false,
  });
  console.log(`✓ Cuenta creada (userId ${reg.userId})`);

  const login = await pedir<Record<string, any>>('POST', '/auth/login', {
    email: OPERADOR_EMAIL,
    password: OPERADOR_PASSWORD,
  });
  const token = login?.accessToken ?? login?.access_token ?? login?.token ?? null;
  console.log(token ? '✓ Login correcto' : '✗ No se pudo iniciar sesión');

  if (token) {
    const t = await pedir<{ token: string }>('POST', `/email-verifications/generate/${reg.userId}`, {}, token);
    if (t?.token) {
      await pedir('POST', `/email-verifications/verify/${t.token}`, {});
      console.log('✓ Correo verificado');
    }
  }

  console.log('\nNo se le crea tienda: no debe aparecer como taller del convenio.');
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
