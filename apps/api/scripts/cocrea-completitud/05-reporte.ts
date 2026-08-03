/**
 * Fase 5 — Reporte final: qué quedó y con qué credenciales.
 *
 * Sólo lee. Escribe:
 *   docs/cocrea/04-reporte-final.md   agregados antes/después, sin datos personales
 *   state/credenciales.csv            correo + contraseña por artesano (NO se versiona)
 *
 *   npm run cocrea:reporte -- --target prod   (desde apps/api)
 */
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_PASSWORD, DOCS_DIR, TARGET, banner, ensureDirs, stateFile } from './config';
import { getProductosConvenio, getTiendasConvenio } from './helpers/api';
import { evaluar } from './helpers/estado';
import { Ledger } from './helpers/ledger';

const META = 80;

async function main() {
  banner('Fase 5 · Reporte final');
  ensureDirs();

  const shops = await getTiendasConvenio();
  const productos = await getProductosConvenio();
  const estados = shops.map((s) => ({ shop: s, estado: evaluar(s, productos) }));
  const cumplen = estados.filter((e) => e.estado.cumpleMeta);

  const ledger = new Ledger();
  const entradas = ledger.todas();
  const conErrores = entradas.filter((e) => (e.errores ?? []).length);
  const creadas = entradas.filter((e) => e.pasos.includes('usuario'));

  // Punto de partida, para poder decir qué cambió y no sólo cómo quedó.
  const diagPath = stateFile('diagnostico.json');
  const inicial = fs.existsSync(diagPath)
    ? (JSON.parse(fs.readFileSync(diagPath, 'utf8')) as { tiendas: Array<{ cumpleMeta: boolean }> })
    : null;
  const antes = inicial ? inicial.tiendas.filter((t) => t.cumpleMeta).length : null;
  const antesTotal = inicial ? inicial.tiendas.length : null;

  // ─────────── credenciales (con datos personales, fuera del repo) ───────────
  const filas = [
    'correo,contraseña,es_alias,tienda,slug,estado',
    ...entradas
      .filter((e) => e.pasos.includes('usuario') || e.pasos.includes('tienda'))
      .map((e) => {
        const shop = shops.find((s) => s.id === e.shopId);
        const estado = shop ? (evaluar(shop, productos).cumpleMeta ? 'completa' : 'incompleta') : 'sin tienda';
        const esAlias = e.email.includes('+') && e.email.endsWith('@getinmotion.io');
        return [e.email, e.password ?? DEFAULT_PASSWORD, esAlias ? 'sí' : 'no', shop?.shopName ?? '', e.shopSlug ?? '', estado]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(',');
      }),
  ];
  fs.writeFileSync(stateFile('credenciales.csv'), filas.join('\n'), 'utf8');

  const md = `# CO-CREA · Reporte final

Generado por \`apps/api/scripts/cocrea-completitud/05-reporte.ts\` contra **${TARGET}**.

## Resultado

| | Tiendas |
|---|---:|
| En el convenio | ${shops.length} |
${antes !== null ? `| Cumplían la meta al empezar | ${antes} de ${antesTotal} |\n` : ''}| **Cumplen la meta ahora** | **${cumplen.length}** |
| Meta | ${META} |

${cumplen.length >= META ? `✅ Meta alcanzada (${cumplen.length} ≥ ${META}).` : `⚠️ Faltan **${META - cumplen.length}** tiendas para la meta.`}

"Cumplir la meta" es: tienda publicada + identidad artesanal completa + al menos un producto.

## Qué hizo esta corrida

| Acción | Artesanos |
|---|---:|
| Cuentas creadas | ${creadas.length} |
| Correos verificados sin intervención | ${entradas.filter((e) => e.pasos.includes('emailVerificado')).length} |
| Tiendas creadas | ${entradas.filter((e) => e.pasos.includes('tienda')).length} |
| Identidad artesanal completada | ${entradas.filter((e) => e.pasos.includes('perfilArtesanal')).length} |
| Políticas y FAQ | ${entradas.filter((e) => e.pasos.includes('politicas')).length} |
| Logo | ${entradas.filter((e) => e.pasos.includes('logo')).length} |
| Productos creados | ${entradas.filter((e) => e.pasos.includes('producto')).length} |
| Tiendas publicadas | ${entradas.filter((e) => e.pasos.includes('publicada')).length} |
| **Con algún error** | **${conErrores.length}** |

${
  conErrores.length
    ? `### Errores\n\nEl detalle lleva correos, así que está en \`state/ledger.${TARGET}.json\`. Por tipo:\n\n${Object.entries(
        conErrores
          .flatMap((e) => e.errores ?? [])
          .reduce<Record<string, number>>((acc, msg) => {
            const clave = msg.split(':')[0];
            acc[clave] = (acc[clave] || 0) + 1;
            return acc;
          }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}`
    : '_Sin errores._'
}

## Credenciales

\`state/credenciales.csv\` — correo, contraseña, si el correo es un alias, y la tienda.
**No se versiona**: lleva datos personales y contraseñas.

Todas las cuentas nuevas usan \`${DEFAULT_PASSWORD}\`. No es \`telar123\` porque \`RegisterDto\`
exige mayúscula, minúscula, dígito y carácter especial, y la API rechaza la otra con un 400.
El correo queda verificado, así que el artesano puede entrar y cambiarla sin pasos previos.

## Lo que quedó fuera, a propósito

- **Datos bancarios.** \`bankDataStatus\` e \`idContraparty\` no se tocan: los pone el artesano.
- **Las tiendas que ya cumplían.** No se les modificó ningún campo.
- **Cualquier campo con contenido.** El parche sólo rellena huecos; lo que el artesano escribió gana.

## Advertencias para quien reciba esto

- Los productos se crearon con **stock 0**: son piezas representativas, no están a la venta. Aparecen en el marketplace porque están aprobados y la tienda publicada.
- Las cédulas del rango \`99000000xx\` y los teléfonos \`+5739xxxxxxxx\` son **sintéticos**: el Excel no traía el dato. Hay que reemplazarlos cuando el equipo consiga los reales.
- Algunos municipios son la **capital del departamento**, no el municipio real, porque el Excel lo traía mal escrito o fuera del catálogo DANE. Están listados en \`docs/cocrea/03-contenido.md\`.
`;

  const destino = path.join(DOCS_DIR, '04-reporte-final.md');
  fs.writeFileSync(destino, md, 'utf8');

  console.log(`Tiendas que cumplen la meta: ${cumplen.length} de ${shops.length} (meta ${META})`);
  if (antes !== null) console.log(`Al empezar eran ${antes}.`);
  if (conErrores.length) console.log(`⚠️  ${conErrores.length} artesanos con errores — ver ${stateFile(`ledger.${TARGET}.json`)}`);
  console.log(`\nReporte:      ${destino}`);
  console.log(`Credenciales: ${stateFile('credenciales.csv')}`);
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
