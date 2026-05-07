import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ILike, IsNull } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserRolesService } from '../user-roles/user-roles.service';
import { AppRole } from '../user-roles/enums/app-role.enum';

function ensureSuperAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  if (user.isSuperAdmin === true) return;
  throw new ForbiddenException('Super-admin role required');
}

interface UserListItem {
  id: string;
  email: string | null;
  role: string | null;
  isSuperAdmin: boolean | null;
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List users for admin (super_admin only)' })
  async findAllAdmin(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    ensureSuperAdmin(req);

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
      isSuperAdmin: u.isSuperAdmin,
      createdAt: u.createdAt,
      roles: rolesByUser[u.id] ?? [],
    }));

    return { data, total, limit, offset };
  }

  /**
   * Toggle del flag super_admin. Sólo super_admin.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Patch user (toggle isSuperAdmin) — super_admin only' })
  async patchUser(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { isSuperAdmin?: boolean },
  ) {
    ensureSuperAdmin(req);

    const repo = (this.usersService as any).userRepository;
    const updates: any = {};
    if (typeof body.isSuperAdmin === 'boolean') {
      updates.isSuperAdmin = body.isSuperAdmin;
    }
    if (Object.keys(updates).length === 0) {
      return { id, updated: false };
    }
    await repo.update(id, updates);
    const fresh = await repo.findOne({ where: { id } });
    return {
      id: fresh.id,
      email: fresh.email,
      isSuperAdmin: fresh.isSuperAdmin,
    };
  }
}
