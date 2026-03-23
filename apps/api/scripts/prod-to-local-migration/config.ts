import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.join(__dirname, '.env') });

/**
 * Conexión a la base de datos de PRODUCCIÓN (AWS Lightsail)
 * Origen de datos
 */
export const productionConnection = new DataSource({
  type: 'postgres',
  host: process.env.PROD_HOST_DB || 'ls-xxxx.rds.amazonaws.com',
  port: parseInt(process.env.PROD_PORT_DB || '5432'),
  username: process.env.PROD_USER_DB || 'dbadmin',
  password: process.env.PROD_PASS_DB || '',
  database: process.env.PROD_NAME_DB || 'getinmotion',
  ssl: {
    rejectUnauthorized: false, // AWS Lightsail requiere SSL
  },
  logging: false,
  synchronize: false,
  // No entities needed for raw queries
});

/**
 * Conexión a la base de datos LOCAL
 * Destino de datos
 */
export const localConnection = new DataSource({
  type: 'postgres',
  host: process.env.LOCAL_HOST_DB || 'localhost',
  port: parseInt(process.env.LOCAL_PORT_DB || '5432'),
  username: process.env.LOCAL_USER_DB || 'postgres',
  password: process.env.LOCAL_PASS_DB || 'postgres',
  database: process.env.LOCAL_NAME_DB || 'getinmotion',
  ssl: false, // Local no requiere SSL
  logging: false,
  synchronize: false,
});

/**
 * Inicializa ambas conexiones
 */
export async function initConnections(): Promise<void> {
  console.log('\n🔌 Inicializando conexiones a bases de datos...\n');

  try {
    await productionConnection.initialize();
    console.log(`✅ Conexión a PRODUCCIÓN establecida: ${process.env.PROD_NAME_DB}@${process.env.PROD_HOST_DB}`);
  } catch (error) {
    console.error('❌ Error conectando a PRODUCCIÓN:', error);
    throw error;
  }

  try {
    await localConnection.initialize();
    console.log(`✅ Conexión a LOCAL establecida: ${process.env.LOCAL_NAME_DB}@${process.env.LOCAL_HOST_DB}\n`);
  } catch (error) {
    console.error('❌ Error conectando a LOCAL:', error);
    throw error;
  }
}

/**
 * Cierra ambas conexiones
 */
export async function closeConnections(): Promise<void> {
  console.log('\n🔌 Cerrando conexiones...\n');

  if (productionConnection.isInitialized) {
    await productionConnection.destroy();
    console.log('✅ Conexión a PRODUCCIÓN cerrada');
  }

  if (localConnection.isInitialized) {
    await localConnection.destroy();
    console.log('✅ Conexión a LOCAL cerrada\n');
  }
}
