import { Injectable } from '@nestjs/common';
import { CreatePaymentProviderDto } from './dto/create-payment-provider.dto';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';

@Injectable()
export class PaymentProvidersService {
  create(createPaymentProviderDto: CreatePaymentProviderDto) {
    return 'This action adds a new paymentProvider';
  }

  findAll() {
    return `This action returns all paymentProviders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentProvider`;
  }

  update(id: number, updatePaymentProviderDto: UpdatePaymentProviderDto) {
    return `This action updates a #${id} paymentProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentProvider`;
  }
}
