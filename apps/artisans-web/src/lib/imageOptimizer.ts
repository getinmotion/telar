/**
 * Image Optimization Service
 * Compresses and converts images to WebP format before upload
 * Reduces file sizes by 60-80% while maintaining quality
 */

export interface OptimizeOptions {
  /** Maximum width in pixels (default: 1920) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1920) */
  maxHeight?: number;
  /** Quality from 0 to 1 (default: 0.85) */
  quality?: number;
  /** Output format (default: 'webp', fallback to 'jpeg') */
  format?: 'webp' | 'jpeg';
  /** Skip optimization for small files under this size in bytes (default: 50KB) */
  skipIfUnder?: number;
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'webp',
  skipIfUnder: 50 * 1024, // 50KB
};

/**
 * Check if browser supports WebP encoding
 */
const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Load an image file into an HTMLImageElement
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  // If image is already smaller than max, return original dimensions
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > height) {
    // Landscape
    const newWidth = Math.min(width, maxWidth);
    const newHeight = Math.round(newWidth / aspectRatio);

    if (newHeight > maxHeight) {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight,
      };
    }

    return { width: newWidth, height: newHeight };
  } else {
    // Portrait or square
    const newHeight = Math.min(height, maxHeight);
    const newWidth = Math.round(newHeight * aspectRatio);

    if (newWidth > maxWidth) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    }

    return { width: newWidth, height: newHeight };
  }
};

/**
 * Convert canvas to File with specified format
 */
const canvasToFile = (
  canvas: HTMLCanvasElement,
  fileName: string,
  format: 'webp' | 'jpeg',
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
    const extension = format === 'webp' ? '.webp' : '.jpg';

    // Remove original extension and add new one
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}${extension}`;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }

        const file = new File([blob], newFileName, { type: mimeType });
        resolve(file);
      },
      mimeType,
      quality
    );
  });
};

/**
 * Optimize a single image file
 * - Resizes to max dimensions while maintaining aspect ratio
 * - Converts to WebP (or JPEG fallback)
 * - Compresses with specified quality
 * 
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Optimized File object
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip if file is very small (already optimized)
  if (file.size < opts.skipIfUnder) {
    console.log(`[ImageOptimizer] Skipping ${file.name} (${Math.round(file.size / 1024)}KB < ${Math.round(opts.skipIfUnder / 1024)}KB threshold)`);
    return file;
  }

  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    console.warn(`[ImageOptimizer] Skipping non-image file: ${file.name}`);
    return file;
  }

  // Skip GIFs (animated) and SVGs (vector)
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    console.log(`[ImageOptimizer] Skipping ${file.type}: ${file.name}`);
    return file;
  }

  try {
    console.log(`[ImageOptimizer] Processing ${file.name} (${Math.round(file.size / 1024)}KB)`);

    // Load image
    const img = await loadImage(file);

    // Calculate new dimensions
    const { width, height } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth,
      opts.maxHeight
    );

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Determine output format (WebP with JPEG fallback)
    const outputFormat = opts.format === 'webp' && supportsWebP() ? 'webp' : 'jpeg';

    // Convert to file
    const optimizedFile = await canvasToFile(canvas, file.name, outputFormat, opts.quality);

    const savings = Math.round((1 - optimizedFile.size / file.size) * 100);
    console.log(
      `[ImageOptimizer] ✅ Optimized ${file.name}: ${Math.round(file.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB (${savings}% smaller, ${width}x${height})`
    );

    return optimizedFile;
  } catch (error) {
    console.error(`[ImageOptimizer] Error optimizing ${file.name}:`, error);
    // Return original file on error
    return file;
  }
}

/**
 * Optimize multiple images in parallel
 * 
 * @param files - Array of image files to optimize
 * @param options - Optimization options applied to all images
 * @returns Array of optimized File objects
 */
export async function optimizeImages(
  files: File[],
  options: OptimizeOptions = {}
): Promise<File[]> {
  console.log(`[ImageOptimizer] Optimizing ${files.length} images...`);

  const optimizedFiles = await Promise.all(
    files.map((file) => optimizeImage(file, options))
  );

  // Log total savings
  const originalSize = files.reduce((sum, f) => sum + f.size, 0);
  const optimizedSize = optimizedFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSavings = Math.round((1 - optimizedSize / originalSize) * 100);

  return optimizedFiles;
}

/**
 * Preset configurations for common use cases
 */
export const ImageOptimizePresets = {
  /** For product images - high quality, reasonable size */
  product: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'webp' as const,
  },
  /** For hero/banner images - larger dimensions */
  hero: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp' as const,
  },
  /** For thumbnails - small and fast loading */
  thumbnail: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    format: 'webp' as const,
  },
  /** For logos - maintain quality */
  logo: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.9,
    format: 'webp' as const,
  },
  /** For avatars - small profile pictures */
  avatar: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.85,
    format: 'webp' as const,
  },
};
