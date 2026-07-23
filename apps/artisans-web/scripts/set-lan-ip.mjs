#!/usr/bin/env node
/**
 * Regenera apps/artisans-web/.env.local con la IP LAN actual de la máquina.
 *
 * ¿Por qué existe? El frontend se prueba desde celular/iPad en la misma red,
 * así que las URLs de los servicios locales deben usar la IP LAN (no localhost).
 * Esa IP cambia cada vez que te conectas a otra red/hotspot, dejando el
 * .env.local apuntando a una IP muerta y rompiendo el login con un 500 aparente.
 *
 * Uso:
 *   node scripts/set-lan-ip.mjs            -> autodetecta la IP LAN
 *   node scripts/set-lan-ip.mjs 10.0.0.5   -> fuerza una IP concreta
 */
import { networkInterfaces } from 'node:os';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Puertos de cada servicio local (deben coincidir con los dev servers).
const PORTS = {
  VITE_BACKEND_URL: { port: 1010, path: '/telar/server' },
  VITE_SEMANTIC_SEARCH_URL: { port: 8000, path: '/api/v1/search' },
  VITE_MARKETPLACE_BASE_URL: { port: 8081, path: '' },
  VITE_APP_STORE_BASE_URL: { port: 8080, path: '' },
};

function detectLanIp() {
  const forced = process.argv[2];
  if (forced) return forced;

  const candidates = [];
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      // Descartar rangos que no son de LAN útil (APIPA, docker/WSL habituales).
      if (addr.address.startsWith('169.254.')) continue;
      candidates.push({ name, address: addr.address });
    }
  }
  if (candidates.length === 0) return null;

  // Preferir Wi-Fi/Ethernet por nombre; si no, la primera candidata.
  const preferred = candidates.find((c) => /wi-?fi|wlan|ethernet|en0|eth/i.test(c.name));
  return (preferred ?? candidates[0]).address;
}

const ip = detectLanIp();
if (!ip) {
  console.error('❌ No se pudo detectar una IP LAN. Pásala manualmente: node scripts/set-lan-ip.mjs <ip>');
  process.exit(1);
}

const lines = Object.entries(PORTS).map(
  ([key, { port, path }]) => `${key}="http://${ip}:${port}${path}"`,
);

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
writeFileSync(envPath, lines.join('\n') + '\n');

console.info(`✅ .env.local actualizado con IP LAN: ${ip}`);
console.info('   Reinicia el dev server (Vite no recarga los .env en caliente).');
