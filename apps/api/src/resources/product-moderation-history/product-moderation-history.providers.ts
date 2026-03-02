import { DataSource } from 'typeorm';
import { ProductModerationHistory } from './entities/product-moderation-history.entity';

export const productModerationHistoryProviders = [
  {
    provide: 'PRODUCT_MODERATION_HISTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductModerationHistory),
    inject: ['DATA_SOURCE'],
  },
];
