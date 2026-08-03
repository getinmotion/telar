import * as fs from 'fs';
import { stateFile } from '../config';

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

const RUTA = () => stateFile('ledger.json');

export class Ledger {
  private entradas = new Map<string, Entrada>();

  constructor() {
    const ruta = RUTA();
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
    fs.writeFileSync(RUTA(), JSON.stringify(this.todas(), null, 1), 'utf8');
  }
}
