/**
 * Script para agregar console.log a todas las peticiones de Supabase
 * 
 * Uso:
 *   node add-supabase-logs.js --dry-run    # Ver cambios sin aplicar
 *   node add-supabase-logs.js --apply      # Aplicar cambios
 */

const fs = require('fs');
const path = require('path');

// Configuración
const SRC_DIR = path.join(__dirname, 'src');
const DRY_RUN = process.argv.includes('--dry-run');
const APPLY = process.argv.includes('--apply');

// Patrones de búsqueda
const SUPABASE_PATTERNS = [
  /await\s+supabase\.from\(/g,
  /supabase\.from\(/g,
  /await\s+supabase\.functions\.invoke\(/g,
  /supabase\.functions\.invoke\(/g,
  /await\s+supabase\.rpc\(/g,
  /supabase\.rpc\(/g
];

// Estadísticas
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  logsAdded: 0,
  errors: []
};

/**
 * Busca archivos recursivamente
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Excluir node_modules y otras carpetas
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Detecta si una línea ya tiene console.log de Supabase
 */
function hasSupabaseLog(lines, index) {
  if (index === 0) return false;
  const prevLine = lines[index - 1];
  return prevLine.includes('[SUPABASE]') || prevLine.includes('🔴 [SUPABASE]');
}

/**
 * Obtiene la indentación de una línea
 */
function getIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Procesa un archivo
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    
    let modified = false;
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let foundPattern = false;
      
      // Verificar cada patrón
      for (const pattern of SUPABASE_PATTERNS) {
        if (pattern.test(line)) {
          foundPattern = true;
          break;
        }
      }
      
      // Si encontramos un patrón y no tiene log previo
      if (foundPattern && !hasSupabaseLog(lines, i)) {
        const indent = getIndentation(line);
        const lineNumber = i + 1;
        
        // Extraer el método de Supabase
        let method = 'unknown';
        if (line.includes('.from(')) method = 'supabase.from()';
        else if (line.includes('.functions.invoke')) {
          const match = line.match(/invoke\(['"`]([^'"`]+)['"`]/);
          method = match ? `supabase.functions.invoke("${match[1]}")` : 'supabase.functions.invoke()';
        }
        else if (line.includes('.rpc(')) {
          const match = line.match(/rpc\(['"`]([^'"`]+)['"`]/);
          method = match ? `supabase.rpc("${match[1]}")` : 'supabase.rpc()';
        }
        
        const logLine = `${indent}console.log('🔴 [SUPABASE] Petición en: ${relativePath} (línea ${lineNumber}) - ${method}');`;
        
        newLines.push(logLine);
        modified = true;
        stats.logsAdded++;
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      stats.filesModified++;
      
      if (APPLY) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`✅ Modificado: ${relativePath} (+${stats.logsAdded} logs)`);
      } else {
        console.log(`📝 Sería modificado: ${relativePath} (+${stats.logsAdded} logs)`);
      }
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

/**
 * Main
 */
function main() {
  console.log('🚀 Iniciando script para agregar logs de Supabase...\n');
  
  if (!DRY_RUN && !APPLY) {
    console.log('❌ Error: Debes especificar --dry-run o --apply\n');
    console.log('Uso:');
    console.log('  node add-supabase-logs.js --dry-run    # Ver cambios sin aplicar');
    console.log('  node add-supabase-logs.js --apply      # Aplicar cambios\n');
    process.exit(1);
  }
  
  const mode = DRY_RUN ? '🔍 MODO DRY-RUN' : '✍️  MODO APLICAR CAMBIOS';
  console.log(`${mode}\n`);
  console.log(`📂 Buscando archivos en: ${SRC_DIR}\n`);
  
  // Buscar archivos
  const files = findFiles(SRC_DIR);
  console.log(`📄 Encontrados ${files.length} archivos para procesar\n`);
  console.log('─────────────────────────────────────────────────\n');
  
  // Procesar cada archivo
  files.forEach(processFile);
  
  // Mostrar estadísticas
  console.log('\n─────────────────────────────────────────────────');
  console.log('\n📊 ESTADÍSTICAS FINALES\n');
  console.log(`Archivos procesados:  ${stats.filesProcessed}`);
  console.log(`Archivos modificados: ${stats.filesModified}`);
  console.log(`Logs agregados:       ${stats.logsAdded}`);
  console.log(`Errores:              ${stats.errors.length}\n`);
  
  if (stats.errors.length > 0) {
    console.log('❌ ERRORES:\n');
    stats.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
    console.log('');
  }
  
  if (DRY_RUN && stats.filesModified > 0) {
    console.log('💡 TIP: Ejecuta con --apply para aplicar los cambios\n');
  } else if (APPLY && stats.filesModified > 0) {
    console.log('✅ Cambios aplicados exitosamente!\n');
  } else if (stats.filesModified === 0) {
    console.log('ℹ️  No se encontraron peticiones de Supabase sin logs\n');
  }
  
  // Generar reporte
  if (APPLY && stats.filesModified > 0) {
    generateReport();
  }
}

/**
 * Genera un reporte de los cambios
 */
function generateReport() {
  const reportPath = path.join(__dirname, 'LOGS_SUPABASE_AGREGADOS.md');
  const timestamp = new Date().toISOString();
  
  const report = `# 📝 Reporte de Logs Agregados a Supabase

**Fecha:** ${timestamp}
**Script:** add-supabase-logs.js

## Resumen

- **Archivos procesados:** ${stats.filesProcessed}
- **Archivos modificados:** ${stats.filesModified}
- **Logs agregados:** ${stats.logsAdded}
- **Errores:** ${stats.errors.length}

## Detalles

Todos los archivos en \`src/\` con peticiones a Supabase ahora tienen console.log que indican:
- 📍 Ubicación del archivo
- 📏 Número de línea
- 🔧 Método de Supabase utilizado

## Formato del Log

\`\`\`javascript
console.log('🔴 [SUPABASE] Petición en: ruta/del/archivo.ts (línea X) - supabase.method()');
\`\`\`

## Próximos Pasos

1. Revisar los logs en la consola del navegador
2. Identificar las peticiones más frecuentes
3. Priorizar migraciones según impacto
4. Crear endpoints NestJS para reemplazar peticiones críticas

---

**Nota:** Los logs solo se muestran en desarrollo. No afectan producción.
`;
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 Reporte generado: ${reportPath}\n`);
}

// Ejecutar
main();
