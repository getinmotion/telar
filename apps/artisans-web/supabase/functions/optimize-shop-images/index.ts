import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopImage {
  path: string;
  bucket: string;
  type: 'banner' | 'logo' | 'product';
  originalUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { shop_id, dry_run = false } = await req.json();

    if (!shop_id) {
      throw new Error('shop_id is required');
    }

    console.log(`[optimize-shop-images] Starting optimization for shop: ${shop_id}, dry_run: ${dry_run}`);

    // Get shop data
    const { data: shop, error: shopError } = await supabase
      .from('artisan_shops')
      .select('id, shop_name, banner_url, logo_url')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      throw new Error(`Shop not found: ${shopError?.message || 'Unknown error'}`);
    }

    console.log(`[optimize-shop-images] Found shop: ${shop.shop_name}`);

    // Get products for this shop
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('shop_id', shop_id);

    if (productsError) {
      console.error('[optimize-shop-images] Error fetching products:', productsError);
    }

    // Collect all images to optimize
    const imagesToOptimize: ShopImage[] = [];

    // Add banner
    if (shop.banner_url) {
      const parsed = parseStorageUrl(shop.banner_url);
      if (parsed && !isAlreadyOptimized(parsed.path)) {
        imagesToOptimize.push({
          path: parsed.path,
          bucket: parsed.bucket,
          type: 'banner',
          originalUrl: shop.banner_url
        });
      }
    }

    // Add logo
    if (shop.logo_url) {
      const parsed = parseStorageUrl(shop.logo_url);
      if (parsed && !isAlreadyOptimized(parsed.path)) {
        imagesToOptimize.push({
          path: parsed.path,
          bucket: parsed.bucket,
          type: 'logo',
          originalUrl: shop.logo_url
        });
      }
    }

    // Add product images
    if (products) {
      for (const product of products) {
        const images = product.images as string[] | null;
        if (images && Array.isArray(images)) {
          for (const imageUrl of images) {
            const parsed = parseStorageUrl(imageUrl);
            if (parsed && !isAlreadyOptimized(parsed.path)) {
              imagesToOptimize.push({
                path: parsed.path,
                bucket: parsed.bucket,
                type: 'product',
                originalUrl: imageUrl
              });
            }
          }
        }
      }
    }

    console.log(`[optimize-shop-images] Found ${imagesToOptimize.length} images to optimize`);

    const results: Array<{
      path: string;
      type: string;
      originalSize: number;
      optimizedSize?: number;
      savingsPercent?: number;
      newUrl?: string;
      status: 'success' | 'skipped' | 'error';
      error?: string;
    }> = [];

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const image of imagesToOptimize) {
      try {
        console.log(`[optimize-shop-images] Processing: ${image.bucket}/${image.path}`);

        // Download original file to get size
        const { data: originalFile, error: downloadError } = await supabase.storage
          .from(image.bucket)
          .download(image.path);

        if (downloadError || !originalFile) {
          console.error(`[optimize-shop-images] Download error for ${image.path}:`, downloadError);
          results.push({
            path: image.path,
            type: image.type,
            originalSize: 0,
            status: 'error',
            error: downloadError?.message || 'Download failed'
          });
          continue;
        }

        const originalSize = originalFile.size;
        totalOriginalSize += originalSize;

        console.log(`[optimize-shop-images] Original size: ${formatBytes(originalSize)}`);

        if (dry_run) {
          // In dry run, estimate savings (typically 60-80% for PNG->WebP)
          const estimatedOptimizedSize = Math.round(originalSize * 0.3);
          const savingsPercent = Math.round((1 - estimatedOptimizedSize / originalSize) * 100);
          
          results.push({
            path: image.path,
            type: image.type,
            originalSize,
            optimizedSize: estimatedOptimizedSize,
            savingsPercent,
            status: 'success'
          });
          
          totalOptimizedSize += estimatedOptimizedSize;
          continue;
        }

        // Get optimized version using Supabase transforms
        const transformedUrl = `${supabaseUrl}/storage/v1/render/image/public/${image.bucket}/${image.path}?quality=80&format=origin`;
        
        const response = await fetch(transformedUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        });

        if (!response.ok) {
          throw new Error(`Transform failed: ${response.status} ${response.statusText}`);
        }

        const optimizedBlob = await response.blob();
        const optimizedSize = optimizedBlob.size;
        
        // Create new filename with .webp extension
        const pathParts = image.path.split('/');
        const fileName = pathParts.pop()!;
        const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
        const newFileName = `${fileNameWithoutExt}.webp`;
        const newPath = [...pathParts, newFileName].join('/');

        console.log(`[optimize-shop-images] Uploading optimized: ${newPath} (${formatBytes(optimizedSize)})`);

        // Upload optimized file
        const { error: uploadError } = await supabase.storage
          .from(image.bucket)
          .upload(newPath, optimizedBlob, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get new public URL
        const { data: publicUrlData } = supabase.storage
          .from(image.bucket)
          .getPublicUrl(newPath);

        const newUrl = publicUrlData.publicUrl;
        const savingsPercent = Math.round((1 - optimizedSize / originalSize) * 100);

        // Update database reference
        await updateDatabaseUrl(supabase, shop_id, image, newUrl, products);

        // Log the optimization
        await supabase.from('image_optimization_log').insert({
          bucket_id: image.bucket,
          original_path: image.path,
          optimized_path: newPath,
          original_size_bytes: originalSize,
          optimized_size_bytes: optimizedSize,
          savings_percent: savingsPercent,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

        results.push({
          path: image.path,
          type: image.type,
          originalSize,
          optimizedSize,
          savingsPercent,
          newUrl,
          status: 'success'
        });

        totalOptimizedSize += optimizedSize;
        console.log(`[optimize-shop-images] ✓ Optimized ${image.path}: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savingsPercent}% savings)`);

      } catch (error) {
        console.error(`[optimize-shop-images] Error processing ${image.path}:`, error);
        results.push({
          path: image.path,
          type: image.type,
          originalSize: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const savingsPercent = totalOriginalSize > 0 
      ? Math.round((totalSavings / totalOriginalSize) * 100) 
      : 0;

    const summary = {
      shop_name: shop.shop_name,
      total_images: imagesToOptimize.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      total_original_size: totalOriginalSize,
      total_optimized_size: totalOptimizedSize,
      total_savings: totalSavings,
      savings_percent: savingsPercent,
      dry_run,
      results
    };

    console.log(`[optimize-shop-images] Complete. ${dry_run ? '[DRY RUN] ' : ''}Savings: ${formatBytes(totalSavings)} (${savingsPercent}%)`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[optimize-shop-images] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  if (!url) return null;
  
  // Pattern: /storage/v1/object/public/bucket-name/path/to/file
  const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
  if (match) {
    return { bucket: match[1], path: match[2] };
  }
  
  return null;
}

function isAlreadyOptimized(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return lowerPath.endsWith('.webp');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function updateDatabaseUrl(
  supabase: any, 
  shopId: string, 
  image: ShopImage, 
  newUrl: string,
  products: any[] | null
) {
  if (image.type === 'banner') {
    await supabase
      .from('artisan_shops')
      .update({ banner_url: newUrl })
      .eq('id', shopId);
    console.log(`[optimize-shop-images] Updated banner_url for shop ${shopId}`);
  } else if (image.type === 'logo') {
    await supabase
      .from('artisan_shops')
      .update({ logo_url: newUrl })
      .eq('id', shopId);
    console.log(`[optimize-shop-images] Updated logo_url for shop ${shopId}`);
  } else if (image.type === 'product' && products) {
    // Find the product that has this image and update it
    for (const product of products) {
      const images = product.images as string[] | null;
      if (images && images.includes(image.originalUrl)) {
        const updatedImages = images.map(img => 
          img === image.originalUrl ? newUrl : img
        );
        await supabase
          .from('products')
          .update({ images: updatedImages })
          .eq('id', product.id);
        console.log(`[optimize-shop-images] Updated images for product ${product.id}`);
        break;
      }
    }
  }
}
