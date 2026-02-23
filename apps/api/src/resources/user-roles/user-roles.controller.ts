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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRoleResponseDto } from './dto/user-role-response.dto';
import { AppRole } from './enums/app-role.enum';

@ApiTags('User Roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado exitosamente',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene ese rol' })
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles de usuarios' })
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
  findAll(
    @Query('userId') userId?: string,
    @Query('role') role?: AppRole,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.userRolesService.findAll({ userId, role, limit, offset });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol de usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol de usuario encontrado',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rol de usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRolesService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener todos los roles de un usuario específico' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario',
    type: [UserRoleResponseDto],
  })
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRolesService.findByUserId(userId);
  }

  @Get('user/:userId/has-role/:role')
  @ApiOperation({ summary: 'Verificar si un usuario tiene un rol específico' })
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
  async hasRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: AppRole,
  ) {
    const hasRole = await this.userRolesService.hasRole(userId, role);
    return { hasRole };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol de usuario' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: UserRoleResponseDto,
  })
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
  @ApiOperation({ summary: 'Remover un rol de usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol de usuario' })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol de usuario no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userRolesService.remove(id);
  }

  @Delete('user/:userId/role/:role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover un rol específico de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'role', enum: AppRole, description: 'Rol a remover' })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'El usuario no tiene ese rol' })
  removeUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: AppRole,
  ) {
    return this.userRolesService.removeUserRole(userId, role);
  }
}
