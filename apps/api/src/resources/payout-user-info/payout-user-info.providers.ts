import { DataSource } from 'typeorm';
import { PayoutUserInfo } from './entities/payout-user-info.entity';

export const payoutUserInfoProviders = [
  {
    provide: 'PAYOUT_USER_INFO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PayoutUserInfo),
    inject: ['DATA_SOURCE'],
  },
];
