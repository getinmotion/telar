import { DataSource } from 'typeorm';
import { StorePoliciesConfig } from './entities/store-policies-config.entity';

export const storePoliciesConfigProviders = [
  {
    provide: 'STORE_POLICIES_CONFIG_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StorePoliciesConfig),
    inject: ['DATA_SOURCE'],
  },
];
