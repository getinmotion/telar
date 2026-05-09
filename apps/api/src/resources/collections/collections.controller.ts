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
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

function ensureSuperAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  if (user.isSuperAdmin === true) return;
  throw new ForbiddenException('Super-admin role required');
}

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List collections (public, only published by default)' })
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    return this.service.findAll({
      status: includeDrafts === 'true' ? undefined : 'published',
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a published collection by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get collection by ID (super_admin only)' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    ensureSuperAdmin(req);
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a collection (super_admin only)' })
  async create(@Req() req: Request, @Body() dto: CreateCollectionDto) {
    ensureSuperAdmin(req);
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a collection (super_admin only)' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    ensureSuperAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a collection (super_admin only)' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    ensureSuperAdmin(req);
    return this.service.remove(id);
  }
}
