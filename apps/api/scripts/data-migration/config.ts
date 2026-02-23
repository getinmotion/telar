import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Conexión a Supabase (Base de datos origen)
 */
export const supabaseConnection = new DataSource({
  type: 'postgres',
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  username: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
  logging: false,
});

/**
 * Conexión a la nueva BD de producción (Base de datos destino)
 */
export const productionConnection = new DataSource({
  type: 'postgres',
  host: process.env.HOST_DB,
  port: parseInt(process.env.PORT_DB || '5432'),
  username: process.env.USER_DB,
  password: process.env.PASS_DB,
  database: process.env.NAME_DB,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: false,
});

/**
 * Inicializar ambas conexiones
 */
export async function initConnections() {
  console.log('🔌 Conectando a Supabase...');
  await supabaseConnection.initialize();
  console.log('✅ Conectado a Supabase');

  console.log('🔌 Conectando a Producción...');
  await productionConnection.initialize();
  console.log('✅ Conectado a Producción\n');
}

/**
 * Cerrar ambas conexiones
 */
export async function closeConnections() {
  console.log('\n🔌 Cerrando conexiones...');

  if (supabaseConnection.isInitialized) {
    await supabaseConnection.destroy();
    console.log('✅ Conexión a Supabase cerrada');
  }

  if (productionConnection.isInitialized) {
    await productionConnection.destroy();
    console.log('✅ Conexión a Producción cerrada');
  }
}
