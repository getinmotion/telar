import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OptimizationRequest {
  bucketId: string;
  batchSize?: number;
  dryRun?: boolean;
  maxWidth?: number;
  quality?: number;
  replaceOriginal?: boolean;
}

interface OptimizationResult {
  processed: number;
  skipped: number;
  failed: number;
  totalSavingsBytes: number;
  details: Array<{
    path: string;
    originalSize: number;
    optimizedSize?: number;
    savingsPercent?: number;
    status: string;
    error?: string;
  }>;
}

// Helper to get optimized image using Supabase Storage transforms
async function getOptimizedImage(
  supabaseUrl: string,
  supabaseServiceKey: string,
  bucketId: string,
  filePath: string,
  width: number,
  quality: number
): Promise<{ data: Blob | null; error: string | null }> {
  try {
    // Use Supabase Storage transform API to get optimized image
    // Format: /storage/v1/render/image/public/{bucket}/{path}?width=X&quality=Y
    const transformUrl = `${supabaseUrl}/storage/v1/render/image/public/${bucketId}/${filePath}?width=${width}&quality=${quality}`;
    
    console.log(`📸 Fetching optimized image from: ${transformUrl}`);
    
    const response = await fetch(transformUrl, {
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!response.ok) {
      // If transform fails, try direct download and return original
      console.log(`⚠️ Transform API failed, trying direct download...`);
      return { data: null, error: `Transform failed: ${response.status}` };
    }

    const blob = await response.blob();
    return { data: blob, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Recursively list all files in a bucket (including subdirectories)
async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucketId: string,
  path: string = ""
): Promise<Array<{ name: string; path: string; metadata: { size: number } | null }>> {
  const allFiles: Array<{ name: string; path: string; metadata: { size: number } | null }> = [];
  
  const { data: items, error } = await supabase.storage
    .from(bucketId)
    .list(path, { limit: 1000 });

  if (error || !items) {
    console.error(`Error listing files in ${path}:`, error);
    return allFiles;
  }

  for (const item of items) {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    
    if (item.id === null) {
      // It's a folder, recurse into it
      const subFiles = await listAllFiles(supabase, bucketId, fullPath);
      allFiles.push(...subFiles);
    } else {
      // It's a file
      allFiles.push({
        name: item.name,
        path: fullPath,
        metadata: item.metadata as { size: number } | null,
      });
    }
  }

  return allFiles;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .eq("is_active", true)
      .single();

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden ejecutar esta función" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: OptimizationRequest = await req.json();
    const {
      bucketId,
      batchSize = 10,
      dryRun = false,
      maxWidth = 1200,
      quality = 75,
      replaceOriginal = false,
    } = body;

    if (!bucketId) {
      return new Response(
        JSON.stringify({ error: "bucketId es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🚀 Starting image optimization for bucket: ${bucketId}`);
    console.log(`📊 Config: batchSize=${batchSize}, dryRun=${dryRun}, maxWidth=${maxWidth}, quality=${quality}, replaceOriginal=${replaceOriginal}`);

    // List all files in bucket recursively
    const allFiles = await listAllFiles(supabase, bucketId);
    
    console.log(`📁 Found ${allFiles.length} total files in bucket`);

    const result: OptimizationResult = {
      processed: 0,
      skipped: 0,
      failed: 0,
      totalSavingsBytes: 0,
      details: [],
    };

    // Filter only image files
    const imageFiles = allFiles.filter((file) => {
      const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      // Skip already optimized files
      const isAlreadyOptimized = file.path.includes("_optimized");
      return isImage && !isAlreadyOptimized;
    });

    console.log(`🖼️ Found ${imageFiles.length} image files to potentially process`);

    // Check which files have already been processed
    const { data: processedFiles } = await supabase
      .from("image_optimization_log")
      .select("original_path")
      .eq("bucket_id", bucketId)
      .in("status", ["completed", "skipped"]);

    const processedPaths = new Set((processedFiles || []).map((f) => f.original_path));

    // Process images in batch
    const filesToProcess = imageFiles
      .filter((file) => !processedPaths.has(file.path))
      .slice(0, batchSize);

    console.log(`📦 Processing ${filesToProcess.length} files in this batch`);

    for (const file of filesToProcess) {
      const filePath = file.path;
      const originalSize = file.metadata?.size || 0;

      try {
        console.log(`\n⏳ Processing: ${filePath} (${Math.round(originalSize / 1024)}KB)`);

        // Skip if already WebP and small enough
        if (filePath.endsWith(".webp") && originalSize < 50 * 1024) {
          console.log(`⏭️ Skipping ${filePath} - already WebP and small`);
          
          if (!dryRun) {
            await supabase.from("image_optimization_log").insert({
              bucket_id: bucketId,
              original_path: filePath,
              original_size_bytes: originalSize,
              status: "skipped",
              processed_at: new Date().toISOString(),
            });
          }

          result.skipped++;
          result.details.push({
            path: filePath,
            originalSize,
            status: "skipped",
          });
          continue;
        }

        // Skip very small images (under 10KB)
        if (originalSize < 10 * 1024) {
          console.log(`⏭️ Skipping ${filePath} - too small to optimize`);
          
          if (!dryRun) {
            await supabase.from("image_optimization_log").insert({
              bucket_id: bucketId,
              original_path: filePath,
              original_size_bytes: originalSize,
              status: "skipped",
              processed_at: new Date().toISOString(),
            });
          }

          result.skipped++;
          result.details.push({
            path: filePath,
            originalSize,
            status: "skipped",
          });
          continue;
        }

        if (dryRun) {
          // In dry run, estimate savings based on format and size
          const isWebP = filePath.toLowerCase().endsWith('.webp');
          const estimatedSavingsPercent = isWebP ? 20 : 50;
          const estimatedOptimizedSize = Math.round(originalSize * (1 - estimatedSavingsPercent / 100));

          result.processed++;
          result.totalSavingsBytes += originalSize - estimatedOptimizedSize;
          result.details.push({
            path: filePath,
            originalSize,
            optimizedSize: estimatedOptimizedSize,
            savingsPercent: estimatedSavingsPercent,
            status: "dry_run",
          });

          console.log(`🧪 [DRY RUN] Would optimize: ${filePath} (est. ${estimatedSavingsPercent}% savings)`);
          continue;
        }

        // Use Supabase Storage transform to get optimized image
        const { data: optimizedBlob, error: transformError } = await getOptimizedImage(
          supabaseUrl,
          supabaseServiceKey,
          bucketId,
          filePath,
          maxWidth,
          quality
        );

        if (transformError || !optimizedBlob) {
          // Fallback: download original and re-upload (minimal optimization via WebP)
          console.log(`⚠️ Transform failed, trying fallback approach...`);
          
          const { data: originalData, error: downloadError } = await supabase.storage
            .from(bucketId)
            .download(filePath);

          if (downloadError || !originalData) {
            throw new Error(`Download failed: ${downloadError?.message || "Unknown error"}`);
          }

          // Log as needing client-side optimization
          await supabase.from("image_optimization_log").insert({
            bucket_id: bucketId,
            original_path: filePath,
            original_size_bytes: originalSize,
            status: "pending_client",
            error_message: "Requires client-side optimization",
            processed_at: new Date().toISOString(),
          });

          result.processed++;
          result.details.push({
            path: filePath,
            originalSize,
            status: "pending_client",
          });
          continue;
        }

        const optimizedSize = optimizedBlob.size;
        const savingsPercent = Math.round((1 - optimizedSize / originalSize) * 100);

        console.log(`📊 Optimization result: ${Math.round(originalSize / 1024)}KB → ${Math.round(optimizedSize / 1024)}KB (${savingsPercent}% savings)`);

        // Only proceed if we actually saved space
        if (optimizedSize >= originalSize) {
          console.log(`⏭️ Skipping upload - no size reduction achieved`);
          
          await supabase.from("image_optimization_log").insert({
            bucket_id: bucketId,
            original_path: filePath,
            original_size_bytes: originalSize,
            optimized_size_bytes: optimizedSize,
            savings_percent: 0,
            status: "skipped",
            processed_at: new Date().toISOString(),
          });

          result.skipped++;
          result.details.push({
            path: filePath,
            originalSize,
            optimizedSize,
            savingsPercent: 0,
            status: "skipped",
          });
          continue;
        }

        // Convert blob to array buffer for upload
        const optimizedBuffer = await optimizedBlob.arrayBuffer();
        const optimizedUint8 = new Uint8Array(optimizedBuffer);

        // Determine upload path
        let uploadPath: string;
        if (replaceOriginal) {
          uploadPath = filePath;
        } else {
          // Create optimized version with suffix
          const pathParts = filePath.split('.');
          const extension = pathParts.pop();
          const basePath = pathParts.join('.');
          uploadPath = `${basePath}_optimized.webp`;
        }

        // Upload optimized image
        const { error: uploadError } = await supabase.storage
          .from(bucketId)
          .upload(uploadPath, optimizedUint8, {
            contentType: 'image/webp',
            upsert: replaceOriginal,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Log success
        await supabase.from("image_optimization_log").insert({
          bucket_id: bucketId,
          original_path: filePath,
          optimized_path: uploadPath,
          original_size_bytes: originalSize,
          optimized_size_bytes: optimizedSize,
          savings_percent: savingsPercent,
          status: "completed",
          processed_at: new Date().toISOString(),
        });

        result.processed++;
        result.totalSavingsBytes += originalSize - optimizedSize;
        result.details.push({
          path: filePath,
          originalSize,
          optimizedSize,
          savingsPercent,
          status: "completed",
        });

        console.log(`✅ Optimized: ${filePath} → ${uploadPath}`);

      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
        
        await supabase.from("image_optimization_log").insert({
          bucket_id: bucketId,
          original_path: filePath,
          original_size_bytes: originalSize,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          processed_at: new Date().toISOString(),
        });

        result.failed++;
        result.details.push({
          path: filePath,
          originalSize,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Get overall stats
    const { data: stats } = await supabase
      .from("image_optimization_stats")
      .select("*")
      .eq("bucket_id", bucketId)
      .single();

    console.log(`\n🎉 Batch complete:`, {
      processed: result.processed,
      skipped: result.skipped,
      failed: result.failed,
      totalSavingsBytes: result.totalSavingsBytes,
      remainingInBucket: imageFiles.length - filesToProcess.length - processedPaths.size,
    });

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        bucketId,
        result,
        stats,
        remainingFiles: Math.max(0, imageFiles.length - processedPaths.size - filesToProcess.length),
        totalImages: imageFiles.length,
        alreadyProcessed: processedPaths.size,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
