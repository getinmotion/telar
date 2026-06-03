import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY no está definida en el .env');
    }
    // Crear una clave de 32 bytes a partir de ENCRYPTION_KEY
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  /**
   * Encripta un texto usando AES-256-GCM
   * @param text - Texto a encriptar
   * @returns Texto encriptado en formato: iv:encrypted:authTag (base64)
   */
  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Formato: iv:encrypted:authTag (todos en base64)
    return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`;
  }

  /**
   * Desencripta un texto encriptado con AES-256-GCM
   * @param encryptedText - Texto encriptado en formato: iv:encrypted:authTag
   * @returns Texto desencriptado
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de texto encriptado inválido');
      }

      const iv = Buffer.from(parts[0], 'base64');
      const encrypted = parts[1];
      const authTag = Buffer.from(parts[2], 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Error al desencriptar: ${error.message}`);
    }
  }
}
