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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  /**
   * GET /stores/slug/:slug
   * Obtener tienda por slug (debe ir antes de :id para evitar conflictos)
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  /**
   * GET /stores/user/:userId
   * Obtener tienda de un usuario específico
   */
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.storesService.findByUserId(userId);
  }

  /**
   * GET /stores/legacy/:legacyId
   * Obtener solo datos legacy de artisan_shops
   */
  @Get('legacy/:legacyId')
  findLegacyShop(@Param('legacyId') legacyId: string) {
    return this.storesService.findLegacyShop(legacyId);
  }

  /**
   * GET /stores/:id
   * Obtener tienda por ID (UUID)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
