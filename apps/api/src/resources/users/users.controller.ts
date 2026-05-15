import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILike, IsNull } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { AppRole } from '../user-roles/enums/app-role.enum';

interface UserListItem {
  id: string;
  email: string | null;
  role: string | null;
  createdAt: Date;
  roles: AppRole[];
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  /**
   * Listado admin: usuarios con email + flag super_admin + roles[] del enum.
   * Sólo super_admin.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List users for admin (super_admin only)' })
  async findAllAdmin(
    @Query('search') search?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {

    const limit = Math.max(1, Math.min(parseInt(limitStr ?? '50', 10) || 50, 200));
    const offset = Math.max(0, parseInt(offsetStr ?? '0', 10) || 0);

    const repo = (this.usersService as any).userRepository;
    const where: any = { deletedAt: IsNull() };
    if (search && search.trim()) {
      where.email = ILike(`%${search.trim()}%`);
    }

    const [users, total] = await repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Roles per user (one query for all to avoid N+1)
    const ids = users.map((u: any) => u.id);
    const rolesByUser: Record<string, AppRole[]> = {};
    if (ids.length > 0) {
      const all = await this.userRolesService.findAll({ limit: 1000, offset: 0 });
      for (const ur of all.data) {
        if (!ids.includes(ur.userId)) continue;
        (rolesByUser[ur.userId] ||= []).push(ur.role);
      }
    }

    const data: UserListItem[] = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      roles: rolesByUser[u.id] ?? [],
    }));

    return { data, total, limit, offset };
  }

  /**
   * Asignar o revocar el rol super_admin a un usuario. Sólo super_admin.
   */
  @Patch(':id/super-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Assign or revoke super_admin role — super_admin only' })
  async patchSuperAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { grant: boolean },
  ) {
    if (body.grant) {
      await this.userRolesService.assignRole({ userId: id, role: AppRole.SUPER_ADMIN });
    } else {
      await this.userRolesService.removeRoleByUserAndRole(id, AppRole.SUPER_ADMIN);
    }
    const roles = await this.userRolesService.findByUserId(id);
    return { id, roles: roles.map((r) => r.role) };
  }
}
