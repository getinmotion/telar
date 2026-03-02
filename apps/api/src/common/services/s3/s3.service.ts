import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import * as path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
}

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly acl: string;
  private readonly cdnBaseUrl: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    // Configurar cliente S3 con validación de variables requeridas
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION');
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    const cdnBaseUrl = this.configService.get<string>('CDN_BASE_URL');

    // Validar variables críticas
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      );
    }

    if (!bucket || !region) {
      throw new Error(
        'AWS S3 configuration incomplete. Please set AWS_S3_BUCKET_NAME and AWS_REGION',
      );
    }

    this.bucket = bucket;
    this.region = region;
    this.acl = this.configService.get<string>('AWS_S3_ACL', 'public-read');
    this.cdnBaseUrl = cdnBaseUrl || `https://${bucket}.s3.${region}.amazonaws.com`;

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Forzar path-style para Lightsail (en lugar de virtual-hosted-style)
      forcePathStyle: true,
    });

    this.logger.log(
      `✅ S3 Service initialized - Bucket: ${this.bucket}, Region: ${this.region}`,
    );
  }

  /**
   * Subir un archivo a S3
   *
   * @param file - Buffer o Stream del archivo
   * @param key - Ruta/nombre del archivo en S3 (ej: "images/products/uuid.jpg")
   * @param contentType - Tipo MIME del archivo
   * @returns Información del archivo subido
   */
  async uploadFile(
    file: Buffer | Readable,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    try {
      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: this.acl as any,
      };

      // Usar Upload para archivos grandes (con multipart automático)
      if (file instanceof Buffer && file.length > 5 * 1024 * 1024) {
        // > 5MB
        const upload = new Upload({
          client: this.s3Client,
          params: uploadParams,
        });

        await upload.done();
        this.logger.log(`✅ Large file uploaded (multipart): ${key}`);
      } else {
        // Usar PutObjectCommand para archivos pequeños
        const command = new PutObjectCommand(uploadParams);
        await this.s3Client.send(command);
        this.logger.log(`✅ File uploaded: ${key}`);
      }

      // Construir URL completa
      const url = `${this.cdnBaseUrl}/${key}`;

      return {
        key,
        url,
        bucket: this.bucket,
        size: file instanceof Buffer ? file.length : 0,
        contentType,
      };
    } catch (error) {
      this.logger.error(`❌ Error uploading file to S3: ${key}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Subir una imagen con generación automática de nombre
   *
   * @param file - Buffer del archivo
   * @param folder - Carpeta en S3 (ej: "products", "shops", "profiles")
   * @param originalName - Nombre original del archivo (para extraer extensión)
   * @returns Información del archivo subido
   */
  async uploadImage(
    file: Buffer,
    folder: string,
    originalName: string,
  ): Promise<UploadResult> {
    // Generar nombre único: timestamp_random_originalname.ext
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const ext = path.extname(originalName);
    const filename = `${timestamp}_${random}${ext}`;

    // Construir key: images/{folder}/{filename}
    const key = `images/${folder}/${filename}`;

    // Detectar content type basado en extensión
    const contentType = this.getContentType(ext);

    return await this.uploadFile(file, key, contentType);
  }

  /**
   * Eliminar un archivo de S3
   *
   * @param key - Ruta del archivo en S3
   * @returns true si se eliminó correctamente
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`✅ File deleted: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error deleting file from S3: ${key}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Verificar si un archivo existe en S3
   *
   * @param key - Ruta del archivo en S3
   * @returns true si existe
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtener Content-Type basado en la extensión del archivo
   */
  private getContentType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
    };

    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Extraer key de una URL completa
   *
   * @param url - URL completa (ej: "https://bucket.s3.region.amazonaws.com/images/file.jpg")
   * @returns key (ej: "images/file.jpg")
   */
  extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remover el primer "/" del pathname
      return urlObj.pathname.substring(1);
    } catch {
      // Si falla el parse de URL, asumir que ya es un key
      return url;
    }
  }
}
