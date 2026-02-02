#!/usr/bin/env node

/**
 * Script para generar embeddings de todos los productos en la base de datos
 * Esto habilita la búsqueda semántica usando IA
 * 
 * Uso: node scripts/generate-embeddings.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuración
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SEMANTIC_API_URL = process.env.VITE_SEMANTIC_SEARCH_API_URL;
const SEMANTIC_API_KEY = process.env.VITE_SEMANTIC_SEARCH_API_KEY;

// Validar configuración
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env');
  process.exit(1);
}

if (!SEMANTIC_API_URL || !SEMANTIC_API_KEY) {
  console.error('❌ Error: Faltan credenciales de la API de búsqueda semántica en .env');
  process.exit(1);
}

// Cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Genera un embedding para un producto
 */
async function generateEmbedding(product) {
  try {
    const payload = {
      shop_id: product.shop_id || '00000000-0000-0000-0000-000000000000',
      product_id: product.id,
      shop_name: product.store_name || 'Tienda Artesanal',
      description: product.store_description || '',
      story: '',
      craft_type: product.craft || 'Artesanía',
      region: product.region || 'Colombia',
      product_name: product.name,
      product_description: product.description || product.short_description || '',
      price: parseFloat(product.price) || 0,
      category: product.original_category || product.category || 'General',
    };

    const response = await fetch(`${SEMANTIC_API_URL}/api/v1/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SEMANTIC_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando generación de embeddings...\n');
  console.log('📊 Configuración:');
  console.log(`   - Supabase: ${SUPABASE_URL}`);
  console.log(`   - API Semántica: ${SEMANTIC_API_URL}`);
  console.log('');

  // 1. Obtener todos los productos
  console.log('📥 Consultando productos...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error al consultar productos:', error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('⚠️  No se encontraron productos en la base de datos');
    process.exit(0);
  }

  console.log(`✅ ${products.length} productos encontrados\n`);

  // 2. Generar embeddings para cada producto
  console.log('🔄 Generando embeddings...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${products.length}]`;
    
    process.stdout.write(`${progress} Procesando: ${product.name.substring(0, 40)}...`);

    const result = await generateEmbedding(product);

    if (result.success) {
      successCount++;
      console.log(' ✅');
    } else {
      errorCount++;
      console.log(` ❌ Error: ${result.error}`);
      errors.push({
        product: product.name,
        error: result.error,
      });
    }

    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 3. Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📦 Total: ${products.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Productos con errores:');
    errors.forEach(({ product, error }) => {
      console.log(`   - ${product}: ${error}`);
    });
  }

  console.log('\n✨ Proceso completado!');
  
  if (successCount > 0) {
    console.log('\n🎉 La búsqueda semántica ya está activa en tu aplicación!');
    console.log('   Recarga la página y prueba buscar algo como:');
    console.log('   - "regalo para mamá"');
    console.log('   - "decoración navideña"');
    console.log('   - "artesanía tradicional"');
  }
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

