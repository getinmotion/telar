import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRoleResponseDto } from './dto/user-role-response.dto';
import { AppRole } from './enums/app-role.enum';

@ApiTags('User Roles')
@Controller('user-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Asignar un rol a un usuario (super_admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene ese rol' })
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Obtener todos los roles de usuarios (super_admin only)' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por ID de usuario',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: AppRole,
    description: 'Filtrar por rol',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de resultados a retornar',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Cantidad de resultados a omitir',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles de usuarios',
    type: [UserRoleResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  findAll(
    @Query('userId') userId?: string,
    @Query('role') role?: AppRole,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.userRolesService.findAll({ userId, role, limit, offset });
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Obtener un rol de usuario por ID (super_admin only)' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol de usuario encontrado',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  @ApiResponse({ status: 404, description: 'Rol de usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRolesService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener todos los roles de un usuario (propio o super_admin)' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario',
    type: [UserRoleResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo puedes ver tus propios roles o debes ser super_admin' })
  findByUserId(
    @Req() req: Request,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const user: any = (req as any).user ?? {};
    // Permitir si el usuario consulta sus propios roles O si es super_admin
    if (user.sub !== userId && user.isSuperAdmin !== true) {
      throw new ForbiddenException(
        'Solo puedes consultar tus propios roles o debes ser super_admin',
      );
    }
    return this.userRolesService.findByUserId(userId);
  }

  @Get('user/:userId/has-role/:role')
  @ApiOperation({ summary: 'Verificar si un usuario tiene un rol (propio o super_admin)' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'role', enum: AppRole, description: 'Rol a verificar' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
    schema: {
      type: 'object',
      properties: {
        hasRole: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async hasRole(
    @Req() req: Request,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: AppRole,
  ) {
    const user: any = (req as any).user ?? {};
    if (user.sub !== userId && user.isSuperAdmin !== true) {
      throw new ForbiddenException(
        'Solo puedes verificar tus propios roles o debes ser super_admin',
      );
    }
    const hasRole = await this.userRolesService.hasRole(userId, role);
    return { hasRole };
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Actualizar un rol de usuario (super_admin only)' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  @ApiResponse({ status: 404, description: 'Rol de usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene ese rol' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRolesService.update(id, updateUserRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Remover un rol de usuario por ID (super_admin only)' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  @ApiResponse({ status: 404, description: 'Rol de usuario no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRolesService.remove(id);
  }

  @Delete('user/:userId/role/:role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Remover un rol específico de un usuario (super_admin only)' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'role', enum: AppRole, description: 'Rol a remover' })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere super_admin' })
  @ApiResponse({ status: 404, description: 'El usuario no tiene ese rol' })
  removeUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: AppRole,
  ) {
    return this.userRolesService.removeUserRole(userId, role);
  }
}
