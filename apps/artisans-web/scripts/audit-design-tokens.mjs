#!/usr/bin/env node
/**
 * Auditoría de tokens del design system.
 *
 * Escanea src/**\/*.tsx buscando estilos que ignoran el design system
 * (DESIGN.md + CSS vars de index.css) y genera reports/design-audit.md.
 *
 * Uso:
 *   node scripts/audit-design-tokens.mjs            # reporte completo
 *   node scripts/audit-design-tokens.mjs --summary  # solo totales (para PRs)
 *
 * Patrones detectados:
 *   - hex        : colores #rrggbb dentro de className
 *   - rgba       : rgb()/rgba() en style props u objetos de estilo
 *   - text-px    : tamaños arbitrarios text-[Npx]
 *   - font       : familias inline font-['...']
 *   - glass      : glass-morphism inline (backdrop-blur + bg-white/NN)
 *
 * Falsos positivos conocidos que se EXCLUYEN: líneas con fill=/stroke= de SVG
 * y archivos de datos de gráficos (recharts). Se marcan, no se cuentan.
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'reports', 'design-audit.md');
const SUMMARY_ONLY = process.argv.includes('--summary');

/** Mapa hex → token sugerido (ver DESIGN.md y src/index.css) */
const HEX_TOKEN_MAP = {
  'ec6d13': 'brand-orange',
  '54433e': 'on-surface-variant',
  '151b2d': 'on-surface',
  'e2d5cf': 'brand-border',
  '166534': 'accent-green',
  '15803d': 'domain-moderation',
  '7c3aed': 'domain-business',
  '5b21b6': 'domain-business (dark)',
  'c45a0a': 'brand-orange (dark) / accent',
  '9c3f00': 'brand-orange (darker)',
  'ef4444': 'destructive (ya existe)',
  'f9f7f2': 'background (ya existe)',
  'fdfaf6': 'brand-cream',
  '142239': 'navy / primary (ya existe)',
  'd15a2e': 'accent (ya existe)',
  'ffffff': 'white (usar bg-white)',
  'fff': 'white (usar bg-white)',
};

const PATTERNS = [
  { id: 'hex', label: 'Hex hardcodeado en className', re: /#[0-9a-fA-F]{3,8}\b/g, where: 'className' },
  { id: 'rgba', label: 'rgb()/rgba() inline en style', re: /rgba?\(/g, where: 'style' },
  { id: 'text-px', label: 'Tamaño arbitrario text-[Npx]', re: /text-\[\d+px\]/g, where: 'any' },
  { id: 'font', label: "Familia inline font-['...']", re: /font-\['[^']+'\]/g, where: 'any' },
  { id: 'glass', label: 'Glass inline (backdrop-blur + bg-white/N)', re: /backdrop-blur/g, where: 'glass' },
];

// ---------------------------------------------------------------------------

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '__tests__') continue;
      yield* walk(p);
    } else if (/\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name)) {
      yield p;
    }
  }
}

/** Heurística: ¿la línea está en contexto de className / style? */
function lineContext(lines, idx) {
  // Busca hacia atrás hasta 5 líneas el atributo abierto más cercano
  for (let i = idx; i >= Math.max(0, idx - 5); i--) {
    const l = lines[i];
    if (/style\s*[=:]\s*\{/.test(l) || /style=\{\{/.test(l)) return 'style';
    if (/className/.test(l) || /^\s*['"`]/.test(lines[idx])) {
      if (/className/.test(l)) return 'className';
    }
  }
  // Strings de clases en constantes (const x = 'bg-[#...] ...')
  if (/['"`][^'"`]*(?:bg-|text-|border-|ring-)\[/.test(lines[idx])) return 'className';
  return 'unknown';
}

const isSvgDataLine = (line) =>
  /\b(fill|stroke|stopColor|floodColor)\s*[=:]/.test(line) || /<(svg|path|rect|circle|linearGradient|stop)\b/.test(line);

const isChartDataLine = (line) => /\b(COLORS|chartColors|dataKey|recharts)\b/i.test(line);

// ---------------------------------------------------------------------------

const findings = []; // { file, line, pattern, match, excluded }

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, idx) => {
    const excluded = isSvgDataLine(line) || isChartDataLine(line);

    for (const pat of PATTERNS) {
      if (pat.id === 'glass') {
        // glass = backdrop-blur junto a bg-white/NN o rgba blanco en la misma línea
        if (/backdrop-blur/.test(line) && (/bg-white\//.test(line) || /rgba\(255/.test(line))) {
          findings.push({ file: rel, line: idx + 1, pattern: 'glass', match: 'glass inline', excluded });
        }
        continue;
      }
      const matches = line.match(pat.re);
      if (!matches) continue;

      const ctx = lineContext(lines, idx);
      if (pat.where === 'className' && ctx === 'style') continue; // hex en style ya lo cubre rgba? no — cuéntalo igual
      if (pat.where === 'style' && ctx !== 'style') continue;

      for (const m of matches) {
        findings.push({ file: rel, line: idx + 1, pattern: pat.id, match: m, excluded });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Agregación

const active = findings.filter((f) => !f.excluded);
const excluded = findings.filter((f) => f.excluded);

const byPattern = {};
for (const f of active) byPattern[f.pattern] = (byPattern[f.pattern] ?? 0) + 1;

const byFile = {};
for (const f of active) {
  byFile[f.file] ??= { total: 0 };
  byFile[f.file].total++;
  byFile[f.file][f.pattern] = (byFile[f.file][f.pattern] ?? 0) + 1;
}

const hexCounts = {};
for (const f of active.filter((x) => x.pattern === 'hex')) {
  const key = f.match.slice(1).toLowerCase();
  hexCounts[key] = (hexCounts[key] ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Reporte

const now = new Date().toISOString().slice(0, 10);
const patLabel = Object.fromEntries(PATTERNS.map((p) => [p.id, p.label]));

let md = `# Auditoría de design tokens — artisans-web\n\nGenerado: ${now} · \`node scripts/audit-design-tokens.mjs\`\n\n`;

md += `## Totales\n\n| Patrón | Instancias |\n|---|---:|\n`;
for (const [id, count] of Object.entries(byPattern).sort((a, b) => b[1] - a[1])) {
  md += `| ${patLabel[id]} | ${count} |\n`;
}
md += `| **Total** | **${active.length}** |\n`;
md += `\n(${excluded.length} coincidencias excluidas por ser SVG fills / datos de gráficos)\n\n`;

md += `## Top colores hex → token sugerido\n\n| Hex | Usos | Token sugerido |\n|---|---:|---|\n`;
for (const [hex, count] of Object.entries(hexCounts).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  md += `| \`#${hex}\` | ${count} | ${HEX_TOKEN_MAP[hex] ?? '—'} |\n`;
}

md += `\n## Archivos con más violaciones\n\n| Archivo | Total | hex | rgba | text-px | font | glass |\n|---|---:|---:|---:|---:|---:|---:|\n`;
const sortedFiles = Object.entries(byFile).sort((a, b) => b[1].total - a[1].total);
for (const [file, c] of sortedFiles.slice(0, 60)) {
  md += `| ${file} | ${c.total} | ${c['hex'] ?? ''} | ${c['rgba'] ?? ''} | ${c['text-px'] ?? ''} | ${c['font'] ?? ''} | ${c['glass'] ?? ''} |\n`;
}
if (sortedFiles.length > 60) md += `\n…y ${sortedFiles.length - 60} archivos más.\n`;

md += `\n## Resumen por carpeta\n\n| Carpeta | Total |\n|---|---:|\n`;
const byDir = {};
for (const [file, c] of sortedFiles) {
  const dir = file.split('/').slice(0, 3).join('/');
  byDir[dir] = (byDir[dir] ?? 0) + c.total;
}
for (const [dir, count] of Object.entries(byDir).sort((a, b) => b[1] - a[1])) {
  md += `| ${dir} | ${count} |\n`;
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md, 'utf8');

// Consola
console.log(`Auditoría de design tokens — ${now}`);
console.log('-'.repeat(46));
for (const [id, count] of Object.entries(byPattern).sort((a, b) => b[1] - a[1])) {
  console.log(`${patLabel[id].padEnd(40)} ${String(count).padStart(5)}`);
}
console.log('-'.repeat(46));
console.log(`${'TOTAL'.padEnd(40)} ${String(active.length).padStart(5)}`);
console.log(`(excluidas ${excluded.length} en SVG/datos de gráficos)`);
if (!SUMMARY_ONLY) console.log(`\nReporte completo: ${relative(ROOT, OUT)}`);
