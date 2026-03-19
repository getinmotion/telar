import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Readable } from 'stream';
import {
  TranscribeAudioDto,
  TranscribeAudioResponse,
} from '../dto/transcribe-audio.dto';

@Injectable()
export class TranscribeAudioService {
  private readonly logger = new Logger(TranscribeAudioService.name);
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY no está configurada en el .env');
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.log('Transcribe Audio Service inicializado correctamente');
  }

  /**
   * Transcribe audio usando OpenAI Whisper API
   */
  async transcribeAudio(
    dto: TranscribeAudioDto,
  ): Promise<TranscribeAudioResponse> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'OpenAI no está inicializado. Verifica tu API key.',
      );
    }

    if (!dto.audio) {
      throw new BadRequestException('No se proporcionó datos de audio');
    }

    this.logger.log(
      `Procesando transcripción de audio - Idioma: ${dto.language || 'es'}`,
    );

    try {
      // Convertir base64 a Buffer
      const audioBuffer = this.base64ToBuffer(dto.audio);

      if (audioBuffer.length === 0) {
        throw new BadRequestException('El audio está vacío o es inválido');
      }

      this.logger.debug(
        `Audio procesado - Tamaño: ${audioBuffer.length} bytes`,
      );

      // Crear un File-like object para OpenAI
      const audioFile = this.createFileFromBuffer(audioBuffer);

      // Llamar a Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: dto.language || 'es',
      });

      this.logger.log('Transcripción exitosa');

      return {
        text: transcription.text,
      };
    } catch (error) {
      this.logger.error(
        'Error transcribiendo audio',
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al transcribir el audio',
      );
    }
  }

  /**
   * Convierte una cadena base64 a Buffer
   */
  private base64ToBuffer(base64String: string): Buffer {
    try {
      // Remover posible prefijo de data URL
      const base64Data = base64String.replace(
        /^data:audio\/[a-z]+;base64,/,
        '',
      );

      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      this.logger.error('Error convirtiendo base64 a Buffer', error);
      throw new BadRequestException(
        'Formato de audio base64 inválido',
      );
    }
  }

  /**
   * Crea un objeto File-like que OpenAI puede procesar
   */
  private createFileFromBuffer(buffer: Buffer): File {
    // OpenAI SDK espera un objeto File o Blob
    // En Node.js, convertimos Buffer a Uint8Array para compatibilidad
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: 'audio/webm' });

    // Crear un objeto File a partir del Blob
    const file = new File([blob], 'audio.webm', {
      type: 'audio/webm',
    });

    return file;
  }
}
