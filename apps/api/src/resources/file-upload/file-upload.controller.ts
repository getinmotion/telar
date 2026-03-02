import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto, UploadFolder } from './dto/create-file-upload.dto';
import { DeleteFileDto } from './dto/delete-file.dto';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una imagen a S3' })
  @ApiBody({
    description: 'Archivo de imagen y carpeta destino',
    schema: {
      type: 'object',
      required: ['file', 'folder'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen',
        },
        folder: {
          type: 'string',
          enum: Object.values(UploadFolder),
          description: 'Carpeta destino en S3',
          example: UploadFolder.PRODUCTS,
        },
        description: {
          type: 'string',
          description: 'Descripción opcional',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'images/products/1234567890_0.jpg' },
        url: {
          type: 'string',
          example:
            'https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/products/1234567890_0.jpg',
        },
        bucket: { type: 'string', example: 'telar-stg-bucket' },
        size: { type: 'number', example: 102400 },
        contentType: { type: 'string', example: 'image/jpeg' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido (tamaño, tipo, etc.)',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder,
  ) {
    return await this.fileUploadService.uploadImage(file, folder);
  }

  @Post('images/multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir múltiples imágenes a S3' })
  @ApiBody({
    description: 'Múltiples archivos de imagen y carpeta destino',
    schema: {
      type: 'object',
      required: ['files', 'folder'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de imagen (máximo 10)',
        },
        folder: {
          type: 'string',
          enum: Object.values(UploadFolder),
          description: 'Carpeta destino en S3',
          example: UploadFolder.PRODUCTS,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          url: { type: 'string' },
          bucket: { type: 'string' },
          size: { type: 'number' },
          contentType: { type: 'string' },
        },
      },
    },
  })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder: UploadFolder,
  ) {
    return await this.fileUploadService.uploadMultipleImages(files, folder);
  }

  @Delete('file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un archivo de S3' })
  @ApiQuery({
    name: 'key',
    description: 'Key del archivo en S3 o URL completa',
    example: 'images/products/1234567890_0.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        key: { type: 'string', example: 'images/products/1234567890_0.jpg' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo no encontrado',
  })
  async deleteFile(@Query('key') key: string) {
    return await this.fileUploadService.deleteFile(key);
  }

  @Get('exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar si un archivo existe en S3' })
  @ApiQuery({
    name: 'key',
    description: 'Key del archivo en S3 o URL completa',
    example: 'images/products/1234567890_0.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean', example: true },
        key: { type: 'string', example: 'images/products/1234567890_0.jpg' },
      },
    },
  })
  async fileExists(@Query('key') key: string) {
    const exists = await this.fileUploadService.fileExists(key);
    return { exists, key };
  }
}
