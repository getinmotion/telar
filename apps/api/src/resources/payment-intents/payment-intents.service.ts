import { Injectable } from '@nestjs/common';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { UpdatePaymentIntentDto } from './dto/update-payment-intent.dto';

@Injectable()
export class PaymentIntentsService {
  create(createPaymentIntentDto: CreatePaymentIntentDto) {
    return 'This action adds a new paymentIntent';
  }

  findAll() {
    return `This action returns all paymentIntents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentIntent`;
  }

  update(id: number, updatePaymentIntentDto: UpdatePaymentIntentDto) {
    return `This action updates a #${id} paymentIntent`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentIntent`;
  }
}
