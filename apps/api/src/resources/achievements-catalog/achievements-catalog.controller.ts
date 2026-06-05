import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AchievementsCatalogService } from './achievements-catalog.service';
import { CreateAchievementsCatalogDto } from './dto/create-achievements-catalog.dto';
import { UpdateAchievementsCatalogDto } from './dto/update-achievements-catalog.dto';
import { AchievementsCatalog } from './entities/achievements-catalog.entity';

@ApiTags('Achievements Catalog')
@Controller('achievements-catalog')
export class AchievementsCatalogController {
  constructor(
    private readonly achievementsCatalogService: AchievementsCatalogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new achievement' })
  @ApiResponse({
    status: 201,
    description: 'Achievement created successfully',
    type: AchievementsCatalog,
  })
  create(
    @Body() createAchievementsCatalogDto: CreateAchievementsCatalogDto,
  ): Promise<AchievementsCatalog> {
    return this.achievementsCatalogService.create(createAchievementsCatalogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all achievements' })
  @ApiResponse({
    status: 200,
    description: 'List of all achievements',
    type: [AchievementsCatalog],
  })
  getAll(): Promise<AchievementsCatalog[]> {
    return this.achievementsCatalogService.getAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get achievements by category' })
  @ApiResponse({
    status: 200,
    description: 'List of achievements in category',
    type: [AchievementsCatalog],
  })
  getByCategory(
    @Param('category') category: string,
  ): Promise<AchievementsCatalog[]> {
    return this.achievementsCatalogService.getByCategory(category);
  }

  @Get('tier/:tier')
  @ApiOperation({ summary: 'Get achievements by tier' })
  @ApiResponse({
    status: 200,
    description: 'List of achievements in tier',
    type: [AchievementsCatalog],
  })
  getByTier(@Param('tier') tier: string): Promise<AchievementsCatalog[]> {
    return this.achievementsCatalogService.getByTier(tier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get achievement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Achievement found',
    type: AchievementsCatalog,
  })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  getById(@Param('id') id: string): Promise<AchievementsCatalog> {
    return this.achievementsCatalogService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update achievement' })
  @ApiResponse({
    status: 200,
    description: 'Achievement updated successfully',
    type: AchievementsCatalog,
  })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  update(
    @Param('id') id: string,
    @Body() updateAchievementsCatalogDto: UpdateAchievementsCatalogDto,
  ): Promise<AchievementsCatalog> {
    return this.achievementsCatalogService.update(
      id,
      updateAchievementsCatalogDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete achievement' })
  @ApiResponse({
    status: 200,
    description: 'Achievement deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.achievementsCatalogService.delete(id);
  }
}
