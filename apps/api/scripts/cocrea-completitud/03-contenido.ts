/**
 * Fase 3 — Arma el contenido de cada tienda, sin escribir nada en la plataforma.
 *
 * Se separa de la inyección a propósito: el resultado es revisable antes de que
 * nada toque producción, y es determinista (mismo insumo -> mismo texto), que es
 * lo que permite reintentar la inyección sin generar contenido distinto.
 *
 * Lee   state/plan.json   (lo produce 02-cruce.ts)
 * Escribe state/contenido.json  y  docs/cocrea/03-contenido.md
 *
 *   COCREA_TARGET=prod npx ts-node 03-contenido.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { DOCS_DIR, TARGET, banner, ensureDirs, stateFile } from './config';
import { getTiendasConvenio } from './helpers/api';
import { cargarCatalogos, resolverTerritorio } from './helpers/catalogos';
import { inferirOficio, resolverOficio } from './helpers/oficio';
import {
  DatosArtesano,
  POLITICA_DEVOLUCION,
  aboutContent,
  brandClaim,
  contactConfig,
  descripcionTienda,
  faq,
  historiaTienda,
  logoSvg,
  marcaSugerida,
  perfilArtesanal,
  productoPlaceholder,
  slugDeMarca,
} from './helpers/contenido';
import { capitalizar, sinTildes, tieneEmail } from './helpers/normalize';

/** Documento y teléfono sintéticos para quien no los tiene. Rango reservado y reconocible. */
const CEDULA_BASE = 9900000000;
/** 39xxxxxxxx no es un prefijo móvil real en Colombia: no puede colisionar con nadie. */
const TELEFONO_BASE = 3900000000;

const FECHA = '2026-08-02T00:00:00.000Z';

interface PlanPersona {
  nombre: string;
  email: string;
  emailEsAlias: boolean;
  marca: string;
  telefono: string;
  cedulaExcel: string;
  cedulaUsable: boolean;
  municipio: string;
  origen: string;
  hoja: number;
}

/** Móvil colombiano válido para `RegisterDto`: +57 seguido de 10 dígitos que empiezan por 3. */
const movilValido = (crudo: string): string | null => {
  const d = (crudo || '').replace(/\D/g, '').replace(/^57/, '');
  return /^3\d{9}$/.test(d) ? `+57${d}` : null;
};

interface PlanTienda {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  email: string | null;
  faltantes: string[];
  excel: { nombre: string; marca: string; municipio: string; origen: string; hoja: number } | null;
}

async function main() {
  banner('Fase 3 · Generación de contenido');
  ensureDirs();

  const planPath = stateFile('plan.json');
  if (!fs.existsSync(planPath)) {
    throw new Error('Falta state/plan.json. Corre antes: npx ts-node 02-cruce.ts');
  }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {
    crear: PlanPersona[];
    completar: PlanTienda[];
  };

  const cat = await cargarCatalogos();
  const shops = await getTiendasConvenio();
  const nombresTomados = new Set(shops.map((s) => sinTildes(s.shopName).trim()));
  const slugsTomados = new Set(shops.map((s) => s.shopSlug));

  const sinTerritorio: string[] = [];
  /** Territorios donde sólo se reconoció el departamento y se usó su capital. */
  const territorioAproximado: string[] = [];

  /** Construye los datos base comunes a crear y completar. */
  const armarDatos = (
    nombre: string,
    marcaDeclarada: string,
    municipioTexto: string,
    origen: string,
    señalesExtra: string[],
  ): DatosArtesano => {
    const oficio = resolverOficio(cat, inferirOficio(marcaDeclarada, origen, ...señalesExtra));
    // El municipio va como texto principal y el origen sólo como contexto: así
    // "Escuela Taller de Boyacá" no arrastra a alguien que vive en Bogotá.
    const territorio = resolverTerritorio(cat, municipioTexto, origen);
    if (!territorio) sinTerritorio.push(nombre);
    else if (territorio.aproximado) territorioAproximado.push(`${nombre} · "${municipioTexto}" → ${territorio.city}`);

    let marca = marcaDeclarada.trim();
    // Hay marcas que en el Excel vienen como frase ("Emprendimiento en macrame,
    // mi marca se llama kanuto design macrame"): en ese caso no sirven como nombre.
    if (!marca || marca.length > 60) {
      marca = marcaSugerida(nombre, territorio?.city ?? municipioTexto, oficio);
    }
    // El nombre de marca tiene que ser único entre tiendas.
    let candidata = marca;
    let intento = 1;
    while (nombresTomados.has(sinTildes(candidata).trim())) {
      candidata = `${marca} · ${capitalizar(nombre.split(/\s+/).slice(-1)[0])}${intento > 1 ? ` ${intento}` : ''}`;
      intento++;
    }
    nombresTomados.add(sinTildes(candidata).trim());

    return {
      nombre,
      marca: candidata,
      municipio: territorio?.city ?? '',
      departamento: territorio?.department ?? '',
      origen,
      oficio,
    };
  };

  const slugLibre = (marca: string): string => {
    let i = 0;
    let s = slugDeMarca(marca, i);
    while (slugsTomados.has(s)) s = slugDeMarca(marca, ++i);
    slugsTomados.add(s);
    return s;
  };

  // ─────────── cuentas nuevas ───────────
  // `auth.users` exige teléfono único: si dos personas del padrón comparten
  // número —pasa entre socios de un mismo taller— la segunda recibe un 409.
  const telefonosUsados = new Set<string>();

  const crear = plan.crear.map((p, i) => {
    const d = armarDatos(p.nombre, p.marca, p.municipio, p.origen, []);
    const partes = p.nombre.trim().split(/\s+/);
    const cedula = p.cedulaUsable ? p.cedulaExcel.trim() : String(CEDULA_BASE + i + 1);

    const real = movilValido(p.telefono);
    const sintetico = `+57${TELEFONO_BASE + i + 1}`;
    const telefono = real && !telefonosUsados.has(real) ? real : sintetico;
    telefonosUsados.add(telefono);

    return {
      registro: {
        email: p.email,
        emailEsAlias: p.emailEsAlias,
        password: 'placeholder',
        firstName: capitalizar(partes[0] || 'Artesano'),
        lastName: capitalizar(partes.slice(1).join(' ') || partes[0] || 'Artesano'),
        idTypeId: cat.idTypeCcId,
        idNumber: cedula,
        cedulaSintetica: !p.cedulaUsable,
        countryId: cat.countryId,
        department: d.departamento,
        city: d.municipio,
        daneCity: resolverTerritorio(cat, p.municipio, p.origen)?.daneCity ?? null,
        whatsapp: telefono,
        telefonoSintetico: telefono === sintetico,
        /** Respaldo si el número real ya está tomado por otra cuenta en la BD. */
        whatsappAlterno: sintetico,
      },
      tienda: contenidoTienda(d),
      producto: productoPlaceholder(d),
      oficio: { craft: d.oficio.craft, categoria: d.oficio.categoria, craftId: d.oficio.craftId, categoryId: d.oficio.categoryId },
    };
  });

  // ─────────── tiendas existentes ───────────
  const completar = plan.completar.map((t) => {
    const shop = shops.find((s) => s.id === t.id)!;
    const d = armarDatosDesdeTienda(t, shop);
    return {
      shopId: t.id,
      userId: t.userId,
      shopNameActual: t.shopName,
      faltantes: t.faltantes,
      // Se genera todo, pero la inyección sólo aplicará lo que esté vacío.
      tienda: contenidoTienda(d),
      producto: t.faltantes.includes('producto') ? productoPlaceholder(d) : null,
      oficio: { craft: d.oficio.craft, categoria: d.oficio.categoria, craftId: d.oficio.craftId, categoryId: d.oficio.categoryId },
    };
  });

  function armarDatosDesdeTienda(t: PlanTienda, shop: (typeof shops)[number]): DatosArtesano {
    // La tienda ya existe: su nombre manda, y su descripción/historia son la mejor
    // señal del oficio (mejor que el Excel, que no lo trae).
    const oficio = resolverOficio(
      cat,
      inferirOficio(shop.shopName, shop.description, shop.story, shop.craftType, t.excel?.marca, t.excel?.origen),
    );
    const territorio = resolverTerritorio(
      cat,
      `${t.excel?.municipio ?? ''} ${shop.municipality ?? ''} ${shop.region ?? ''}`,
      t.excel?.origen ?? '',
    );
    return {
      nombre: t.excel?.nombre ?? shop.shopName,
      marca: shop.shopName.trim(),
      municipio: territorio?.city ?? shop.municipality ?? '',
      departamento: territorio?.department ?? shop.department ?? '',
      origen: t.excel?.origen ?? '',
      oficio,
    };
  }

  function contenidoTienda(d: DatosArtesano) {
    return {
      shopName: d.marca,
      shopSlug: slugLibre(d.marca),
      description: descripcionTienda(d),
      story: historiaTienda(d),
      brandClaim: brandClaim(d),
      department: d.departamento,
      municipality: d.municipio,
      craftType: d.oficio.craft,
      aboutContent: aboutContent(d),
      contactConfig: contactConfig(d, ''),
      artisanProfile: perfilArtesanal(d, FECHA),
      politicas: { returnPolicy: POLITICA_DEVOLUCION, faq: faq(d) },
      logoSvg: logoSvg(d.marca),
    };
  }

  fs.writeFileSync(
    stateFile('contenido.json'),
    JSON.stringify({ generado: new Date().toISOString(), target: TARGET, crear, completar }, null, 1),
    'utf8',
  );

  // ─────────── reporte agregado ───────────
  const porOficio = [...crear, ...completar].reduce<Record<string, number>>((acc, x) => {
    acc[x.oficio.craft] = (acc[x.oficio.craft] || 0) + 1;
    return acc;
  }, {});
  const sinCategoria = [...crear, ...completar].filter((x) => !x.oficio.categoryId).length;
  const sinCraft = [...crear, ...completar].filter((x) => !x.oficio.craftId).length;

  const md = `# CO-CREA · Contenido generado

Generado por \`apps/api/scripts/cocrea-completitud/03-contenido.ts\` contra **${TARGET}**.

Contenido para **${crear.length}** tiendas nuevas y **${completar.length}** por completar.
El texto de cada tienda vive en \`state/contenido.json\`, que no se versiona.

## Cómo se genera

No hay información real de cada artesano más allá del oficio y el territorio, así que el
texto se arma con variantes elegidas de forma **determinista** a partir del nombre de la
persona. Dos artesanos reciben textos distintos, y volver a correr el script produce
exactamente lo mismo — eso es lo que permite reintentar la inyección sin que el contenido
cambie por debajo.

El oficio se infiere del nombre del taller, la Escuela Taller de origen y —cuando la tienda
ya existe— de lo que el artesano escribió en su descripción o su historia.

## Oficio inferido

| Oficio | Tiendas |
|---|---:|
${Object.entries(porOficio)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

${sinCraft || sinCategoria ? `⚠️ Sin resolver contra la taxonomía: ${sinCraft} oficios, ${sinCategoria} categorías.` : '✅ Todos los oficios y categorías resuelven contra la taxonomía real.'}
${sinTerritorio.length ? `\n⚠️ **${sinTerritorio.length} personas sin territorio resoluble** contra el catálogo DANE. Sin \`daneCity\` el registro falla, así que hay que revisarlas a mano (\`state/contenido.json\`).` : '\n✅ Todos los territorios resuelven contra el catálogo DANE.'}

### Territorios aproximados

${
  territorioAproximado.length
    ? `En ${territorioAproximado.length} casos el Excel trae el municipio mal escrito o uno que no está en el catálogo DANE. Se reconoció el **departamento** y se usó su capital, que es lo más cercano que se puede afirmar:

${territorioAproximado.map((t) => `- ${t}`).join('\n')}

Hay que corregirlos a mano cuando el equipo confirme el municipio real.`
    : '_Ninguno._'
}

Resolver el territorio no es una búsqueda de texto ingenua. Dos trampas costaron una corrección cada una:
la coincidencia por subcadena hacía que "depar**tame**nto" resolviera a *Tame (Arauca)* y "Por**tado**res" a
*Tadó (Chocó)*; y varios municipios se llaman igual que un departamento ajeno, así que "Mompós, Bolívar"
caía en *Bolívar (Cauca)* y "Tumaco - Nariño" en *Nariño (Antioquia)*.

## Datos sintéticos

| Dato | Cuántos | Valor |
|---|---:|---|
| Cédula | ${crear.filter((c) => c.registro.cedulaSintetica).length} | \`${CEDULA_BASE + 1}\` en adelante |
| Teléfono | ${crear.length} | \`+57${TELEFONO_BASE + 1}\` en adelante |

Ambos rangos son reconocibles a simple vista y no pueden colisionar con datos reales
(\`39\` no es un prefijo móvil válido en Colombia). Quedan listados en \`state/contenido.json\`
para que el equipo los reemplace cuando consiga los datos verdaderos.

## Contenido por tienda

- **Marca**: la declarada en el Excel; si falta o es una frase, se deriva del apellido y el municipio. Se garantiza única contra los nombres de tienda existentes.
- **Identidad artesanal**: oficio, técnica, materiales, aprendizaje, estilo y descripción del taller.
- **Tienda**: descripción, historia, claim, \`aboutContent\` (con \`values\` en forma \`{name, description}\`, que es la que el marketplace renderiza).
- **Devoluciones**: el mismo texto en todas, por decisión del convenio.
- **FAQ**: cuatro preguntas con la misma estructura, con respuestas que nombran la marca y su pieza.
- **Logo**: monograma sobre color de una paleta de ocho, distinto por tienda. Es un SVG — el endpoint de subida acepta \`image/svg+xml\`, así que no hace falta rasterizar.
- **Producto**: una pieza representativa del oficio, con **stock 0**.
`;

  const destino = path.join(DOCS_DIR, '03-contenido.md');
  fs.writeFileSync(destino, md, 'utf8');

  console.log(`Contenido para ${crear.length} tiendas nuevas y ${completar.length} a completar.`);
  console.log(`Oficios: ${Object.entries(porOficio).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  if (sinCraft || sinCategoria) console.log(`⚠️  sin craftId: ${sinCraft} · sin categoryId: ${sinCategoria}`);
  if (sinTerritorio.length) console.log(`⚠️  sin territorio DANE: ${sinTerritorio.length}`);
  console.log(`\nReporte:   ${destino}`);
  console.log(`Contenido: ${stateFile('contenido.json')}`);
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
