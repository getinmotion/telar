import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class PromptsService {
  private readonly logger = new Logger(PromptsService.name);
  private readonly promptsPath = join(__dirname, '..', 'prompts');

  /**
   * Lee un archivo de prompt desde la carpeta prompts
   */
  async getPrompt(name: string, language: string = 'es'): Promise<string> {
    try {
      const filePath = join(this.promptsPath, `${name}-${language}.md`);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      this.logger.error(
        `Error leyendo prompt ${name}-${language}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Prompt ${name}-${language} no encontrado`,
      );
    }
  }

  /**
   * Reemplaza placeholders en un prompt con valores reales
   */
  replacePlaceholders(
    template: string,
    values: Record<string, any>,
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      const replacement =
        typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);
      result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return result;
  }
}
