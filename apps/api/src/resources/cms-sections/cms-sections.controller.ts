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
import { CmsSectionsService } from './cms-sections.service';
import { CreateCmsSectionDto } from './dto/create-cms-section.dto';
import { UpdateCmsSectionDto } from './dto/update-cms-section.dto';
import { ReorderCmsSectionsDto } from './dto/reorder-cms-sections.dto';

const ADMIN_ROLES = new Set(['admin', 'moderator', 'super_admin']);

function ensureAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  const role = (user.role || '').toString().toLowerCase();
  if (ADMIN_ROLES.has(role) || user.isSuperAdmin === true) return;
  throw new ForbiddenException('Admin or moderator role required');
}

@ApiTags('cms-sections')
@Controller('cms/sections')
export class CmsSectionsController {
  constructor(private readonly service: CmsSectionsService) {}

  /** Public read — only published sections */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List published sections for a page' })
  async findAll(
    @Query('pageKey') pageKey: string,
    @Query('includeUnpublished') includeUnpublished?: string,
  ) {
    if (!pageKey) {
      return { data: [] };
    }
    const data = await this.service.findAllByPage(
      pageKey,
      includeUnpublished === 'true',
    );
    return { data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCmsSectionDto, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCmsSectionDto,
    @Req() req: Request,
  ) {
    ensureAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string, @Req() req: Request) {
    ensureAdmin(req);
    return this.service.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async reorder(@Body() dto: ReorderCmsSectionsDto, @Req() req: Request) {
    ensureAdmin(req);
    const data = await this.service.reorder(dto.pageKey, dto.orderedIds);
    return { data };
  }
}
