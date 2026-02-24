import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserMasterContextService } from './user-master-context.service';
import { CreateUserMasterContextDto } from './dto/create-user-master-context.dto';
import { UpdateUserMasterContextDto } from './dto/update-user-master-context.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-master-context')
@Controller('user-master-context')
export class UserMasterContextController {
  constructor(
    private readonly userMasterContextService: UserMasterContextService,
  ) {}

  /**
   * POST /user-master-context
   * Crear un nuevo contexto maestro
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo contexto maestro de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Contexto creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene un contexto maestro',
  })
  async create(@Body() createDto: CreateUserMasterContextDto) {
    return await this.userMasterContextService.create(createDto);
  }

  /**
   * GET /user-master-context
   * Obtener todos los contextos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los contextos maestros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contextos obtenida exitosamente',
  })
  async getAll() {
    return await this.userMasterContextService.getAll();
  }

  /**
   * GET /user-master-context/language/:language
   * Obtener contextos por preferencia de idioma
   */
  @Get('language/:language')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener contextos por preferencia de idioma' })
  @ApiParam({
    name: 'language',
    description: 'Código de idioma',
    example: 'es',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contextos por idioma obtenida exitosamente',
  })
  async getByLanguage(@Param('language') language: string) {
    return await this.userMasterContextService.getByLanguagePreference(
      language,
    );
  }

  /**
   * GET /user-master-context/user/:userId
   * Obtener contexto por usuario (relación 1:1)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener contexto maestro de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description:
      'Contexto del usuario obtenido exitosamente (puede ser null si no existe)',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userMasterContextService.getByUserId(userId);
  }

  /**
   * PATCH /user-master-context/user/:userId/assessment
   * Actualizar fecha de último assessment
   */
  @Patch('user/:userId/assessment')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar fecha de último assessment' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Fecha de assessment actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async updateAssessmentDate(@Param('userId') userId: string) {
    return await this.userMasterContextService.updateLastAssessmentDate(
      userId,
    );
  }

  /**
   * PATCH /user-master-context/user/:userId
   * Actualizar contexto por userId
   */
  @Patch('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar contexto de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserMasterContextDto,
  ) {
    return await this.userMasterContextService.updateByUserId(
      userId,
      updateDto,
    );
  }

  /**
   * GET /user-master-context/:id
   * Obtener un contexto por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un contexto maestro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.userMasterContextService.getById(id);
  }

  /**
   * PATCH /user-master-context/:id
   * Actualizar un contexto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un contexto maestro' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserMasterContextDto,
  ) {
    return await this.userMasterContextService.update(id, updateDto);
  }

  /**
   * DELETE /user-master-context/:id
   * Eliminar un contexto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un contexto maestro' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.userMasterContextService.delete(id);
  }
}
