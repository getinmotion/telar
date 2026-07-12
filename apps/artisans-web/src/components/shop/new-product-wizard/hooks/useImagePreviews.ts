import { useEffect, useMemo } from 'react';

/**
 * Convierte el arreglo de imágenes del wizard (File | string) en URLs
 * previsualizables estables: los strings pasan tal cual y los File se
 * convierten una sola vez en objectURLs, revocados al cambiar o desmontar.
 */
export const useImagePreviews = (images: (File | string)[]): string[] => {
  const urls = useMemo(
    () =>
      images
        .filter(Boolean)
        .map(img => (typeof img === 'string' ? img : URL.createObjectURL(img))),
    [images],
  );

  useEffect(() => {
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [urls]);

  return urls;
};
