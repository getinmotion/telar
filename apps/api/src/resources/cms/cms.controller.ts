import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CmsRequestDto } from './dto/cms-request.dto';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener contenido del CMS de Storyblok',
    description: `
Endpoint único para obtener contenido del CMS. Soporta múltiples acciones:

- **hero-slides**: Slides del hero de la página principal
- **editorial-stories**: Historias editoriales destacadas
- **stats**: Estadísticas de la página principal
- **newsletter**: Configuración del formulario de newsletter
- **categories**: Categorías del marketplace
- **blog-articles**: Lista de artículos del blog (con paginación)
- **blog-article**: Artículo individual por slug (requiere slug)
- **legal-page**: Páginas legales por slug (requiere slug)
- **page-header**: Headers de página por slug (requiere slug)

El sistema implementa cache de 5 minutos y manejo graceful de errores.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Contenido obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          oneOf: [{ type: 'object' }, { type: 'array' }, { type: 'null' }],
          description: 'Contenido del CMS según la action solicitada',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Request inválido (action desconocido, slug faltante)',
  })
  @ApiResponse({
    status: 500,
    description: 'Error del servidor o de Storyblok API',
  })
  async getCmsContent(@Body() dto: CmsRequestDto): Promise<{ data: unknown }> {
    const data: unknown = await this.cmsService.processRequest(dto);
    return { data };
  }
}
