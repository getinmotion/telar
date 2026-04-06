import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentProvidersService } from './payment-providers.service';
import { CreatePaymentProviderDto } from './dto/create-payment-provider.dto';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';

@Controller('payment-providers')
export class PaymentProvidersController {
  constructor(private readonly paymentProvidersService: PaymentProvidersService) {}

  @Post()
  create(@Body() createPaymentProviderDto: CreatePaymentProviderDto) {
    return this.paymentProvidersService.create(createPaymentProviderDto);
  }

  @Get()
  findAll() {
    return this.paymentProvidersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentProvidersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentProviderDto: UpdatePaymentProviderDto) {
    return this.paymentProvidersService.update(+id, updatePaymentProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentProvidersService.remove(+id);
  }
}
