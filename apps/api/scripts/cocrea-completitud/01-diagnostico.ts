/**
 * Fase 1 — Fotografía del convenio CO-CREA tal como está hoy.
 *
 * Sólo lee. Escribe dos cosas:
 *   docs/cocrea/01-diagnostico.md   agregados, sin datos personales (se commitea)
 *   state/diagnostico.json          detalle por tienda (NO se commitea)
 *
 *   npx ts-node 01-diagnostico.ts            (contra local)
 *   COCREA_TARGET=prod npx ts-node 01-diagnostico.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { AGREEMENT_ID, AGREEMENT_NAME, DOCS_DIR, TARGET, banner, ensureDirs, stateFile } from './config';
import { getProductosConvenio, getTiendasConvenio, storeIdDe } from './helpers/api';
import { aboutTieneContenido, conContenido, contactoTieneContenido, evaluar } from './helpers/estado';

async function main() {
  banner('Fase 1 · Diagnóstico del convenio');
  ensureDirs();

  const shops = await getTiendasConvenio();
  const productos = await getProductosConvenio();
  console.log(`Tiendas del convenio: ${shops.length}`);
  console.log(`Productos del convenio: ${productos.length}\n`);

  const estados = shops.map((s) => ({ shop: s, estado: evaluar(s, productos) }));
  const n = shops.length;
  const cuenta = (pred: (e: (typeof estados)[number]) => boolean) => estados.filter(pred).length;
  const linea = (etiqueta: string, valor: number) =>
    `| ${etiqueta} | ${valor} | ${n ? Math.round((valor / n) * 100) : 0}% |`;

  const porEstadoProducto = productos.reduce<Record<string, number>>((acc, p) => {
    const k = p.status ?? '(sin status)';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const cumplen = cuenta((e) => e.estado.cumpleMeta);
  const conTienda = new Set(productos.map(storeIdDe).filter(Boolean));

  const md = `# CO-CREA · Diagnóstico

Generado por \`apps/api/scripts/cocrea-completitud/01-diagnostico.ts\` contra **${TARGET}**.
Convenio \`${AGREEMENT_NAME}\` (\`${AGREEMENT_ID}\`).

Sin datos personales: el detalle por tienda queda en \`state/diagnostico.json\`, que no se versiona.

## Resumen

**${cumplen} de ${n}** tiendas cumplen hoy la meta del convenio (publicada + identidad artesanal + ≥1 producto).

| Métrica | Tiendas | % |
|---|---:|---:|
${linea('Total en el convenio', n)}
${linea('publishStatus = published', cuenta((e) => e.estado.publicada))}
${linea('active = true', cuenta((e) => e.shop.active === true))}
${linea('marketplaceApproved = true', cuenta((e) => e.shop.marketplaceApproved === true))}
${linea('artisanProfileCompleted = true', cuenta((e) => e.estado.perfilCompleto))}
${linea('Con ≥1 producto (cualquier estado)', cuenta((e) => e.estado.conProducto))}
${linea('Con ≥1 producto aprobado', cuenta((e) => e.estado.conProductoAprobado))}
${linea('**Cumplen la meta**', cumplen)}
${linea('logoUrl', cuenta((e) => conContenido(e.shop.logoUrl)))}
${linea('bannerUrl', cuenta((e) => conContenido(e.shop.bannerUrl)))}
${linea('brandClaim', cuenta((e) => conContenido(e.shop.brandClaim)))}
${linea('description', cuenta((e) => conContenido(e.shop.description)))}
${linea('story', cuenta((e) => conContenido(e.shop.story)))}
${linea('aboutContent con contenido', cuenta((e) => aboutTieneContenido(e.shop)))}
${linea('contactConfig con contenido', cuenta((e) => contactoTieneContenido(e.shop)))}
${linea('Políticas/FAQ enlazadas', cuenta((e) => conContenido(e.shop.idPoliciesConfig)))}
${linea('department', cuenta((e) => conContenido(e.shop.department)))}
${linea('municipality', cuenta((e) => conContenido(e.shop.municipality)))}
${linea('bankDataStatus = complete', cuenta((e) => e.shop.bankDataStatus === 'complete'))}
${linea('idContraparty (Cobre)', cuenta((e) => conContenido(e.shop.idContraparty)))}

## Productos

${productos.length} productos en el convenio, repartidos en ${conTienda.size} tiendas.

| Estado | Productos |
|---|---:|
${Object.entries(porEstadoProducto)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| \`${k}\` | ${v} |`)
  .join('\n')}

> \`GET /products-new?agreementId=\` **sin** parámetro \`status\` devuelve sólo los aprobados.
> Los borradores hay que pedirlos aparte; si no, se subestima cuántas tiendas tienen producto.

## Qué falta, por concepto

| Falta | Tiendas |
|---|---:|
${['identidad artesanal', 'producto', 'publicar', 'logo', 'aboutContent', 'políticas/FAQ', 'contacto', 'brandClaim', 'ubicación']
  .map((f) => `| ${f} | ${cuenta((e) => e.estado.faltantes.includes(f))} |`)
  .join('\n')}

## Sobre el "90 vs 77" del brief

El brief de entrada hablaba de 90 registros en base de datos contra 77 en el dashboard.
Ninguno de los dos números corresponde a las tiendas del convenio: hoy son **${n}**.

La explicación más probable es que se estuvieran comparando dos cosas distintas:
\`artesanos.artisan_profile\` cuenta **personas registradas**, mientras que el dashboard
cuenta **tiendas**. El registro (\`auth.service.ts\`) crea usuario y perfil pero **no**
crea tienda — esa se crea después, en el onboarding. Toda persona que se registró y
nunca terminó el onboarding suma en un lado y no en el otro.

Confirmarlo requiere consultar la base directamente; la API no expone un conteo de
perfiles por convenio.
`;

  const destino = path.join(DOCS_DIR, '01-diagnostico.md');
  fs.writeFileSync(destino, md, 'utf8');

  fs.writeFileSync(
    stateFile('diagnostico.json'),
    JSON.stringify(
      {
        generado: new Date().toISOString(),
        target: TARGET,
        tiendas: estados.map((e) => ({
          id: e.shop.id,
          userId: e.shop.userId,
          shopName: e.shop.shopName,
          shopSlug: e.shop.shopSlug,
          email: e.shop.user?.email ?? null,
          ...e.estado,
        })),
      },
      null,
      1,
    ),
    'utf8',
  );

  console.log(`${cumplen} de ${n} tiendas cumplen la meta.`);
  console.log(`Reporte:  ${destino}`);
  console.log(`Detalle:  ${stateFile('diagnostico.json')}`);
}

main().catch((e) => {
  console.error('\n❌', e.message);
  if (e.body) console.error(e.body);
  process.exit(1);
});
