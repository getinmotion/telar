import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  Header,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersIdAgreementService } from './users-id-agreement.service';
import { CreateUsersIdAgreementDto } from './dto/create-users-id-agreement.dto';
import { BulkCreateUsersIdAgreementDto } from './dto/bulk-create-users-id-agreement.dto';
import { ValidateNumIdDto } from './dto/validate-num-id.dto';
import { UsersIdAgreement } from './entities/users-id-agreement.entity';

@ApiTags('Users ID Agreement')
@Controller('users-id-agreement')
export class UsersIdAgreementController {
  constructor(
    private readonly usersIdAgreementService: UsersIdAgreementService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un registro de ID-Agreement' })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: UsersIdAgreement,
  })
  async create(
    @Body() dto: CreateUsersIdAgreementDto,
  ): Promise<UsersIdAgreement> {
    return await this.usersIdAgreementService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear múltiples registros desde array JSON' })
  @ApiResponse({
    status: 201,
    description: 'Registros procesados',
  })
  async bulkCreate(@Body() records: BulkCreateUsersIdAgreementDto[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  }> {
    return await this.usersIdAgreementService.bulkCreate(records);
  }

  @Post('bulk-upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV con columnas: idTypeValue, numId, agreementId',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir archivo CSV para crear múltiples registros' })
  @ApiResponse({
    status: 201,
    description: 'Archivo CSV procesado',
  })
  async bulkUploadCsv(@UploadedFile() file: Express.Multer.File): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  }> {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('El archivo debe ser un CSV');
    }

    return await this.usersIdAgreementService.bulkCreateFromCsv(
      file.buffer.toString('utf-8'),
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar si existe un registro con la combinación de ID Type, Número ID y Convenio',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
  })
  async validateNumId(@Body() dto: ValidateNumIdDto): Promise<{
    exists: boolean;
    record?: UsersIdAgreement;
  }> {
    return await this.usersIdAgreementService.validateNumId(
      dto.idType,
      dto.numId,
      dto.agreementId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros',
    type: [UsersIdAgreement],
  })
  async findAll(): Promise<UsersIdAgreement[]> {
    return await this.usersIdAgreementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: UsersIdAgreement,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id') id: string): Promise<UsersIdAgreement> {
    return await this.usersIdAgreementService.findOne(id);
  }

  @Get('template/download')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="users_id_agreement_template.csv"')
  @ApiOperation({ summary: 'Descargar plantilla CSV en blanco para bulk upload' })
  @ApiResponse({
    status: 200,
    description: 'Plantilla CSV descargada',
  })
  async downloadTemplate(@Res() res: any): Promise<void> {
    const csv = this.usersIdAgreementService.generateCsvTemplate();
    res.send(csv);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro' })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersIdAgreementService.delete(id);
  }
}
