import { DataSource } from 'typeorm';
import { PaymentProvider } from './entities/payment-provider.entity';

export const paymentProvidersProviders = [
  {
    provide: 'PAYMENT_PROVIDER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PaymentProvider),
    inject: ['DATA_SOURCE'],
  },
];
