import { DataSource } from 'typeorm';
import { PaymentIntent } from './entities/payment-intent.entity';

export const paymentIntentsProviders = [
  {
    provide: 'PAYMENT_INTENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PaymentIntent),
    inject: ['DATA_SOURCE'],
  },
];
