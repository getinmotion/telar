/**
 * File Upload Service - Centralized API calls to NestJS backend
 *
 * Reemplaza todos los uploads directos a Supabase Storage.
 * Las imágenes se almacenan en S3 bajo la ruta: images/{folder}/{timestamp}_{random}.{ext}
 */

import { telarApi } from '@/integrations/api/telarApi';

/** Carpetas disponibles en S3 (deben coincidir con UploadFolder en el backend) */
export enum UploadFolder {
  PRODUCTS = 'products',
  SHOPS = 'shops',
  PROFILES = 'profiles',
  BRANDS = 'brands',
  CATEGORIES = 'categories',
  HERO = 'hero',
  CMS = 'cms',
  OTHER = 'other',
}

export interface UploadResult {
  key: string;         // e.g. 'images/products/1234567890_0.jpg'
  url: string;         // URL pública completa
  bucket: string;
  size: number;
  contentType: string;
}

/**
 * Sube una imagen a S3
 * Endpoint: POST /file-upload/image
 */
export const uploadImage = async (
  file: File | Blob,
  folder: UploadFolder,
  fileName?: string,
  options?: { suppressToast?: boolean },
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file, fileName ?? (file instanceof File ? file.name : 'image.jpg'));
  formData.append('folder', folder);

  const response = await telarApi.post<UploadResult>('/file-upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    _suppressToast: options?.suppressToast,
  } as any);

  return response.data;
};

/**
 * Sube múltiples imágenes a S3 (máximo 10)
 * Endpoint: POST /file-upload/images/multiple
 */
export const uploadMultipleImages = async (
  files: (File | Blob)[],
  folder: UploadFolder,
): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    const name = file instanceof File ? file.name : `image_${index}.jpg`;
    formData.append('files', file, name);
  });
  formData.append('folder', folder);

  const response = await telarApi.post<UploadResult[]>('/file-upload/images/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Elimina un archivo de S3
 * Endpoint: DELETE /file-upload/file?key=...
 * Acepta tanto el key (e.g. 'images/products/file.jpg') como la URL completa
 */
export const deleteUploadedFile = async (
  keyOrUrl: string,
): Promise<{ success: boolean; key: string }> => {
  const response = await telarApi.delete<{ success: boolean; key: string }>(
    '/file-upload/file',
    { params: { key: keyOrUrl } },
  );

  return response.data;
};

/**
 * Verifica si un archivo existe en S3
 * Endpoint: GET /file-upload/exists?key=...
 */
export const fileExists = async (keyOrUrl: string): Promise<boolean> => {
  const response = await telarApi.get<{ exists: boolean; key: string }>(
    '/file-upload/exists',
    { params: { key: keyOrUrl } },
  );

  return response.data.exists;
};
