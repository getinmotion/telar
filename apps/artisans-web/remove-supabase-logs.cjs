const fs = require('fs');
const path = require('path');

// ============= Configuration =============
const SRC_DIR = path.join(__dirname, 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const LOG_PATTERN = /^\s*console\.log\(['"]🔴 \[SUPABASE\].*?\);?\s*$/gm;

// ============= Stats =============
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  logsRemoved: 0,
  errors: 0
};

// ============= Utility Functions =============

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return false;
  
  // Skip node_modules, dist, build, etc.
  if (filePath.includes('node_modules')) return false;
  if (filePath.includes('dist')) return false;
  if (filePath.includes('build')) return false;
  if (filePath.includes('.git')) return false;
  
  return true;
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function removeSupabaseLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const originalLineCount = lines.length;
    
    // Remove lines that match the pattern
    const filteredLines = [];
    let logsRemovedInFile = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line matches the Supabase log pattern
      if (/^\s*console\.log\(['"]🔴 \[SUPABASE\]/.test(line)) {
        logsRemovedInFile++;
        // Skip this line (don't add to filtered)
        continue;
      }
      
      filteredLines.push(line);
    }
    
    // Only write if changes were made
    if (logsRemovedInFile > 0) {
      const newContent = filteredLines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf-8');
      stats.filesModified++;
      stats.logsRemoved += logsRemovedInFile;
      
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      console.log(`✅ ${relativePath} (-${logsRemovedInFile} logs)`);
      
      return logsRemovedInFile;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
    return 0;
  }
}

// ============= Main Execution =============

function main() {
  console.log('🧹 Iniciando eliminación de logs de Supabase...\n');
  console.log(`📂 Buscando archivos en: ${SRC_DIR}\n`);
  
  const files = getAllFiles(SRC_DIR);
  stats.filesProcessed = files.length;
  
  console.log(`📄 Encontrados ${files.length} archivos para procesar\n`);
  console.log('─────────────────────────────────────────────────\n');
  
  // Process each file
  files.forEach(file => {
    removeSupabaseLogs(file);
  });
  
  // Print summary
  console.log('\n─────────────────────────────────────────────────\n');
  console.log('📊 ESTADÍSTICAS FINALES\n');
  console.log(`Archivos procesados:  ${stats.filesProcessed}`);
  console.log(`Archivos modificados: ${stats.filesModified}`);
  console.log(`Logs eliminados:      ${stats.logsRemoved}`);
  console.log(`Errores:              ${stats.errors}`);
  console.log('\n✅ Eliminación completada!\n');
  
  // Generate report
  const reportPath = path.join(__dirname, 'LOGS_SUPABASE_ELIMINADOS.md');
  const report = `# 🧹 Reporte de Eliminación de Logs de Supabase

**Fecha:** ${new Date().toISOString().split('T')[0]}

## 📊 Resumen

- **Archivos procesados:** ${stats.filesProcessed}
- **Archivos modificados:** ${stats.filesModified}
- **Logs eliminados:** ${stats.logsRemoved}
- **Errores:** ${stats.errors}

## ✅ Resultado

Todos los \`console.log\` con el patrón \`🔴 [SUPABASE]\` han sido eliminados exitosamente.

## 🔍 Patrón Eliminado

\`\`\`typescript
console.log('🔴 [SUPABASE] Petición en: ...');
\`\`\`

---

**Nota:** Este reporte se generó automáticamente por el script \`remove-supabase-logs.cjs\`.
`;
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`📄 Reporte generado: LOGS_SUPABASE_ELIMINADOS.md\n`);
}

// Run
main();
