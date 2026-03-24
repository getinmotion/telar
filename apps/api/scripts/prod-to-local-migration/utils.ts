import * as fs from 'fs';
import * as path from 'path';

/**
 * Logger para migración
 */
export class MigrationLogger {
  private logFile: string;
  private startTime: number;

  constructor(migrationName: string) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    this.logFile = path.join(
      __dirname,
      `logs`,
      `${migrationName}-${timestamp}.log`,
    );
    this.startTime = Date.now();

    // Crear directorio de logs si no existe
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.log(`========== Iniciando migración: ${migrationName} ==========`);
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(message);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const errorMessage = error ? `${message}: ${error.message}` : message;
    const logMessage = `[${timestamp}] ❌ ERROR: ${errorMessage}`;

    console.error(`❌ ${errorMessage}`);
    fs.appendFileSync(this.logFile, logMessage + '\n');

    if (error?.stack) {
      fs.appendFileSync(this.logFile, error.stack + '\n');
    }
  }

  success(message: string) {
    this.log(`✅ ${message}`);
  }

  finish(stats: { success: number; failed: number; total: number }) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);

    this.log('\n========== Resumen de Migración ==========');
    this.log(`Total de registros: ${stats.total}`);
    this.log(`✅ Exitosos: ${stats.success} (${successRate}%)`);
    this.log(`❌ Fallidos: ${stats.failed}`);
    this.log(`⏱️  Duración: ${duration}s`);
    this.log(`📄 Log guardado en: ${this.logFile}`);
    this.log('==========================================\n');
  }
}

/**
 * Barra de progreso simple
 */
export class ProgressBar {
  private total: number;
  private current: number = 0;
  private lastUpdate: number = 0;

  constructor(total: number) {
    this.total = total;
  }

  update(current: number) {
    this.current = current;

    // Actualizar cada 10 items o en el último
    if (current % 10 === 0 || current === this.total) {
      const percentage = ((current / this.total) * 100).toFixed(1);
      const bar = this.generateBar(current, this.total);
      process.stdout.write(`\r   ${bar} ${percentage}% (${current}/${this.total})`);

      if (current === this.total) {
        console.log(''); // Nueva línea al finalizar
      }
    }
  }

  private generateBar(current: number, total: number): string {
    const barLength = 30;
    const filled = Math.floor((current / total) * barLength);
    const empty = barLength - filled;

    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }
}

/**
 * Ejecutar en lotes (batch processing)
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Sanitizar datos para evitar errores de SQL.
 * Serializa objetos/arrays a JSON string para columnas jsonb.
 */
export function sanitizeValue(value: any): any {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

/**
 * Serializar todos los valores de un registro para INSERT parametrizado.
 * Convierte objetos/arrays JS (leídos de columnas jsonb) a strings JSON.
 */
export function serializeRow(row: Record<string, any>): any[] {
  return Object.values(row).map(sanitizeValue);
}
