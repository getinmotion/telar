import { DataSource } from 'typeorm';
import { SuggestProductsDraft } from './entities/suggest-products-draft.entity';

export const suggestProductsDraftProviders = [
  {
    provide: 'SUGGEST_PRODUCTS_DRAFT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SuggestProductsDraft),
    inject: ['DATA_SOURCE'],
  },
];
