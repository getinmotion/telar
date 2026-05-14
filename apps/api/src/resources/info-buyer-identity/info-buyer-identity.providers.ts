import { DataSource } from 'typeorm';
import { InfoBuyerIdentity } from './entities/info-buyer-identity.entity';

export const infoBuyerIdentityProviders = [
  {
    provide: 'INFO_BUYER_IDENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InfoBuyerIdentity),
    inject: ['DATA_SOURCE'],
  },
];
