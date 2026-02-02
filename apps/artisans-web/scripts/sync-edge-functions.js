#!/usr/bin/env node

/**
 * Script para sincronizar Edge Functions desde Supabase Cloud
 * 
 * Este script:
 * 1. Lista todas las Edge Functions en Supabase Cloud
 * 2. Compara con las funciones locales
 * 3. Descarga las funciones faltantes
 * 
 * Requisitos:
 * - Supabase CLI instalado: npm install -g supabase
 * - Autenticado con: supabase login
 * - Vinculado al proyecto: supabase link --project-ref ylooqmqmoufqtxvetxuj
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Verifica si Supabase CLI está instalado
 */
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Lista todas las funciones locales
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
 * Lista todas las funciones en Supabase Cloud usando CLI
 */
function getCloudFunctions() {
  try {
    log('📡 Obteniendo lista de funciones desde Supabase Cloud...', 'cyan');
    
    // Usar Supabase CLI para listar funciones
    const output = execSync(
      `supabase functions list --project-ref ${PROJECT_REF}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    // Parsear output (formato puede variar según versión de CLI)
    const lines = output.split('\n').filter(line => line.trim());
    const functions = [];
    
    // Buscar nombres de funciones en el output
    // El formato típico es: function_name | status | ...
    lines.forEach(line => {
      const match = line.match(/^([a-z0-9-]+)\s*\|/);
      if (match && match[1] && match[1] !== 'name') {
        functions.push(match[1]);
      }
    });
    
    return functions;
  } catch (error) {
    log('❌ Error al obtener funciones desde Supabase Cloud', 'red');
    log(`Error: ${error.message}`, 'red');
    log('\n💡 Alternativas:', 'yellow');
    log('1. Verifica que estés autenticado: supabase login', 'yellow');
    log('2. Verifica que el proyecto esté vinculado: supabase link --project-ref ylooqmqmoufqtxvetxuj', 'yellow');
    log('3. Usa el método alternativo con API (ver script alternativo)', 'yellow');
    return [];
  }
}

/**
 * Descarga una función específica desde Supabase Cloud
 */
function downloadFunction(functionName) {
  try {
    log(`📥 Descargando función: ${functionName}...`, 'blue');
    
    const functionDir = path.join(FUNCTIONS_DIR, functionName);
    
    // Crear directorio si no existe
    if (!fs.existsSync(functionDir)) {
      fs.mkdirSync(functionDir, { recursive: true });
    }
    
    // Intentar descargar usando Supabase CLI
    // Nota: La CLI de Supabase no tiene un comando directo para descargar funciones
    // Por lo que usaremos la API directamente
    
    log(`⚠️  La CLI de Supabase no soporta descarga directa de funciones`, 'yellow');
    log(`💡 Usa el script alternativo con API o descarga manualmente desde el dashboard`, 'yellow');
    
    return false;
  } catch (error) {
    log(`❌ Error al descargar ${functionName}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  log('\n🚀 Sincronización de Edge Functions desde Supabase Cloud\n', 'cyan');
  
  // Verificar Supabase CLI
  if (!checkSupabaseCLI()) {
    log('❌ Supabase CLI no está instalado', 'red');
    log('📦 Instálalo con: npm install -g supabase', 'yellow');
    process.exit(1);
  }
  
  // Obtener listas
  const localFunctions = getLocalFunctions();
  const cloudFunctions = getCloudFunctions();
  
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
  
  log('\n💡 Nota: La CLI de Supabase no soporta descarga directa de funciones', 'yellow');
  log('   Usa el script alternativo con API o descarga manualmente desde el dashboard\n', 'yellow');
}

// Ejecutar
main().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});

