import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GiftCardsService } from './gift-cards.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { UpdateGiftCardDto } from './dto/update-gift-card.dto';
import { GiftCard } from './entities/gift-card.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Gift Cards')
@Controller('gift-cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva gift card' })
  @ApiResponse({
    status: 201,
    description: 'Gift card creada exitosamente',
    type: GiftCard,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createGiftCardDto: CreateGiftCardDto): Promise<GiftCard> {
    return this.giftCardsService.create(createGiftCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las gift cards' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gift cards',
    type: [GiftCard],
  })
  findAll(): Promise<GiftCard[]> {
    return this.giftCardsService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Obtener una gift card por código' })
  @ApiParam({ name: 'code', description: 'Código de la gift card' })
  @ApiResponse({
    status: 200,
    description: 'Gift card encontrada',
    type: GiftCard,
  })
  @ApiResponse({ status: 404, description: 'Gift card no encontrada' })
  findByCode(@Param('code') code: string): Promise<GiftCard> {
    return this.giftCardsService.findByCode(code);
  }

  @Get('user/:email')
  @ApiOperation({
    summary: 'Obtener gift cards por email de usuario (comprador o destinatario)',
  })
  @ApiParam({
    name: 'email',
    description: 'Email del usuario (busca en purchaser_email y recipient_email)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de gift cards del usuario',
    type: [GiftCard],
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  findByUserEmail(@Param('email') email: string): Promise<GiftCard[]> {
    return this.giftCardsService.findByUserEmail(email);
  }

  @Get('purchaser/:email')
  @ApiOperation({ summary: 'Obtener gift cards por email del comprador' })
  @ApiParam({ name: 'email', description: 'Email del comprador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gift cards del comprador',
    type: [GiftCard],
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  findByPurchaserEmail(@Param('email') email: string): Promise<GiftCard[]> {
    return this.giftCardsService.findByPurchaserEmail(email);
  }

  @Get('recipient/:email')
  @ApiOperation({ summary: 'Obtener gift cards por email del destinatario' })
  @ApiParam({ name: 'email', description: 'Email del destinatario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gift cards del destinatario',
    type: [GiftCard],
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  findByRecipientEmail(@Param('email') email: string): Promise<GiftCard[]> {
    return this.giftCardsService.findByRecipientEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una gift card por ID' })
  @ApiParam({ name: 'id', description: 'ID de la gift card' })
  @ApiResponse({
    status: 200,
    description: 'Gift card encontrada',
    type: GiftCard,
  })
  @ApiResponse({ status: 404, description: 'Gift card no encontrada' })
  findOne(@Param('id') id: string): Promise<GiftCard> {
    return this.giftCardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una gift card' })
  @ApiParam({ name: 'id', description: 'ID de la gift card' })
  @ApiResponse({
    status: 200,
    description: 'Gift card actualizada exitosamente',
    type: GiftCard,
  })
  @ApiResponse({ status: 404, description: 'Gift card no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateGiftCardDto: UpdateGiftCardDto,
  ): Promise<GiftCard> {
    return this.giftCardsService.update(id, updateGiftCardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una gift card' })
  @ApiParam({ name: 'id', description: 'ID de la gift card' })
  @ApiResponse({
    status: 200,
    description: 'Gift card eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Gift card no encontrada' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.giftCardsService.remove(id);
  }
}
