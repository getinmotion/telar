import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CmsTerritoriesService } from './cms-territories.service';
import { CreateCmsTerritoryDto } from './dto/create-cms-territory.dto';
import { UpdateCmsTerritoryDto } from './dto/update-cms-territory.dto';

const ADMIN_ROLES = new Set(['admin', 'moderator', 'super_admin']);

function ensureAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  const role = (user.role || '').toString().toLowerCase();
  const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];
  if (ADMIN_ROLES.has(role) || userRoles.some((r) => ADMIN_ROLES.has(r))) return;
  throw new ForbiddenException('Admin or moderator role required');
}

@ApiTags('cms-territories')
@Controller('cms/territories')
export class CmsTerritoriesController {
  constructor(private readonly service: CmsTerritoriesService) {}

  /** Public listing — solo published a menos que pase ?includeDrafts=true (admin). */
  @Get()
  @ApiOperation({ summary: 'Listar territorios editoriales' })
  async findAll(
    @Query('search') search?: string,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    return this.service.findAll({
      status: includeDrafts === 'true' ? undefined : 'published',
      search,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener territorio publicado por slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCmsTerritoryDto, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCmsTerritoryDto,
    @Req() req: Request,
  ) {
    ensureAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.remove(id);
  }
}
