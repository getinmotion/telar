/**
 * Fase 2 — Cruza el Excel del convenio con las tiendas que existen en la BD
 * y decide qué hacer con cada persona.
 *
 * Sólo lee. Escribe:
 *   docs/cocrea/02-clasificacion.md   agregados y metodología, sin datos personales
 *   state/plan.json                   el plan por persona (NO se commitea)
 *
 *   COCREA_TARGET=prod npx ts-node 02-cruce.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { AGREEMENT_NAME, DOCS_DIR, TARGET, XLSX_PATH, banner, ensureDirs, stateFile } from './config';
import { getProductosConvenio, getTiendasConvenio } from './helpers/api';
import { parsePersonas } from './helpers/excel';
import { cruzar, inferidos } from './helpers/match';
import { evaluar } from './helpers/estado';
import { aliasPara, detectarDuplicados } from './helpers/personas';
import { tieneEmail } from './helpers/normalize';

const META = 80;

async function main() {
  banner('Fase 2 · Cruce Excel ↔ base de datos');
  ensureDirs();

  const personas = parsePersonas(XLSX_PATH);
  const shops = await getTiendasConvenio();
  const productos = await getProductosConvenio();

  console.log(`Excel: ${personas.length} personas`);
  console.log(`BD:    ${shops.length} tiendas del convenio\n`);

  const cruce = cruzar(personas, shops);
  const aRevisar = inferidos(cruce);
  const duplicados = detectarDuplicados(personas);

  // Las personas duplicadas entre sí sólo generan una cuenta: la que trae correo.
  const idsDuplicadosDescartados = new Set(duplicados.flatMap((d) => d.descartar));
  const aCrear = cruce.sinTienda.filter((p) => !idsDuplicadosDescartados.has(p.nombre + '|' + p.email));

  const conCorreo = aCrear.filter((p) => tieneEmail(p.email));
  const conAlias = aCrear.filter((p) => !tieneEmail(p.email));

  const estados = shops.map((s) => ({ shop: s, estado: evaluar(s, productos) }));
  const yaCumplen = estados.filter((e) => e.estado.cumpleMeta);
  const aCompletar = estados.filter((e) => !e.estado.cumpleMeta);
  const techo = shops.length + aCrear.length;

  // Alias para quien no tiene correo, evitando colisiones entre marcas repetidas.
  const usados = new Map<string, number>();
  const alias = conAlias.map((p) => ({ persona: p, correo: aliasPara(p, usados) }));

  const md = `# CO-CREA · Clasificación

Generado por \`apps/api/scripts/cocrea-completitud/02-cruce.ts\` contra **${TARGET}**.
Fuente: \`${path.basename(XLSX_PATH)}\` (${personas.length} personas) × ${shops.length} tiendas del convenio \`${AGREEMENT_NAME}\`.

Sin datos personales: el plan persona a persona está en \`state/plan.json\`, que no se versiona.

## Qué se hace con cada quien

| Cubeta | Personas | Acción |
|---|---:|---|
| **A · No tocar** | ${yaCumplen.length} | Ya cumplen la meta. No se les modifica ningún campo. |
| **B · Completar** | ${aCompletar.length} | Tienen tienda; se rellenan **sólo los campos vacíos**. |
| **C · Crear** | ${aCrear.length} | No tienen tienda en el convenio; se les crea cuenta, tienda y producto. |
| **D · Revisar a mano** | ${aRevisar.length + duplicados.length} | Emparejamientos inferidos y duplicados del Excel. |

Techo alcanzable: **${techo}** tiendas (${shops.length} existentes + ${aCrear.length} nuevas). Meta: ${META}. ${techo >= META ? '✅ Alcanzable.' : '⚠️ **No alcanza.**'}

## Cómo se emparejó

Emparejar sólo por correo no sirve: ${personas.filter((p) => !tieneEmail(p.email)).length} filas del Excel vienen **sin correo**
(los portadores de Viche) y algunas lo traen con typo. Varias de esas personas **sí** tienen
tienda en la BD, así que emparejar por correo las daría por faltantes y crearía cuentas duplicadas.

Se puntúa cada par (persona, tienda) con cuatro señales y se asignan de mayor a menor puntaje,
de forma global — no fila por fila. Esto importa porque dos personas distintas declaran la misma
marca ("Viche Ulaita") y, resolviendo por orden de aparición, la primera se quedaba con la tienda
de la otra.

| Señal | Peso |
|---|---:|
| Correo idéntico | 100 |
| Correo con la misma raíz (typo) | 80 |
| Solapamiento de marca (incluye \`artisanProfile.artisticName\`) | hasta 40 |
| Nombre de la persona en marca / perfil / correo | 12 por palabra |
| Apellido pegado en la parte local del correo | 10 por apellido |

Resultado: ${cruce.emparejados.length} emparejadas (${cruce.emparejados.length - aRevisar.length} por correo idéntico, ${aRevisar.length} inferidas),
${cruce.sinTienda.length} filas del Excel sin tienda, ${cruce.sinFilaExcel.length} tiendas del convenio que no aparecen en el Excel
(existen y se respetan).

> Buscar la marca también en \`artisanProfile.artisticName\` no es un detalle: hay tiendas cuyo
> \`shopName\` es un placeholder ("Telar") y cuya marca real sólo vive en el perfil. Sin eso,
> esas personas se contaban como faltantes.

## Correos para quien no tiene

${conAlias.length} personas no tienen correo en el Excel. Se les asigna un subdireccionamiento del buzón
real de GET IN MOTION: \`aloha+<marca>@getinmotion.io\`. Llega a un buzón que el equipo controla,
así que la verificación de correo y la recuperación de contraseña funcionan de verdad, y queda
trazado a qué taller corresponde cada uno.

## Advertencias sobre la fuente

- **${personas.filter((p) => /^\\d{1,4}$/.test(p.cedula)).length} filas traen una "cédula" de 3–4 dígitos** (213, 219, 223…). Son índices de fila, no documentos: \`213\` se repite en cuatro personas distintas. Muchos teléfonos tienen el mismo corrimiento de columnas. **Esas cédulas no se pueden usar.**
- **${personas.filter((p) => !p.marca.trim()).length} personas no declaran marca ni taller.** Hay que derivarla del oficio y el territorio.
- ${duplicados.length} pares parecen la misma persona repetida dentro del Excel.

## Duplicados detectados

${
  duplicados.length
    ? `${duplicados.length} pares. El detalle lleva nombres y correos, así que vive en \`state/plan.json\` (\`duplicados\`) y no aquí.

Criterio: se consideran la misma persona si comparten la raíz del correo (ignorando dígitos
y separadores) o **tres** nombres/apellidos. Con dos bastaba para confundir a personas
distintas que comparten un nombre de pila común y un apellido frecuente. De cada par se
conserva la fila que trae correo propio, heredando de la descartada la marca, la cédula,
el municipio y el origen que le falten.`
    : '_Ninguno._'
}
`;

  const destino = path.join(DOCS_DIR, '02-clasificacion.md');
  fs.writeFileSync(destino, md, 'utf8');

  fs.writeFileSync(
    stateFile('plan.json'),
    JSON.stringify(
      {
        generado: new Date().toISOString(),
        target: TARGET,
        noTocar: yaCumplen.map((e) => ({ id: e.shop.id, shopName: e.shop.shopName, email: e.shop.user?.email ?? null })),
        completar: aCompletar.map((e) => {
          const m = cruce.emparejados.find((x) => x.shop.id === e.shop.id);
          return {
            id: e.shop.id,
            userId: e.shop.userId,
            shopName: e.shop.shopName,
            shopSlug: e.shop.shopSlug,
            email: e.shop.user?.email ?? null,
            faltantes: e.estado.faltantes,
            excel: m ? { nombre: m.persona.nombre, marca: m.persona.marca, municipio: m.persona.municipio, origen: m.persona.origen, hoja: m.persona.hoja } : null,
          };
        }),
        crear: aCrear.map((p) => ({
          nombre: p.nombre,
          email: tieneEmail(p.email) ? p.email : alias.find((a) => a.persona === p)?.correo,
          emailEsAlias: !tieneEmail(p.email),
          marca: p.marca,
          telefono: p.telefono,
          cedulaExcel: p.cedula,
          cedulaUsable: /^\d{5,}$/.test(p.cedula),
          municipio: p.municipio,
          origen: p.origen,
          hoja: p.hoja,
        })),
        revisarAMano: aRevisar.map((e) => ({
          score: e.score,
          razones: e.razones,
          excel: { nombre: e.persona.nombre, marca: e.persona.marca, email: e.persona.email },
          shop: { id: e.shop.id, shopName: e.shop.shopName, email: e.shop.user?.email ?? null },
        })),
        duplicados,
        tiendasFueraDelExcel: cruce.sinFilaExcel.map((s) => ({ id: s.id, shopName: s.shopName, email: s.user?.email ?? null })),
      },
      null,
      1,
    ),
    'utf8',
  );

  console.log(`A · No tocar   : ${yaCumplen.length}`);
  console.log(`B · Completar  : ${aCompletar.length}`);
  console.log(`C · Crear      : ${aCrear.length} (${conCorreo.length} con correo propio, ${conAlias.length} con alias)`);
  console.log(`D · Revisar    : ${aRevisar.length} emparejamientos inferidos + ${duplicados.length} duplicados`);
  console.log(`\nTecho: ${techo} tiendas · Meta: ${META} · ${techo >= META ? 'alcanzable' : 'NO alcanza'}`);
  console.log(`\nReporte: ${destino}`);
  console.log(`Plan:    ${stateFile('plan.json')}`);
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
