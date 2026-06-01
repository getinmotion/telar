import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFolder } from './dto/create-file-upload.dto';
import { S3Service, UploadResult } from 'src/common/services/s3/s3.service';

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

@Injectable()
export class FileUploadService {
  private readonly maxFileSize: number;

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    const maxFileSizeStr = this.configService.get<string>('MAX_FILE_SIZE');
    this.maxFileSize = maxFileSizeStr
      ? parseInt(maxFileSizeStr)
      : 5 * 1024 * 1024; // Default: 5MB
  }

  /**
   * Subir una imagen a S3
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadResult> {
    const isVideoFolder = folder === UploadFolder.PRESENTATION_VIDEOS;
    const allowedTypes = isVideoFolder ? VIDEO_MIME_TYPES : IMAGE_MIME_TYPES;
    const maxSize = isVideoFolder ? VIDEO_MAX_SIZE : this.maxFileSize;

    // Validar tamaño
    if (file.size > maxSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Validar tipo MIME
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`,
      );
    }

    // Subir a S3
    return await this.s3Service.uploadImage(
      file.buffer,
      folder,
      file.originalname,
    );
  }

  /**
   * Subir múltiples imágenes a S3
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: UploadFolder,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadImage(file, folder);
      results.push(result);
    }

    return results;
  }

  /**
   * Eliminar un archivo de S3
   */
  async deleteFile(
    keyOrUrl: string,
  ): Promise<{ success: boolean; key: string }> {
    // Extraer key si es una URL
    const key = this.s3Service.extractKeyFromUrl(keyOrUrl);

    // Verificar que existe
    const exists = await this.s3Service.fileExists(key);
    if (!exists) {
      throw new BadRequestException(`El archivo no existe: ${key}`);
    }

    // Eliminar
    const success = await this.s3Service.deleteFile(key);

    return { success, key };
  }

  /**
   * Verificar si un archivo existe
   */
  async fileExists(keyOrUrl: string): Promise<boolean> {
    const key = this.s3Service.extractKeyFromUrl(keyOrUrl);
    return await this.s3Service.fileExists(key);
  }
}
