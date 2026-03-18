import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFolder } from './dto/create-file-upload.dto';
import { S3Service, UploadResult } from 'src/common/services/s3/s3.service';

@Injectable()
export class FileUploadService {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    // Obtener configuración
    const maxFileSizeStr = this.configService.get<string>('MAX_FILE_SIZE');
    this.maxFileSize = maxFileSizeStr
      ? parseInt(maxFileSizeStr)
      : 5 * 1024 * 1024; // Default: 5MB

    // Tipos MIME permitidos para imágenes
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
  }

  /**
   * Subir una imagen a S3
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<UploadResult> {
    // Validar tamaño
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Máximo permitido: ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${this.allowedMimeTypes.join(', ')}`,
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
