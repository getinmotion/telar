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
import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { UpdateCheckoutStatusDto } from './dto/update-checkout-status.dto';
import { Checkout } from './entities/checkout.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Checkouts')
@Controller('checkouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo checkout' })
  @ApiResponse({
    status: 201,
    description: 'Checkout creado exitosamente',
    type: Checkout,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Carrito o usuario no encontrado' })
  create(@Body() createCheckoutDto: CreateCheckoutDto): Promise<Checkout> {
    return this.checkoutsService.create(createCheckoutDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los checkouts' })
  @ApiResponse({
    status: 200,
    description: 'Lista de checkouts',
    type: [Checkout],
  })
  findAll(): Promise<Checkout[]> {
    return this.checkoutsService.findAll();
  }

  @Get('buyer/:buyerUserId')
  @ApiOperation({ summary: 'Obtener checkouts por buyerUserId' })
  @ApiParam({ name: 'buyerUserId', description: 'ID del usuario comprador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de checkouts del comprador',
    type: [Checkout],
  })
  @ApiResponse({ status: 400, description: 'buyerUserId inválido' })
  findByBuyerUserId(
    @Param('buyerUserId') buyerUserId: string,
  ): Promise<Checkout[]> {
    return this.checkoutsService.findByBuyerUserId(buyerUserId);
  }

  @Get('cart/:cartId')
  @ApiOperation({ summary: 'Obtener checkout por cartId' })
  @ApiParam({ name: 'cartId', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Checkout encontrado',
    type: Checkout,
  })
  @ApiResponse({ status: 404, description: 'Checkout no encontrado' })
  findByCartId(@Param('cartId') cartId: string): Promise<Checkout | null> {
    return this.checkoutsService.findByCartId(cartId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un checkout por ID' })
  @ApiParam({ name: 'id', description: 'ID del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout encontrado',
    type: Checkout,
  })
  @ApiResponse({ status: 404, description: 'Checkout no encontrado' })
  findOne(@Param('id') id: string): Promise<Checkout> {
    return this.checkoutsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un checkout' })
  @ApiParam({ name: 'id', description: 'ID del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout actualizado exitosamente',
    type: Checkout,
  })
  @ApiResponse({ status: 404, description: 'Checkout no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCheckoutDto: UpdateCheckoutDto,
  ): Promise<Checkout> {
    return this.checkoutsService.update(id, updateCheckoutDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del checkout' })
  @ApiParam({ name: 'id', description: 'ID del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Estado del checkout actualizado exitosamente',
    type: Checkout,
  })
  @ApiResponse({ status: 404, description: 'Checkout no encontrado' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCheckoutStatusDto,
  ): Promise<Checkout> {
    return this.checkoutsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un checkout' })
  @ApiParam({ name: 'id', description: 'ID del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Checkout no encontrado' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.checkoutsService.remove(id);
  }
}
