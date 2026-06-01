import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StoryLibraryService } from './story-library.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';

@Controller('story-library')
@UseGuards(JwtAuthGuard)
export class StoryLibraryController {
  constructor(private readonly service: StoryLibraryService) {}

  @Get()
  findByArtisan(@Query('artisan_id') artisanId: string) {
    return this.service.findByArtisan(artisanId);
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStoryDto) {
    return this.service.create(dto);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @Body('artisanId') artisanId: string) {
    return this.service.clone(id, artisanId);
  }

  @Post(':id/attach/:productId')
  attach(@Param('id') id: string, @Param('productId') productId: string) {
    return this.service.attachToProduct(id, productId);
  }

  @Delete(':id/attach/:productId')
  detach(@Param('id') id: string, @Param('productId') productId: string) {
    return this.service.detachFromProduct(id, productId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoryDto,
    @Request() req: any,
  ) {
    const artisanId = req.user?.artisanProfileId ?? req.user?.sub;
    return this.service.update(id, dto, artisanId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const artisanId = req.user?.artisanProfileId ?? req.user?.sub;
    return this.service.remove(id, artisanId);
  }
}
