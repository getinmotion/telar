#!/usr/bin/env node

/**
 * Script alternativo para sincronizar Edge Functions usando la API de Supabase
 * 
 * Este script usa la API Management de Supabase para:
 * 1. Listar todas las Edge Functions
 * 2. Descargar el código de cada función
 * 
 * Requisitos:
 * - Access Token de Supabase (obtener desde: https://supabase.com/dashboard/account/tokens)
 * - Project ID: ylooqmqmoufqtxvetxuj
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://api.supabase.com';
const PROJECT_REF = 'ylooqmqmoufqtxvetxuj';
const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Obtiene el access token desde variables de entorno o archivo .env
 */
function getAccessToken() {
  // Primero intentar desde variable de entorno
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    return process.env.SUPABASE_ACCESS_TOKEN;
  }
  
  // Intentar leer desde .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/SUPABASE_ACCESS_TOKEN=(.+)/);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Lista todas las funciones en Supabase Cloud usando la API
 */
async function getCloudFunctions(accessToken) {
  try {
    log('📡 Obteniendo lista de funciones desde Supabase API...', 'cyan');
    
    const response = await fetch(
      `${SUPABASE_URL}/v1/projects/${PROJECT_REF}/functions`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map(func => func.name);
  } catch (error) {
    log(`❌ Error al obtener funciones: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Descarga el código de una función específica
 */
async function downloadFunctionCode(functionName, accessToken) {
  try {
    log(`📥 Descargando código de: ${functionName}...`, 'blue');
    
    const response = await fetch(
      `${SUPABASE_URL}/v1/projects/${PROJECT_REF}/functions/${functionName}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Crear directorio de la función
    const functionDir = path.join(FUNCTIONS_DIR, functionName);
    if (!fs.existsSync(functionDir)) {
      fs.mkdirSync(functionDir, { recursive: true });
    }
    
    // Guardar el código
    // Nota: La estructura exacta de la respuesta puede variar
    // Ajusta según la API real de Supabase
    
    if (data.body) {
      // Si el código viene en data.body
      const indexPath = path.join(functionDir, 'index.ts');
      fs.writeFileSync(indexPath, data.body, 'utf-8');
      log(`   ✅ Guardado: ${indexPath}`, 'green');
    } else if (data.code) {
      // Si el código viene en data.code
      const indexPath = path.join(functionDir, 'index.ts');
      fs.writeFileSync(indexPath, data.code, 'utf-8');
      log(`   ✅ Guardado: ${indexPath}`, 'green');
    } else {
      // Guardar toda la respuesta como JSON para inspección
      const jsonPath = path.join(functionDir, 'function-data.json');
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
      log(`   ⚠️  Estructura desconocida, guardado como JSON: ${jsonPath}`, 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Lista funciones locales
 */
function getLocalFunctions() {
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
    .map(entry => entry.name);
}

/**
 * Función principal
 */
async function main() {
  log('\n🚀 Sincronización de Edge Functions usando Supabase API\n', 'cyan');
  
  // Obtener access token
  const accessToken = getAccessToken();
  if (!accessToken) {
    log('❌ No se encontró SUPABASE_ACCESS_TOKEN', 'red');
    log('\n📝 Para obtener tu Access Token:', 'yellow');
    log('   1. Ve a https://supabase.com/dashboard/account/tokens', 'yellow');
    log('   2. Crea un nuevo token', 'yellow');
    log('   3. Agrégalo a .env.local: SUPABASE_ACCESS_TOKEN=tu_token', 'yellow');
    log('   4. O exporta como variable: export SUPABASE_ACCESS_TOKEN=tu_token', 'yellow');
    process.exit(1);
  }
  
  // Obtener listas
  const localFunctions = getLocalFunctions();
  const cloudFunctions = await getCloudFunctions(accessToken);
  
  log(`\n📊 Resumen:`, 'cyan');
  log(`   Funciones locales: ${localFunctions.length}`, 'blue');
  log(`   Funciones en cloud: ${cloudFunctions.length}`, 'blue');
  
  // Encontrar funciones faltantes
  const missingFunctions = cloudFunctions.filter(
    func => !localFunctions.includes(func)
  );
  
  if (missingFunctions.length === 0) {
    log('\n✅ Todas las funciones están sincronizadas!', 'green');
    return;
  }
  
  log(`\n📋 Funciones faltantes (${missingFunctions.length}):`, 'yellow');
  missingFunctions.forEach(func => {
    log(`   - ${func}`, 'yellow');
  });
  
  // Preguntar si descargar (en modo interactivo)
  if (process.argv.includes('--auto')) {
    log('\n📥 Descargando funciones faltantes...\n', 'cyan');
    
    let successCount = 0;
    for (const funcName of missingFunctions) {
      const success = await downloadFunctionCode(funcName, accessToken);
      if (success) successCount++;
    }
    
    log(`\n✅ Descargadas ${successCount}/${missingFunctions.length} funciones`, 'green');
  } else {
    log('\n💡 Para descargar automáticamente, ejecuta con --auto:', 'yellow');
    log('   node scripts/sync-edge-functions-api.js --auto', 'yellow');
    log('\n⚠️  Nota: La API de Supabase puede tener limitaciones', 'yellow');
    log('   Si este método no funciona, usa el método manual del dashboard', 'yellow');
  }
}

// Ejecutar
main().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});

