
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface OptimizedCharacterImageProps {
  src: string;
  alt: string;
  className?: string;
  preloadNext?: string;
}

export const OptimizedCharacterImage: React.FC<OptimizedCharacterImageProps> = React.memo(({ 
  src, 
  alt, 
  className = "w-full h-auto object-contain max-h-80",
  preloadNext 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Fallback image - using a direct public path
  const fallbackImage = '/lovable-uploads/4d2abc22-b792-462b-8247-6cc413c71b23.png';

  const handleLoad = useCallback(() => {
    console.log('✅ SUCCESS: Image loaded successfully');
    console.log('   - Image source:', imgSrc);
    console.log('   - Original prop src:', src);
    console.log('   - Alt text:', alt);
    setIsLoaded(true);
    setHasError(false);
    
    // Preload next image if provided
    if (preloadNext && preloadNext !== imgSrc) {
      const img = new Image();
      img.src = preloadNext;
      console.log('🔄 Preloading next image:', preloadNext);
    }
  }, [preloadNext, imgSrc, src, alt]);

  const handleError = useCallback(() => {
    console.error('❌ FAILED: Image failed to load');
    console.error('   - Failed source:', imgSrc);
    console.error('   - Original prop src:', src);
    console.error('   - Alt text:', alt);
    console.error('   - Will try fallback:', fallbackImage);
    
    if (imgSrc !== fallbackImage) {
      console.log('🔄 RETRY: Switching to fallback image');
      setImgSrc(fallbackImage);
      setHasError(false);
      setIsLoaded(false);
    } else {
      console.error('💥 CRITICAL: Even fallback image failed to load');
      setHasError(true);
    }
  }, [imgSrc, fallbackImage, src, alt]);

  // Update src when prop changes and ensure we always have a valid source
  React.useEffect(() => {
    console.log('🔍 EFFECT: OptimizedCharacterImage useEffect triggered');
    console.log('   - New src prop:', src);
    console.log('   - Current imgSrc state:', imgSrc);
    console.log('   - Has error:', hasError);
    console.log('   - Is loaded:', isLoaded);
    
    const validSrc = src || fallbackImage;
    console.log('   - Resolved valid src:', validSrc);
    
    if (validSrc !== imgSrc && !hasError) {
      console.log('🔄 UPDATING: Image source changed');
      console.log('   - From:', imgSrc);
      console.log('   - To:', validSrc);
      setImgSrc(validSrc);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, imgSrc, hasError, fallbackImage, isLoaded]);

  // If all images fail, show a styled placeholder
  if (hasError) {
    console.log('📦 PLACEHOLDER: Showing placeholder due to image error');
    return (
      <div className={`${className} bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border border-border`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-muted-foreground text-sm font-medium">Assessment Guide</span>
        </div>
      </div>
    );
  }

  console.log('🖼️ RENDER: Rendering image component');
  console.log('   - Current imgSrc:', imgSrc);
  console.log('   - Is loaded:', isLoaded);
  console.log('   - Has error:', hasError);

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
          <div className="w-8 h-8 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className={isLoaded ? "relative" : "absolute inset-0"}
      >
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          decoding="async"
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      </motion.div>
    </div>
  );
});

OptimizedCharacterImage.displayName = 'OptimizedCharacterImage';
