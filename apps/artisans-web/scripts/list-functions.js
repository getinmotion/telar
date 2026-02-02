#!/usr/bin/env node

/**
 * Script simple para listar y comparar Edge Functions
 * 
 * Muestra:
 * - Funciones locales
 * - Funciones en config.toml
 * - Diferencias
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');
const CONFIG_FILE = path.join(__dirname, '..', 'supabase', 'config.toml');

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
    .map(entry => entry.name)
    .sort();
}

/**
 * Lista funciones en config.toml
 */
function getConfigFunctions() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return [];
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const functions = [];
  
  // Buscar patrones [functions.nombre-funcion]
  const regex = /\[functions\.([a-z0-9-]+)\]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    functions.push(match[1]);
  }
  
  return functions.sort();
}

/**
 * Verifica si una función tiene index.ts
 */
function hasIndexFile(functionName) {
  const indexPath = path.join(FUNCTIONS_DIR, functionName, 'index.ts');
  return fs.existsSync(indexPath);
}

/**
 * Función principal
 */
function main() {
  log('\n📋 Análisis de Edge Functions\n', 'cyan');
  
  const localFunctions = getLocalFunctions();
  const configFunctions = getConfigFunctions();
  
  log('📁 Funciones Locales:', 'blue');
  log(`   Total: ${localFunctions.length}`, 'blue');
  
  if (localFunctions.length > 0) {
    localFunctions.forEach(func => {
      const hasIndex = hasIndexFile(func);
      const icon = hasIndex ? '✅' : '⚠️';
      const color = hasIndex ? 'green' : 'yellow';
      log(`   ${icon} ${func}`, color);
    });
  } else {
    log('   (ninguna)', 'gray');
  }
  
  log('\n⚙️  Funciones en config.toml:', 'blue');
  log(`   Total: ${configFunctions.length}`, 'blue');
  
  if (configFunctions.length > 0) {
    configFunctions.forEach(func => {
      log(`   - ${func}`, 'blue');
    });
  } else {
    log('   (ninguna)', 'gray');
  }
  
  // Encontrar diferencias
  const onlyLocal = localFunctions.filter(f => !configFunctions.includes(f));
  const onlyConfig = configFunctions.filter(f => !localFunctions.includes(f));
  const missingIndex = localFunctions.filter(f => !hasIndexFile(f));
  
  if (onlyLocal.length > 0) {
    log('\n⚠️  Funciones locales NO en config.toml:', 'yellow');
    onlyLocal.forEach(func => {
      log(`   - ${func}`, 'yellow');
    });
  }
  
  if (onlyConfig.length > 0) {
    log('\n⚠️  Funciones en config.toml pero NO locales:', 'yellow');
    onlyConfig.forEach(func => {
      log(`   - ${func}`, 'yellow');
      log(`     💡 Esta función está en cloud pero no localmente`, 'gray');
    });
  }
  
  if (missingIndex.length > 0) {
    log('\n⚠️  Funciones locales sin index.ts:', 'yellow');
    missingIndex.forEach(func => {
      log(`   - ${func}`, 'yellow');
    });
  }
  
  if (onlyLocal.length === 0 && onlyConfig.length === 0 && missingIndex.length === 0) {
    log('\n✅ Todo está sincronizado!', 'green');
  } else {
    log('\n💡 Recomendaciones:', 'cyan');
    if (onlyConfig.length > 0) {
      log('   1. Descarga las funciones faltantes desde Supabase Dashboard', 'cyan');
      log('      Ve a: https://supabase.com/dashboard/project/ylooqmqmoufqtxvetxuj/functions', 'gray');
    }
    if (onlyLocal.length > 0) {
      log('   2. Agrega las funciones locales a config.toml si son necesarias', 'cyan');
    }
    if (missingIndex.length > 0) {
      log('   3. Verifica que las funciones tengan su archivo index.ts', 'cyan');
    }
  }
  
  log('');
}

main();

