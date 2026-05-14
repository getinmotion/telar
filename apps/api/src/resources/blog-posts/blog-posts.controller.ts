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
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

function ensureSuperAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  if (user.isSuperAdmin === true) return;
  throw new ForbiddenException('Super-admin role required');
}

@ApiTags('blog-posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  /** Public listing — only published unless authenticated super-admin
   *  passes ?includeDrafts=true. */
  @Get()
  @ApiOperation({ summary: 'List blog posts (public, only published)' })
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    return this.service.findAll({
      status: includeDrafts === 'true' ? undefined : 'published',
      category,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a published blog post by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get blog post by ID (admin)' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    ensureSuperAdmin(req);
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a blog post (super_admin only)' })
  async create(@Req() req: Request, @Body() dto: CreateBlogPostDto) {
    ensureSuperAdmin(req);
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a blog post (super_admin only)' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    ensureSuperAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a blog post (super_admin only)' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    ensureSuperAdmin(req);
    return this.service.remove(id);
  }
}
