import * as fs from 'fs';
import { DRY_RUN, TARGET, stateFile } from '../config';

/**
 * Registro de lo ya hecho, por artesano.
 *
 * Es lo que hace la inyección reintentable: si el proceso se corta a mitad —o la
 * API falla en la tienda 40 de 80— volver a correrlo retoma donde quedó en vez de
 * duplicar usuarios y tiendas. La llave es el correo, que es lo único estable
 * entre el Excel y la base.
 */

export type Paso =
  | 'usuario'
  | 'emailVerificado'
  | 'tienda'
  | 'perfilArtesanal'
  | 'configTienda'
  | 'politicas'
  | 'logo'
  | 'producto'
  | 'productoAprobado'
  | 'publicada';

export interface Entrada {
  email: string;
  userId?: string;
  shopId?: string;
  shopSlug?: string;
  productId?: string;
  policiesId?: string;
  logoUrl?: string;
  password?: string;
  pasos: Paso[];
  errores?: string[];
}

/**
 * El ledger real, el único que decide qué se salta en una corrida con --apply.
 *
 * Va separado por entorno: un ensayo del script contra staging escribiría los
 * mismos correos, y el siguiente `--apply` contra producción se los saltaría
 * creyendo que ya estaban hechos.
 */
const RUTA_REAL = () => stateFile(`ledger.${TARGET}.json`);

/**
 * El dry-run escribe en un archivo aparte.
 *
 * Si volcara sobre el real, marcaría como cumplidos pasos que nunca se enviaron,
 * y el siguiente `--apply` se los saltaría dejando las tiendas a medias.
 */
const RUTA_ESCRITURA = () => (DRY_RUN ? stateFile(`ledger.${TARGET}.dry-run.json`) : RUTA_REAL());

export class Ledger {
  private entradas = new Map<string, Entrada>();

  constructor() {
    // Siempre se parte del ledger real: así el dry-run simula de verdad
    // lo que haría la siguiente corrida.
    const ruta = RUTA_REAL();
    if (fs.existsSync(ruta)) {
      const datos = JSON.parse(fs.readFileSync(ruta, 'utf8')) as Entrada[];
      datos.forEach((e) => this.entradas.set(e.email.toLowerCase(), e));
    }
  }

  get(email: string): Entrada {
    const clave = email.toLowerCase();
    if (!this.entradas.has(clave)) this.entradas.set(clave, { email: clave, pasos: [] });
    return this.entradas.get(clave)!;
  }

  hecho(email: string, paso: Paso): boolean {
    return this.get(email).pasos.includes(paso);
  }

  marcar(email: string, paso: Paso, datos: Partial<Entrada> = {}): void {
    const e = this.get(email);
    if (!e.pasos.includes(paso)) e.pasos.push(paso);
    Object.assign(e, datos);
  }

  error(email: string, mensaje: string): void {
    const e = this.get(email);
    e.errores = [...(e.errores ?? []), mensaje];
  }

  todas(): Entrada[] {
    return [...this.entradas.values()];
  }

  guardar(): void {
    fs.writeFileSync(RUTA_ESCRITURA(), JSON.stringify(this.todas(), null, 1), 'utf8');
  }
}
