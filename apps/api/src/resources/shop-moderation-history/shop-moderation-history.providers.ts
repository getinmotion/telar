import { DataSource } from 'typeorm';
import { ShopModerationHistory } from './entities/shop-moderation-history.entity';

export const shopModerationHistoryProviders = [
  {
    provide: 'SHOP_MODERATION_HISTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ShopModerationHistory),
    inject: ['DATA_SOURCE'],
  },
];
