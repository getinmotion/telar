import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

/** Convenio CO-CREA. Mismo id que hornea el micrositio cocrea.telar.co. */
export const AGREEMENT_ID = 'b7a6d812-5dd7-4d7b-bec4-687d65234f4f';
export const AGREEMENT_NAME = 'CO-CREA';

/** Entornos de la API (hostnames tomados de infra/prod/nginx.conf e infra/dev/nginx.conf). */
export const API_BASES: Record<string, string> = {
  prod: 'https://prod-api.telar.co/telar/server',
  stage: 'https://stage-api.telar.co/telar/server',
  local: 'http://localhost:1010/telar/server',
};

export type TargetEnv = keyof typeof API_BASES;

/** Entorno destino. Por defecto `local` — apuntar a prod tiene que ser explícito. */
export const TARGET: TargetEnv = (process.env.COCREA_TARGET as TargetEnv) || 'local';
export const API_BASE = API_BASES[TARGET];

if (!API_BASE) {
  throw new Error(
    `COCREA_TARGET="${process.env.COCREA_TARGET}" no es válido. Opciones: ${Object.keys(API_BASES).join(', ')}`,
  );
}

/** Nada escribe si no se pasa --apply. El dry-run es el default deliberado. */
export const DRY_RUN = !process.argv.includes('--apply');

/** Contraseña de las cuentas creadas/completadas (el equipo se la entrega al artesano para que la cambie). */
export const DEFAULT_PASSWORD = 'telar123';

/** Buzón real de GET IN MOTION para los artesanos sin correo propio (subdireccionamiento con `+`). */
export const ALIAS_MAILBOX = 'aloha@getinmotion.io';

/** Excel fuente. Se pasa por env para no versionar datos personales en el repo. */
export const XLSX_PATH =
  process.env.COCREA_XLSX ||
  path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'TELAR Cruce 85 vs Cocrea.xlsx');

/** Estado y salidas con datos personales. Va en .gitignore — no se commitea. */
export const STATE_DIR = path.join(__dirname, 'state');

/** Reportes agregados, sin datos personales. Estos sí se commitean. */
export const DOCS_DIR = path.join(__dirname, '..', '..', '..', '..', 'docs', 'cocrea');

export function ensureDirs(): void {
  for (const dir of [STATE_DIR, DOCS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

export function stateFile(name: string): string {
  return path.join(STATE_DIR, name);
}

export function banner(titulo: string): void {
  const modo = DRY_RUN ? 'DRY-RUN (no escribe nada)' : '🔴 APLICANDO CAMBIOS';
  console.log('');
  console.log('═'.repeat(64));
  console.log(`  ${titulo}`);
  console.log(`  Convenio: ${AGREEMENT_NAME} · Entorno: ${TARGET} (${API_BASE})`);
  console.log(`  Modo: ${modo}`);
  console.log('═'.repeat(64));
  console.log('');
}
