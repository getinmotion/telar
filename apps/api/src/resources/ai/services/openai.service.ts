import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class OpenAIService implements OnModuleInit {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY no está configurada en el .env');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.logger.log('OpenAI Service inicializado correctamente');
  }

  /**
   * Realiza una llamada a la API de OpenAI Chat Completion
   */
  async chatCompletion(params: {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    max_tokens?: number;
    temperature?: number;
    response_format?: { type: 'text' | 'json_object' };
  }): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'OpenAI no está inicializado. Verifica tu API key.',
      );
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: params.model || 'gpt-4o',
        messages: params.messages,
        max_tokens: params.max_tokens || 800,
        temperature: params.temperature || 0.7,
        response_format: params.response_format || { type: 'text' },
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new InternalServerErrorException(
          'OpenAI no retornó contenido en la respuesta',
        );
      }

      return content;
    } catch (error) {
      this.logger.error('Error al llamar a OpenAI API', error.stack);
      throw new InternalServerErrorException(
        'Error al comunicarse con el servicio de IA',
      );
    }
  }

  /**
   * Realiza una llamada a OpenAI con function calling
   */
  async chatCompletionWithTools(params: {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    tools: any[];
    tool_choice?: any;
    max_tokens?: number;
    temperature?: number;
  }): Promise<any> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'OpenAI no está inicializado. Verifica tu API key.',
      );
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: params.model || 'gpt-4o',
        messages: params.messages,
        tools: params.tools,
        tool_choice: params.tool_choice,
        max_tokens: params.max_tokens || 800,
        temperature: params.temperature || 0.7,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new InternalServerErrorException(
          'OpenAI no retornó ninguna respuesta',
        );
      }

      return response;
    } catch (error) {
      this.logger.error('Error al llamar a OpenAI API con tools', error.stack);
      throw new InternalServerErrorException(
        'Error al comunicarse con el servicio de IA',
      );
    }
  }

  /**
   * Realiza una llamada a OpenAI con function calling y soporte de visión (multimodal).
   * Permite mensajes con contenido de imagen (image_url) para analizar imágenes.
   */
  async chatCompletionWithVision(params: {
    model?: string;
    messages: ChatCompletionMessageParam[];
    tools: any[];
    tool_choice?: any;
    max_tokens?: number;
    temperature?: number;
  }): Promise<any> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'OpenAI no está inicializado. Verifica tu API key.',
      );
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: params.model || 'gpt-4o',
        messages: params.messages,
        tools: params.tools,
        tool_choice: params.tool_choice,
        max_tokens: params.max_tokens || 800,
        temperature: params.temperature ?? 0.7,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new InternalServerErrorException(
          'OpenAI no retornó ninguna respuesta',
        );
      }

      return response;
    } catch (error) {
      this.logger.error('Error al llamar a OpenAI API con visión', error.stack);
      throw new InternalServerErrorException(
        'Error al comunicarse con el servicio de IA',
      );
    }
  }
}
